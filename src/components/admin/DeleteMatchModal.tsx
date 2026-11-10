"use client";

import { AlertTriangle, Trash2, X, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@heroui/react";
import { MatchDocument } from "../../lib/api-client";

interface DeleteMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchDocument | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * Format date for confirmation dialog
 */
function formatMatchDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * DeleteMatchModal Component
 * Confirmation dialog preventing accidental removal of scheduled match fixtures
 */
export default function DeleteMatchModal({
  isOpen,
  onClose,
  match,
  onConfirm,
  isDeleting,
}: DeleteMatchModalProps) {
  if (!isOpen || !match) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-match-title"
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
              id="delete-match-title"
              className="text-base sm:text-lg font-black text-white uppercase tracking-tight"
            >
              Cancel & Delete Fixture?
            </h3>
            <span className="text-[11px] font-mono text-red-300 block uppercase">
              Permanent Database Removal
            </span>
          </div>
        </div>

        {/* Fixture Snapshot Card */}
        <div className="p-4 rounded-xl bg-[#101A17] border border-white/5 space-y-2 text-xs text-[#A4B0A8]">
          <div className="flex items-center justify-between text-white">
            <span className="font-black text-sm uppercase tracking-tight">
              MFA <span className="text-[#B9F66B]">VS</span> {match.opponent}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-[#B9F66B]">
              {match.homeAway === "home" ? "HOME" : "AWAY"}
            </span>
          </div>

          <p className="text-[11px] font-mono text-[#B9F66B] uppercase font-bold">
            {match.competition}
          </p>

          <div className="pt-2 border-t border-white/5 space-y-1 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>{formatMatchDate(match.matchDate)}</span>
              <span className="text-white/20">•</span>
              <Clock className="w-3 h-3 text-[#A4B0A8]" />
              <span>{match.kickOffTime}</span>
            </div>

            <div className="flex items-center gap-2 text-[#A4B0A8]">
              <MapPin className="w-3.5 h-3.5 text-[#A4B0A8]" />
              <span className="truncate">{match.venue}</span>
            </div>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-xs text-[#A4B0A8]">
          Are you sure you want to remove this fixture? This will delete the schedule, referee notifications, and match day assignment records.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onPress={onClose}
            isDisabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            CANCEL
          </Button>

          <Button
            onPress={onConfirm}
            isDisabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "DELETING..." : "DELETE FIXTURE"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
