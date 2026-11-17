"use client";

import { useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import {
  apiClient,
  TournamentMatchDocument,
  TournamentTeamDocument,
  ScheduleTournamentMatchInput,
  TournamentMatchStatus,
} from "../../lib/api-client";
import { toBnNum, getBnRound } from "../../lib/bn-utils";

interface TournamentMatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  match: TournamentMatchDocument | null;
  homeTeam?: TournamentTeamDocument;
  awayTeam?: TournamentTeamDocument;
  onSuccess: (updatedMatch: TournamentMatchDocument, message: string) => void;
}

const MATCH_STATUS_OPTIONS: { label: string; value: TournamentMatchStatus }[] = [
  { label: "নির্ধারিত (Scheduled)", value: "scheduled" },
  { label: "লাইভ চলছে (Live)", value: "live" },
  { label: "সমাপ্ত (Completed)", value: "completed" },
  { label: "স্থগিত (Postponed)", value: "postponed" },
  { label: "বাতিল (Cancelled)", value: "cancelled" },
];

function TournamentMatchScheduleInner({
  tournamentId,
  match,
  homeTeam,
  awayTeam,
  onClose,
  onSuccess,
}: {
  tournamentId: string;
  match: TournamentMatchDocument;
  homeTeam?: TournamentTeamDocument;
  awayTeam?: TournamentTeamDocument;
  onClose: () => void;
  onSuccess: (updatedMatch: TournamentMatchDocument, message: string) => void;
}) {
  const [matchDate, setMatchDate] = useState(
    match.matchDate ? new Date(match.matchDate).toISOString().split("T")[0] : ""
  );
  const [kickOffTime, setKickOffTime] = useState(match.kickOffTime || "");
  const [venue, setVenue] = useState(match.venue || "একাডেমি মেইন গ্রাউন্ড");
  const [status, setStatus] = useState<TournamentMatchStatus>(
    match.status || "scheduled"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const schedulePayload: ScheduleTournamentMatchInput = {
        matchDate: matchDate || undefined,
        kickOffTime: kickOffTime || undefined,
        venue: venue?.trim() || undefined,
        status,
      };

      const res = await apiClient.tournaments.scheduleMatch(
        tournamentId,
        match._id,
        schedulePayload
      );

      if (res.data) {
        onSuccess(res.data, "ম্যাচের সময়সূচি ও ভেন্যু সফলভাবে হালনাগাদ করা হয়েছে।");
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "সময়সূচি হালনাগাদ করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinal = match.stage === "final";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                ম্যাচ সময়সূচি ও ভেন্যু নির্ধারণ
              </h2>
              <p className="text-xs text-slate-400">
                {isFinal
                  ? `গ্র্যান্ড ফাইনাল • ম্যাচ ${toBnNum(match.matchNumber)}`
                  : `${getBnRound(match.round || 1)} • ম্যাচ ${toBnNum(match.matchNumber)}`}
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

        {/* Match Teams Callout */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-around text-center">
          <div>
            <span className="font-bold text-sm text-white block">
              {homeTeam?.name || "হোম দল"}
            </span>
            <span className="text-[10px] text-slate-400">হোম</span>
          </div>
          <span className="text-xs font-bold text-slate-500">বনাম</span>
          <div>
            <span className="font-bold text-sm text-white block">
              {awayTeam?.name || "অ্যাওয়ে দল"}
            </span>
            <span className="text-[10px] text-slate-400">অ্যাওয়ে</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                ম্যাচের তারিখ
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ভেন্যু / মাঠ
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="একাডেমি মেইন গ্রাউন্ড"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ম্যাচ স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TournamentMatchStatus)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "সময়সূচি সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentMatchScheduleModal({
  isOpen,
  onClose,
  tournamentId,
  match,
  homeTeam,
  awayTeam,
  onSuccess,
}: TournamentMatchScheduleModalProps) {
  if (!isOpen || !match) return null;

  return (
    <TournamentMatchScheduleInner
      key={match._id}
      tournamentId={tournamentId}
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
