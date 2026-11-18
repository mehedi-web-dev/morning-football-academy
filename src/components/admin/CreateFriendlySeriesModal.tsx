"use client";

import { useState } from "react";
import { X, Swords, AlertCircle, Shield } from "lucide-react";
import {
  apiClient,
  CreateFriendlySeriesInput,
  FriendlySeriesDocument,
  FriendlySeriesFormat,
  FriendlySeriesStatus,
  FriendlyTeamSummary,
  UpdateFriendlySeriesInput,
} from "../../lib/api-client";

interface CreateFriendlySeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesToEdit: FriendlySeriesDocument | null;
  availableTeams: FriendlyTeamSummary[];
  onSuccess: (saved: FriendlySeriesDocument, message: string) => void;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CreateFriendlySeriesInner({
  seriesToEdit,
  availableTeams,
  onClose,
  onSuccess,
}: {
  seriesToEdit: FriendlySeriesDocument | null;
  availableTeams: FriendlyTeamSummary[];
  onClose: () => void;
  onSuccess: (saved: FriendlySeriesDocument, message: string) => void;
}) {
  const isEditing = Boolean(seriesToEdit);

  const [name, setName] = useState(seriesToEdit?.name ?? "");
  const [slug, setSlug] = useState(seriesToEdit?.slug ?? "");
  const [season, setSeason] = useState(seriesToEdit?.season ?? "2026");
  const [format, setFormat] = useState<FriendlySeriesFormat>(
    seriesToEdit?.format ?? "best_of_3"
  );
  const [teamAId, setTeamAId] = useState(
    seriesToEdit?.teamAId ?? (availableTeams[0]?._id || "")
  );
  const [teamBId, setTeamBId] = useState(
    seriesToEdit?.teamBId ?? (availableTeams[1]?._id || "")
  );
  const [venue, setVenue] = useState(seriesToEdit?.venue ?? "একাডেমি মেইন গ্রাউন্ড");
  const [description, setDescription] = useState(seriesToEdit?.description ?? "");
  const [status, setStatus] = useState<FriendlySeriesStatus>(
    seriesToEdit?.status ?? "upcoming"
  );
  const [startDate, setStartDate] = useState(
    seriesToEdit?.startDate
      ? new Date(seriesToEdit.startDate).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    seriesToEdit?.endDate
      ? new Date(seriesToEdit.endDate).toISOString().split("T")[0]
      : ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generated = generateSlug(val);
      if (generated) setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("সিরিজের নাম আবশ্যক।");
      return;
    }
    if (!slug.trim()) {
      setError("স্লাগ আবশ্যক।");
      return;
    }

    if (!isEditing) {
      if (!teamAId || !teamBId) {
        setError("উভয় দল (দল ১ ও দল ২) নির্বাচন করা আবশ্যক।");
        return;
      }
      if (teamAId === teamBId) {
        setError("দল ১ এবং দল ২ অবশ্যই দুটি ভিন্ন দল হতে হবে। একই দল দুবার নির্বাচন করা যাবে না।");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && seriesToEdit) {
        const updatePayload: UpdateFriendlySeriesInput = {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          season: season.trim(),
          description: description.trim() || undefined,
          venue: venue.trim() || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };

        const res = await apiClient.friendlySeries.update(seriesToEdit._id, updatePayload);
        if (res.data) {
          onSuccess(res.data, "ফ্রেন্ডলি সিরিজ সফলভাবে হালনাগাদ করা হয়েছে।");
          onClose();
        }
      } else {
        const createPayload: CreateFriendlySeriesInput = {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          season: season.trim(),
          format,
          teamAId,
          teamBId,
          description: description.trim() || undefined,
          venue: venue.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };

        const res = await apiClient.friendlySeries.create(createPayload);
        if (res.data) {
          onSuccess(res.data, "নতুন ফ্রেন্ডলি সিরিজ সফলভাবে তৈরি হয়েছে।");
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ফ্রেন্ডলি সিরিজ সংরক্ষণ করতে সমস্যা হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "ফ্রেন্ডলি সিরিজ সম্পাদনা" : "নতুন ফ্রেন্ডলি সিরিজ তৈরি"}
              </h2>
              <p className="text-xs text-slate-400">
                দুটি বিদ্যমান একাডেমি দলের মধ্যে বেস্ট অব ৩ অথবা বেস্ট অব ৫ সিরিজ গঠন করুন।
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
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm flex-shrink-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              সিরিজের নাম <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="উদা: একাডেমি ডার্বি সিরিজ ২০২৬"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                স্লাগ (URL Slug) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="academy-derby-series-2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সিজন (Season) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Format Selection (Only on create) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সিরিজ ফরম্যাট <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("best_of_3")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    format === "best_of_3"
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold text-sm block">বেস্ট অব ৩ (Best of 3)</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    সর্বোচ্চ ৩ ম্যাচ • ২ জয়ে চ্যাম্পিয়ন
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("best_of_5")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    format === "best_of_5"
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold text-sm block">বেস্ট অব ৫ (Best of 5)</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    সর্বোচ্চ ৫ ম্যাচ • ৩ জয়ে চ্যাম্পিয়ন
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Team Selection (Only on create) */}
          {!isEditing ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                অংশগ্রহণকারী দল নির্বাচন (ঠিক দুটি ভিন্ন একাডেমি দল)
              </span>

              {availableTeams.length < 2 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  একাডেমি ডাটাবেজে কমপক্ষে ২টি দল নিবন্ধিত থাকতে হবে। অনুগ্রহ করে টুর্নামেন্ট মডিউলে দল তৈরি করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      দল ১ (Team A) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={teamAId}
                      onChange={(e) => setTeamAId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      required
                    >
                      <option value="">-- দল ১ নির্বাচন করুন --</option>
                      {availableTeams.map((t) => (
                        <option
                          key={t._id}
                          value={t._id}
                          disabled={t._id === teamBId}
                        >
                          {t.name} {t.shortCode ? `(${t.shortCode})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      দল ২ (Team B) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={teamBId}
                      onChange={(e) => setTeamBId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      required
                    >
                      <option value="">-- দল ২ নির্বাচন করুন --</option>
                      {availableTeams.map((t) => (
                        <option
                          key={t._id}
                          value={t._id}
                          disabled={t._id === teamAId}
                        >
                          {t.name} {t.shortCode ? `(${t.shortCode})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সিরিজ স্ট্যাটাস
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FriendlySeriesStatus)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="upcoming">আসন্ন (Upcoming)</option>
                <option value="ongoing">চলমান (Ongoing)</option>
                <option value="completed">সমাপ্ত (Completed)</option>
                <option value="cancelled">বাতিল (Cancelled)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                শুরুর তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সমাপ্তির তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              সিরিজের বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="এই ফ্রেন্ডলি সিরিজের বিশেষ নিয়ম বা বিবরণ..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
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
              disabled={isSubmitting || (!isEditing && (!teamAId || !teamBId || teamAId === teamBId))}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "সংরক্ষণ হচ্ছে..."
                : isEditing
                ? "সিরিজ হালনাগাদ করুন"
                : "সিরিজ তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateFriendlySeriesModal({
  isOpen,
  onClose,
  seriesToEdit,
  availableTeams,
  onSuccess,
}: CreateFriendlySeriesModalProps) {
  if (!isOpen) return null;

  return (
    <CreateFriendlySeriesInner
      key={seriesToEdit?._id || "new"}
      seriesToEdit={seriesToEdit}
      availableTeams={availableTeams}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}