"use client";

import { useState } from "react";
import { X, Trophy, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  apiClient,
  TournamentDocument,
  CreateTournamentInput,
  UpdateTournamentInput,
} from "../../lib/api-client";

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentToEdit: TournamentDocument | null;
  onSuccess: (savedTournament: TournamentDocument, message: string) => void;
}

function TournamentFormInner({
  tournamentToEdit,
  onClose,
  onSuccess,
}: {
  tournamentToEdit: TournamentDocument | null;
  onClose: () => void;
  onSuccess: (savedTournament: TournamentDocument, message: string) => void;
}) {
  const isEditing = Boolean(tournamentToEdit);

  const [formData, setFormData] = useState<CreateTournamentInput>({
    name: tournamentToEdit?.name ?? "",
    slug: tournamentToEdit?.slug ?? "",
    season: tournamentToEdit?.season ?? new Date().getFullYear().toString(),
    description: tournamentToEdit?.description ?? "",
    startDate: tournamentToEdit?.startDate
      ? new Date(tournamentToEdit.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    endDate: tournamentToEdit?.endDate
      ? new Date(tournamentToEdit.endDate).toISOString().split("T")[0]
      : "",
    venue: tournamentToEdit?.venue ?? "একাডেমি মেইন গ্রাউন্ড",
  });

  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name };
      if (autoSlug && !isEditing) {
        updated.slug = generateSlug(name);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("টুর্নামেন্টের নাম আবশ্যক।");
      return;
    }
    if (!formData.slug.trim()) {
      setError("টুর্নামেন্টের স্লাগ (URL slug) আবশ্যক।");
      return;
    }
    if (!formData.season.trim()) {
      setError("টুর্নামেন্টের সিজন আবশ্যক।");
      return;
    }
    if (!formData.startDate) {
      setError("টুর্নামেন্ট শুরুর তারিখ আবশ্যক।");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && tournamentToEdit) {
        const updatePayload: UpdateTournamentInput = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          season: formData.season.trim(),
          description: formData.description?.trim() || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          venue: formData.venue?.trim() || undefined,
        };

        const res = await apiClient.tournaments.update(tournamentToEdit._id, updatePayload);
        if (res.data) {
          onSuccess(res.data, "টুর্নামেন্ট সফলভাবে হালনাগাদ করা হয়েছে।");
          onClose();
        }
      } else {
        const createPayload: CreateTournamentInput = {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          season: formData.season.trim(),
          description: formData.description?.trim() || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          venue: formData.venue?.trim() || undefined,
        };

        const res = await apiClient.tournaments.create(createPayload);
        if (res.data) {
          onSuccess(res.data, "নতুন টুর্নামেন্ট সফলভাবে তৈরি করা হয়েছে।");
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "টুর্নামেন্ট সংরক্ষণ করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "টুর্নামেন্ট সম্পাদনা" : "নতুন টুর্নামেন্ট তৈরি"}
              </h2>
              <p className="text-xs text-slate-400">
                কমপক্ষে ৩টি দল ও প্রতি দলে ৫–৬ জন খেলোয়াড়ের একাডেমি টুর্নামেন্ট
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              টুর্নামেন্টের নাম <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="উদা: Morning Champions Trophy"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  স্লাগ (URL) <span className="text-rose-400">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    {autoSlug ? "ম্যানুয়াল এডিট" : "অটো-জেনারেট"}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="morning-champions-trophy-2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সিজন <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, season: e.target.value }))
                }
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                শুরুর তারিখ <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                সমাপ্তির তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
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
              value={formData.venue}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, venue: e.target.value }))
              }
              placeholder="একাডেমি মেইন গ্রাউন্ড"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="টুর্নামেন্ট সম্পর্কে সংক্ষিপ্ত তথ্য বা বিশেষ নির্দেশনা..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              স্বয়ংক্রিয় নিয়ম ও ফরম্যাট কাঠামো:
            </div>
            <p className="text-slate-300">
              কমপক্ষে ৩টি দল • প্রতি দলে ৫–৬ জন খেলোয়াড় (কোনো অতিরিক্ত নেই) • সিঙ্গেল রাউন্ড-রবিন লিগ • শীর্ষ ২ দলের গ্র্যান্ড ফাইনাল।
            </p>
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
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "সংরক্ষণ হচ্ছে..."
                : isEditing
                ? "হালনাগাদ সংরক্ষণ করুন"
                : "টুর্নামেন্ট তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentFormModal({
  isOpen,
  onClose,
  tournamentToEdit,
  onSuccess,
}: TournamentFormModalProps) {
  if (!isOpen) return null;

  return (
    <TournamentFormInner
      key={tournamentToEdit?._id || "new"}
      tournamentToEdit={tournamentToEdit}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
