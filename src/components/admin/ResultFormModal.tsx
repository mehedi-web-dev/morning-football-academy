"use client";

import { useState, useEffect } from "react";
import {
  X,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  ResultDocument,
  CreateResultInput,
  MatchDocument,
  ApiError,
} from "../../lib/api-client";
import { formatBnDate } from "../../lib/bn-utils";

interface ResultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultToEdit?: ResultDocument | null;
  onSuccess: (savedResult: ResultDocument, isEdit: boolean) => void;
}

/**
 * Format date for display in match selector
 */
function formatShortDate(dateStr: string): string {
  try {
    return formatBnDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * ResultFormInner Component
 * Stateful form content remounted via key when resultToEdit changes
 */
function ResultFormInner({
  resultToEdit,
  onClose,
  onSuccess,
}: {
  resultToEdit?: ResultDocument | null;
  onClose: () => void;
  onSuccess: (savedResult: ResultDocument, isEdit: boolean) => void;
}) {
  const isEdit = Boolean(resultToEdit);

  // Available Matches for selection
  const [availableMatches, setAvailableMatches] = useState<MatchDocument[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // Form Fields State initialized from props
  const [matchId, setMatchId] = useState(resultToEdit?.matchId ?? "");
  const [opponent, setOpponent] = useState(resultToEdit?.opponent ?? "");
  const [competition, setCompetition] = useState(
    resultToEdit?.competition ?? "Academy Youth League"
  );
  const [venue, setVenue] = useState(
    resultToEdit?.venue ?? "Main Stadium Arena"
  );
  const [matchDate, setMatchDate] = useState(
    resultToEdit?.matchDate
      ? new Date(resultToEdit.matchDate).toISOString().split("T")[0]
      : ""
  );
  const [homeScore, setHomeScore] = useState<number | "">(
    resultToEdit?.homeScore ?? 0
  );
  const [awayScore, setAwayScore] = useState<number | "">(
    resultToEdit?.awayScore ?? 0
  );

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch available matches for selection
  useEffect(() => {
    let isMounted = true;
    apiClient.matches
      .getAll({ limit: 50, sortOrder: "desc" })
      .then((res) => {
        if (isMounted) {
          setAvailableMatches(res.data || []);
          setIsLoadingMatches(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingMatches(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // When admin selects a match, populate the related details automatically
  const handleSelectMatch = (selectedId: string) => {
    setMatchId(selectedId);
    const found = availableMatches.find((m) => m._id === selectedId);
    if (found) {
      setOpponent(found.opponent);
      setCompetition(found.competition);
      setVenue(found.venue);
      if (found.matchDate) {
        setMatchDate(new Date(found.matchDate).toISOString().split("T")[0]);
      }
    }
  };

  // Compute live outcome preview from academy perspective
  const numericHome = homeScore === "" ? 0 : Number(homeScore);
  const numericAway = awayScore === "" ? 0 : Number(awayScore);
  const liveOutcome =
    numericHome > numericAway
      ? "WIN"
      : numericHome === numericAway
      ? "DRAW"
      : "LOSS";

  // Client-Side Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!matchId.trim()) {
      errors.matchId = "অনুগ্রহ করে একটি বৈধ রেফারেন্সড ম্যাচ আইডি নির্বাচন করুন বা প্রদান করুন।";
    } else if (!/^[0-9a-fA-F]{24}$/.test(matchId.trim())) {
      errors.matchId = "ম্যাচ আইডি অবশ্যই একটি বৈধ ২৪-অক্ষরের হেক্সাডেসিমেল ObjectId হতে হবে।";
    }

    if (!opponent.trim() || opponent.trim().length < 2) {
      errors.opponent = "প্রতিপক্ষ ক্লাবের নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!competition.trim() || competition.trim().length < 2) {
      errors.competition = "প্রতিযোগিতার নাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!venue.trim() || venue.trim().length < 2) {
      errors.venue = "ম্যাচ ভেন্যু কমপক্ষে ২ অক্ষরের হতে হবে।";
    }

    if (!matchDate) {
      errors.matchDate = "ম্যাচের তারিখ আবশ্যক।";
    } else {
      const parsedDate = new Date(matchDate);
      if (isNaN(parsedDate.getTime())) {
        errors.matchDate = "অকার্যকর তারিখ ফরম্যাট।";
      }
    }

    if (homeScore === "" || isNaN(numericHome) || numericHome < 0 || !Number.isInteger(numericHome)) {
      errors.homeScore = "হোম স্কোর অবশ্যই একটি অঋণাত্মক পূর্ণসংখ্যা হতে হবে (০ বা তার বেশি)।";
    }

    if (awayScore === "" || isNaN(numericAway) || numericAway < 0 || !Number.isInteger(numericAway)) {
      errors.awayScore = "অ্যাওয়ে স্কোর অবশ্যই একটি অঋণাত্মক পূর্ণসংখ্যা হতে হবে (০ বা তার বেশি)।";
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

    const payload: CreateResultInput = {
      matchId: matchId.trim(),
      opponent: opponent.trim(),
      competition: competition.trim(),
      venue: venue.trim(),
      matchDate,
      homeScore: numericHome,
      awayScore: numericAway,
    };

    try {
      if (isEdit && resultToEdit) {
        const response = await apiClient.results.update(resultToEdit._id, payload);
        onSuccess(response.data, true);
      } else {
        const response = await apiClient.results.create(payload);
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
        setFormError("ম্যাচ ফলাফল সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সার্ভার সংযোগ পরীক্ষা করুন।");
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
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="result-form-title"
              className="text-base sm:text-xl font-black text-white uppercase tracking-tight"
            >
              {isEdit ? "ম্যাচ ফলাফল সম্পাদনা" : "ম্যাচ ফলাফল রেকর্ড করুন"}
            </h2>
            <span className="text-[11px] font-mono text-[#A4B0A8] block">
              {isEdit
                ? `${resultToEdit?.opponent}-এর বিরুদ্ধে ম্যাচের স্কোরলাইন আপডেট করা হচ্ছে`
                : "চূড়ান্ত স্কোরলাইন জমা দিন, গোল যাচাই করুন এবং সিজন রেকর্ড আপডেট করুন"}
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

        {/* Section 1: Referenced Match Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            ১. সংযুক্ত ফিক্সচার নির্বাচন
          </h3>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                একাডেমি ফিক্সচার নির্বাচন করুন <span className="text-red-400">*</span>
              </label>

              {isLoadingMatches ? (
                <div className="p-2.5 rounded-xl bg-[#101A17] border border-white/10 text-xs text-[#A4B0A8] font-mono animate-pulse">
                  ডাটাবেস থেকে নির্ধারিত ফিক্সচার লোড হচ্ছে...
                </div>
              ) : availableMatches.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <p className="font-bold">ডাটাবেসে কোনো ম্যাচ ফিক্সচার পাওয়া যায়নি।</p>
                  <p className="text-[11px] text-amber-300/80">
                    আপনি প্রথমে ম্যাচ মেনু থেকে ফিক্সচার শিডিউল করতে পারেন অথবা নিচে ম্যানুয়ালি ২৪ অক্ষরের ম্যাচ আইডি দিতে পারেন।
                  </p>
                </div>
              ) : (
                <select
                  value={matchId}
                  onChange={(e) => handleSelectMatch(e.target.value)}
                  className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
                >
                  <option value="">-- নির্ধারিত একটি ফিক্সচার বেছে নিন --</option>
                  {availableMatches.map((m) => (
                    <option key={m._id} value={m._id} className="bg-[#18251F] text-white">
                      বনাম {m.opponent} ({formatShortDate(m.matchDate)}) - {m.competition}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Match ID Field */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block flex items-center justify-between">
              <span>রেফারেন্সড ম্যাচ ObjectId <span className="text-red-400">*</span></span>
              {isEdit && (
                <span className="text-[10px] text-[#A4B0A8]">স্থায়ী সংযোগ</span>
              )}
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                readOnly={isEdit}
                placeholder="২৪ অক্ষরের হেক্সাডেসিমেল MongoDB ObjectId (যেমনঃ 6af293f0...)"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none transition-colors ${
                  isEdit ? "opacity-75 cursor-not-allowed" : ""
                } ${
                  fieldErrors.matchId
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
            </div>
            {fieldErrors.matchId && (
              <p className="text-[11px] text-red-400 font-mono">
                {fieldErrors.matchId}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Scoreline & Outcome Preview */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            ২. অফিসিয়াল স্কোরলাইন ও ফলাফল
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MFA Home Score */}
            <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 space-y-2">
              <label className="text-xs font-mono uppercase text-[#B9F66B] font-bold tracking-wider block">
                Morning Football Academy (হোম) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={homeScore}
                onChange={(e) =>
                  setHomeScore(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className={`w-full bg-[#18251F] border rounded-xl px-4 py-3 text-2xl font-mono font-black text-[#B9F66B] text-center focus:outline-none transition-colors ${
                  fieldErrors.homeScore
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]"
                }`}
              />
              {fieldErrors.homeScore && (
                <p className="text-[11px] text-red-400 font-mono text-center">
                  {fieldErrors.homeScore}
                </p>
              )}
            </div>

            {/* Opponent Away Score */}
            <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 space-y-2">
              <label className="text-xs font-mono uppercase text-white font-bold tracking-wider block truncate">
                {opponent || "প্রতিপক্ষ দল"} (অ্যাওয়ে) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={awayScore}
                onChange={(e) =>
                  setAwayScore(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className={`w-full bg-[#18251F] border rounded-xl px-4 py-3 text-2xl font-mono font-black text-white text-center focus:outline-none transition-colors ${
                  fieldErrors.awayScore
                    ? "border-red-500"
                    : "border-white/10 focus:border-white/40"
                }`}
              />
              {fieldErrors.awayScore && (
                <p className="text-[11px] text-red-400 font-mono text-center">
                  {fieldErrors.awayScore}
                </p>
              )}
            </div>
          </div>

          {/* Live Outcome Badge Preview */}
          <div className="p-3 rounded-xl bg-[#101A17] border border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-[#A4B0A8] uppercase">
              হিসাবকৃত ফলাফল:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-md text-xs font-mono font-black uppercase tracking-wider ${
                  liveOutcome === "WIN"
                    ? "bg-[#B9F66B]/20 text-[#B9F66B] border border-[#B9F66B]/40"
                    : liveOutcome === "DRAW"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {liveOutcome === "WIN" ? "জয়" : liveOutcome === "DRAW" ? "ড্র" : "পরাজয়"}
              </span>
              <span className="text-[11px] font-mono text-[#A4B0A8]">
                {liveOutcome === "WIN"
                  ? "(একাডেমি বিজয়)"
                  : liveOutcome === "DRAW"
                  ? "(সমতা)"
                  : "(একাডেমি পরাজয়)"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Match Details */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            ৩. ফিক্সচার মেটাডাটা
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
                placeholder="যেমনঃ Green Valley FC"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.opponent
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.opponent && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.opponent}
                </p>
              )}
            </div>

            {/* Competition */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                প্রতিযোগিতা / টুর্নামেন্ট <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমনঃ Youth Premier Cup"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.competition
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.competition && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.competition}
                </p>
              )}
            </div>

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
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.matchDate && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.matchDate}
                </p>
              )}
            </div>

            {/* Venue */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                ম্যাচ ভেন্যু <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমনঃ Academy Main Arena"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.venue
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.venue && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.venue}
                </p>
              )}
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
                <span>ফলাফল আপডেট করুন</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>স্কোর রেকর্ড করুন</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * ResultFormModal Component
 * Mounts ResultFormInner with dynamic key to ensure clean initial state
 */
export default function ResultFormModal({
  isOpen,
  onClose,
  resultToEdit,
  onSuccess,
}: ResultFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-form-title"
    >
      <ResultFormInner
        key={resultToEdit?._id ?? "new-result"}
        resultToEdit={resultToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
