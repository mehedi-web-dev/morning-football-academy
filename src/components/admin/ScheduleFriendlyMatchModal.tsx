"use client";

import { useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import {
  apiClient,
  FriendlyMatchStatus,
  FriendlySeriesDocument,
  FriendlySeriesMatchDocument,
  FriendlyTeamSummary,
  ScheduleFriendlyMatchInput,
  UpdateFriendlyMatchScheduleInput,
} from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";

interface ScheduleFriendlyMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: FriendlySeriesDocument;
  teamA?: FriendlyTeamSummary;
  teamB?: FriendlyTeamSummary;
  existingMatches: FriendlySeriesMatchDocument[];
  matchToEdit: FriendlySeriesMatchDocument | null;
  onSuccess: (savedMatch: FriendlySeriesMatchDocument, message: string) => void;
}

const MATCH_STATUS_OPTIONS: { label: string; value: FriendlyMatchStatus }[] = [
  { label: "নির্ধারিত (Scheduled)", value: "scheduled" },
  { label: "লাইভ চলছে (Live)", value: "live" },
  { label: "সমাপ্ত (Completed)", value: "completed" },
  { label: "স্থগিত (Postponed)", value: "postponed" },
  { label: "বাতিল (Cancelled)", value: "cancelled" },
];

function ScheduleFriendlyMatchInner({
  series,
  teamA,
  teamB,
  existingMatches,
  matchToEdit,
  onClose,
  onSuccess,
}: {
  series: FriendlySeriesDocument;
  teamA?: FriendlyTeamSummary;
  teamB?: FriendlyTeamSummary;
  existingMatches: FriendlySeriesMatchDocument[];
  matchToEdit: FriendlySeriesMatchDocument | null;
  onClose: () => void;
  onSuccess: (savedMatch: FriendlySeriesMatchDocument, message: string) => void;
}) {
  const isEditing = Boolean(matchToEdit);
  const maxMatches = series.format === "best_of_5" ? 5 : 3;

  // Auto-assign next available match number for new match
  const nextAvailableNumber = (() => {
    if (isEditing && matchToEdit) return matchToEdit.matchNumber;
    const used = new Set(existingMatches.map((m) => m.matchNumber));
    for (let i = 1; i <= maxMatches; i++) {
      if (!used.has(i)) return i;
    }
    return existingMatches.length + 1;
  })();

  const [matchNumber, setMatchNumber] = useState<number>(
    matchToEdit?.matchNumber ?? nextAvailableNumber
  );
  const [homeTeamId, setHomeTeamId] = useState<string>(
    matchToEdit?.homeTeamId ?? (series.teamAId || "")
  );
  const [awayTeamId, setAwayTeamId] = useState<string>(
    matchToEdit?.awayTeamId ?? (series.teamBId || "")
  );
  const [matchDate, setMatchDate] = useState<string>(
    matchToEdit?.matchDate
      ? new Date(matchToEdit.matchDate).toISOString().split("T")[0]
      : ""
  );
  const [kickOffTime, setKickOffTime] = useState<string>(
    matchToEdit?.kickOffTime || "16:00"
  );
  const [venue, setVenue] = useState<string>(
    matchToEdit?.venue || series.venue || "একাডেমি মেইন গ্রাউন্ড"
  );
  const [status, setStatus] = useState<FriendlyMatchStatus>(
    matchToEdit?.status || "scheduled"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (homeTeamId === awayTeamId) {
      setError("হোম দল এবং অ্যাওয়ে দল একই হতে পারে না।");
      return;
    }

    if (matchNumber > maxMatches) {
      setError(`এই ফরম্যাটে (${series.format === "best_of_5" ? "বেস্ট অব ৫" : "বেস্ট অব ৩"}) সর্বোচ্চ ${toBnNum(maxMatches)}টি ম্যাচ নির্ধারণ করা সম্ভব।`);
      return;
    }

    if (!isEditing) {
      const alreadyExists = existingMatches.some((m) => m.matchNumber === matchNumber);
      if (alreadyExists) {
        setError(`ম্যাচ #${toBnNum(matchNumber)} ইতিমধ্যে নির্ধারিত রয়েছে। অন্য ম্যাচ নম্বর নির্বাচন করুন।`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && matchToEdit) {
        const updatePayload: UpdateFriendlyMatchScheduleInput = {
          homeTeamId,
          awayTeamId,
          matchDate: matchDate || undefined,
          kickOffTime: kickOffTime || undefined,
          venue: venue.trim() || undefined,
          status,
        };

        const res = await apiClient.friendlySeries.updateMatchSchedule(
          series._id,
          matchToEdit._id,
          updatePayload
        );
        if (res.data) {
          onSuccess(res.data, `ম্যাচ #${toBnNum(matchNumber)}-এর সময়সূচি সফলভাবে হালনাগাদ হয়েছে।`);
          onClose();
        }
      } else {
        const schedulePayload: ScheduleFriendlyMatchInput = {
          matchNumber,
          homeTeamId,
          awayTeamId,
          matchDate: matchDate || undefined,
          kickOffTime: kickOffTime || undefined,
          venue: venue.trim() || undefined,
          status,
        };

        const res = await apiClient.friendlySeries.scheduleMatch(
          series._id,
          schedulePayload
        );
        if (res.data) {
          onSuccess(res.data, `ম্যাচ #${toBnNum(matchNumber)} সফলভাবে সূচিতে যুক্ত হয়েছে।`);
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ম্যাচের সময়সূচি সংরক্ষণ করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwapHomeAway = () => {
    const temp = homeTeamId;
    setHomeTeamId(awayTeamId);
    setAwayTeamId(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? `ম্যাচ #${toBnNum(matchNumber)} সময়সূচি সম্পাদনা` : "সিরিজের নতুন ম্যাচ নির্ধারণ"}
              </h2>
              <p className="text-xs text-slate-400">
                {series.name} • সর্বোচ্চ {toBnNum(maxMatches)}টি ম্যাচ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Number Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ম্যাচ নম্বর (Match Number) <span className="text-rose-400">*</span>
            </label>
            <select
              value={matchNumber}
              disabled={isEditing}
              onChange={(e) => setMatchNumber(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-60 cursor-pointer"
              required
            >
              {Array.from({ length: maxMatches }, (_, i) => i + 1).map((num) => {
                const isUsed = !isEditing && existingMatches.some((m) => m.matchNumber === num);
                return (
                  <option key={num} value={num} disabled={isUsed}>
                    ম্যাচ {toBnNum(num)} {isUsed ? "(ইতিমধ্যে নির্ধারিত)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Home vs Away Team Selector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                হোম ও অ্যাওয়ে দল নির্ধারণ
              </span>
              <button
                type="button"
                onClick={handleSwapHomeAway}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
              >
                হোম/অ্যাওয়ে অদল-বদল
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">হোম দল (Home)</label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        homeTeamId === teamA?._id ? teamA?.color : teamB?.color,
                    }}
                  />
                  <span className="truncate">
                    {homeTeamId === teamA?._id ? teamA?.name : teamB?.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">অ্যাওয়ে দল (Away)</label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold flex items-center gap-2 truncate">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        awayTeamId === teamA?._id ? teamA?.color : teamB?.color,
                    }}
                  />
                  <span className="truncate">
                    {awayTeamId === teamA?._id ? teamA?.name : teamB?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                ম্যাচের তারিখ
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                কিক-অফ সময় (HH:mm)
              </label>
              <input
                type="time"
                value={kickOffTime}
                onChange={(e) => setKickOffTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ভেন্যু / মাঠ
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="একাডেমি মেইন গ্রাউন্ড"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ম্যাচ স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FriendlyMatchStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {MATCH_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || homeTeamId === awayTeamId}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "সংরক্ষণ হচ্ছে..."
                : isEditing
                ? "সময়সূচি হালনাগাদ করুন"
                : "ম্যাচ নির্ধারণ সম্পন্ন করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ScheduleFriendlyMatchModal({
  isOpen,
  onClose,
  series,
  teamA,
  teamB,
  existingMatches,
  matchToEdit,
  onSuccess,
}: ScheduleFriendlyMatchModalProps) {
  if (!isOpen) return null;

  return (
    <ScheduleFriendlyMatchInner
      key={matchToEdit?._id || `new-${existingMatches.length}`}
      series={series}
      teamA={teamA}
      teamB={teamB}
      existingMatches={existingMatches}
      matchToEdit={matchToEdit}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}