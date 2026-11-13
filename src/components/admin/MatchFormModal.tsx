"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  MatchDocument,
  CreateMatchInput,
  MatchStatus,
  MatchHomeAway,
  ApiError,
} from "../../lib/api-client";

interface MatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchToEdit?: MatchDocument | null;
  onSuccess: (savedMatch: MatchDocument, isEdit: boolean) => void;
}

const MATCH_STATUS_OPTIONS: { label: string; value: MatchStatus }[] = [
  { label: "আসন্ন ফিক্সচার", value: "upcoming" },
  { label: "লাইভ চলছে", value: "live" },
  { label: "পূর্ণ সময় / সমাপ্ত", value: "completed" },
  { label: "স্থগিত", value: "postponed" },
  { label: "বাতিল", value: "cancelled" },
];

const COMPETITION_PRESETS = [
  "Academy Youth League",
  "Youth Premier Cup",
  "Regional Championship",
  "Friendly Invitational",
  "National Cup Qualifier",
];

const VENUE_PRESETS = [
  "Main Stadium Arena",
  "Academy Training Facility",
  "Away Sports Complex",
  "North Training Pitch 2",
];

/**
 * MatchFormInner Component
 * Stateful form content remounted via key when matchToEdit changes
 */
function MatchFormInner({
  matchToEdit,
  onClose,
  onSuccess,
}: {
  matchToEdit?: MatchDocument | null;
  onClose: () => void;
  onSuccess: (savedMatch: MatchDocument, isEdit: boolean) => void;
}) {
  const isEdit = Boolean(matchToEdit);

  // Form Fields State initialized from props
  const [opponent, setOpponent] = useState(matchToEdit?.opponent ?? "");
  const [opponentLogo, setOpponentLogo] = useState(matchToEdit?.opponentLogo ?? "");
  const [competition, setCompetition] = useState(
    matchToEdit?.competition ?? "Academy Youth League"
  );
  const [venue, setVenue] = useState(matchToEdit?.venue ?? "Main Stadium Arena");
  const [matchDate, setMatchDate] = useState(
    matchToEdit?.matchDate
      ? new Date(matchToEdit.matchDate).toISOString().split("T")[0]
      : ""
  );
  const [kickOffTime, setKickOffTime] = useState(matchToEdit?.kickOffTime ?? "15:00");
  const [homeAway, setHomeAway] = useState<MatchHomeAway>(matchToEdit?.homeAway ?? "home");
  const [status, setStatus] = useState<MatchStatus>(matchToEdit?.status ?? "upcoming");

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client-Side Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!opponent.trim() || opponent.trim().length < 2) {
      errors.opponent = "প্রতিপক্ষ ক্লাবের নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!competition.trim() || competition.trim().length < 2) {
      errors.competition = "টুর্নামেন্ট বা প্রতিযোগিতার নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!venue.trim() || venue.trim().length < 2) {
      errors.venue = "ম্যাচ ভেন্যু কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!matchDate) {
      errors.matchDate = "ম্যাচের তারিখ নির্বাচন করা আবশ্যক।";
    } else {
      const parsedDate = new Date(matchDate);
      if (isNaN(parsedDate.getTime())) {
        errors.matchDate = "অকার্যকর তারিখ ফরম্যাট।";
      }
    }

    // HH:mm regex
    if (!kickOffTime.trim() || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(kickOffTime.trim())) {
      errors.kickOffTime = "কিক-অফ সময় ২৪-ঘণ্টা HH:mm ফরম্যাটে হতে হবে (যেমনঃ 15:00 বা 10:30)।";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload: CreateMatchInput = {
      opponent: opponent.trim(),
      opponentLogo: opponentLogo.trim() || undefined,
      competition: competition.trim(),
      venue: venue.trim(),
      matchDate,
      kickOffTime: kickOffTime.trim(),
      homeAway,
      status,
    };

    try {
      if (isEdit && matchToEdit) {
        const response = await apiClient.matches.update(matchToEdit._id, payload);
        onSuccess(response.data, true);
      } else {
        const response = await apiClient.matches.create(payload);
        onSuccess(response.data, false);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (Array.isArray(err.details)) {
          const serverErrors: Record<string, string> = {};
          err.details.forEach((item: { field: string; message: string }) => {
            if (item.field) {
              serverErrors[item.field] = item.message;
            }
          });
          setFieldErrors(serverErrors);
        }
      } else {
        setFormError("ম্যাচ সূচি সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সার্ভার সংযোগ পরীক্ষা করুন।");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl my-8 bg-[#18251F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
      {/* Modal Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#18251F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101A17] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="match-form-title"
              className="text-base sm:text-xl font-black text-white uppercase tracking-tight"
            >
              {isEdit ? "ম্যাচ ফিক্সচার সম্পাদনা" : "নতুন ফিক্সচার নির্ধারণ"}
            </h2>
            <span className="text-[11px] font-mono text-[#A4B0A8] block">
              {isEdit
                ? `${matchToEdit?.opponent}-এর বিরুদ্ধে ম্যাচের তথ্য আপডেট করা হচ্ছে`
                : "ডাটাবেসে নতুন ম্যাচ বা টুর্নামেন্ট ফিক্সচার যোগ করুন"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-2 rounded-xl text-[#A4B0A8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Global Error Banner */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-white flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs text-red-200">{formError}</p>
          </div>
        )}

        {/* Section 1: Teams & Competition */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            ১. প্রতিপক্ষ ও প্রতিযোগিতা
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opponent */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                প্রতিপক্ষ ক্লাবের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমনঃ City Rovers Academy"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.opponent
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.opponent && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.opponent}
                </p>
              )}
            </div>

            {/* Opponent Logo (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                প্রতিপক্ষ লোগো ইউআরএল (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমনঃ /images/opponents/rovers.png"
                value={opponentLogo}
                onChange={(e) => setOpponentLogo(e.target.value)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
              />
            </div>

            {/* Competition with Presets */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                প্রতিযোগিতা / টুর্নামেন্ট <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমনঃ Academy Youth League"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.competition
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.competition && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.competition}
                </p>
              )}

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-[#A4B0A8]">প্রিসেট:</span>
                {COMPETITION_PRESETS.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setCompetition(comp)}
                    className="px-2 py-0.5 rounded-md bg-[#101A17] hover:bg-white/10 text-[10px] font-mono text-[#A4B0A8] hover:text-white border border-white/5 transition-colors"
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Date, Time & Logistics */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            ২. সূচি ও ভেন্যু
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Match Date */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                ম্যাচের তারিখ <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors ${
                  fieldErrors.matchDate
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.matchDate && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.matchDate}
                </p>
              )}
            </div>

            {/* Kick-off Time */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                কিক-অফ সময় (HH:mm, ২৪-ঘণ্টা) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="15:00"
                value={kickOffTime}
                onChange={(e) => setKickOffTime(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.kickOffTime
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.kickOffTime && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.kickOffTime}
                </p>
              )}
            </div>

            {/* Venue */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                ম্যাচ ভেন্যু <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমনঃ Main Stadium Arena"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.venue
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.venue && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.venue}
                </p>
              )}

              {/* Venue Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-[#A4B0A8]">প্রিসেট:</span>
                {VENUE_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVenue(v)}
                    className="px-2 py-0.5 rounded-md bg-[#101A17] hover:bg-white/10 text-[10px] font-mono text-[#A4B0A8] hover:text-white border border-white/5 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Home / Away Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                ভেন্যু নির্ধারণ <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHomeAway("home")}
                  className={`py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                    homeAway === "home"
                      ? "bg-[#B9F66B] text-[#101A17] font-black border-[#B9F66B]"
                      : "bg-[#101A17] text-[#A4B0A8] border-white/10 hover:text-white"
                  }`}
                >
                  হোম ম্যাচ
                </button>
                <button
                  type="button"
                  onClick={() => setHomeAway("away")}
                  className={`py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border ${
                    homeAway === "away"
                      ? "bg-[#B9F66B] text-[#101A17] font-black border-[#B9F66B]"
                      : "bg-[#101A17] text-[#A4B0A8] border-white/10 hover:text-white"
                  }`}
                >
                  অ্যাওয়ে ম্যাচ
                </button>
              </div>
            </div>

            {/* Match Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                ম্যাচ স্ট্যাটাস <span className="text-red-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MatchStatus)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
              >
                {MATCH_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#18251F] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onPress={onClose}
            isDisabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>সংরক্ষণ করা হচ্ছে...</span>
            ) : isEdit ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>আপডেট সংরক্ষণ করুন</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ম্যাচ নির্ধারণ করুন</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * MatchFormModal Component
 * Mounts MatchFormInner with dynamic key to ensure clean initial state
 */
export default function MatchFormModal({
  isOpen,
  onClose,
  matchToEdit,
  onSuccess,
}: MatchFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-form-title"
    >
      <MatchFormInner
        key={matchToEdit?._id ?? "new-match"}
        matchToEdit={matchToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
