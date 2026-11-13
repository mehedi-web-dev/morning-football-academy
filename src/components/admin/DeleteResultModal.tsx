"use client";

import { AlertTriangle, Trash2, X, Trophy, Calendar, MapPin } from "lucide-react";
import { Button } from "@heroui/react";
import { ResultDocument } from "../../lib/api-client";
import { formatBnDate, toBnNum } from "../../lib/bn-utils";

interface DeleteResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultDocument | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * DeleteResultModal Component
 * Confirmation dialog preventing accidental removal of match scoreline records
 */
export default function DeleteResultModal({
  isOpen,
  onClose,
  result,
  onConfirm,
  isDeleting,
}: DeleteResultModalProps) {
  if (!isOpen || !result) return null;

  const outcome =
    result.homeScore > result.awayScore
      ? "WIN"
      : result.homeScore === result.awayScore
      ? "DRAW"
      : "LOSS";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-result-title"
    >
      <div className="relative w-full max-w-md bg-[#18251F] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-5 text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#A4B0A8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="delete-result-title"
              className="text-base sm:text-lg font-black text-white uppercase tracking-tight"
            >
              ম্যাচ ফলাফল মুছে ফেলবেন?
            </h3>
            <span className="text-[11px] font-mono text-red-300 block uppercase">
              স্থায়ী স্কোরলাইন অপসারণ
            </span>
          </div>
        </div>

        {/* Result Snapshot Card */}
        <div className="p-4 rounded-xl bg-[#101A17] border border-white/5 space-y-2.5 text-xs text-[#A4B0A8]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white uppercase truncate">
              বনাম {result.opponent}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                outcome === "WIN"
                  ? "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30"
                  : outcome === "DRAW"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-red-500/15 text-red-300 border border-red-500/30"
              }`}
            >
              {outcome === "WIN" ? "জয়" : outcome === "DRAW" ? "ড্র" : "পরাজয়"}
            </span>
          </div>

          {/* Score Box */}
          <div className="p-3 rounded-xl bg-[#18251F] border border-white/10 flex items-center justify-center gap-3 text-lg font-mono font-black">
            <span className="text-[#B9F66B]">MFA {toBnNum(result.homeScore)}</span>
            <span className="text-white/30">-</span>
            <span className="text-white">{toBnNum(result.awayScore)} {result.opponent}</span>
          </div>

          <div className="pt-1 space-y-1 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-white/80">
              <Trophy className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span className="truncate">{result.competition}</span>
            </div>
            <div className="flex items-center gap-2 text-[#A4B0A8]">
              <Calendar className="w-3.5 h-3.5 text-[#A4B0A8]" />
              <span>{formatBnDate(result.matchDate)}</span>
              <span className="text-white/20">•</span>
              <MapPin className="w-3.5 h-3.5 text-[#A4B0A8]" />
              <span className="truncate">{result.venue}</span>
            </div>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-xs text-[#A4B0A8]">
          আপনি কি নিশ্চিত যে আপনি এই ম্যাচের স্কোর মুছে ফেলতে চান? এটি স্থায়ীভাবে অফিসিয়াল স্কোরলাইন মুছে ফেলবে এবং টুর্নামেন্টের সিজন পরিসংখ্যান থেকে বাদ দেবে।
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onPress={onClose}
            isDisabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            onPress={onConfirm}
            isDisabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "মুছে ফেলা হচ্ছে..." : "ফলাফল মুছুন"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
