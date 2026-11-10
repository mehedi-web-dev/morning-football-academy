"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@heroui/react";
import { PlayerDocument } from "../../lib/api-client";

interface DeletePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerDocument | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * DeletePlayerModal Component
 * Confirmation dialog preventing accidental removal of player records
 */
export default function DeletePlayerModal({
  isOpen,
  onClose,
  player,
  onConfirm,
  isDeleting,
}: DeletePlayerModalProps) {
  if (!isOpen || !player) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
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
              id="delete-dialog-title"
              className="text-base sm:text-lg font-black text-white uppercase tracking-tight"
            >
              Delete Player Record?
            </h3>
            <span className="text-[11px] font-mono text-red-300 block uppercase">
              Permanent Database Deletion
            </span>
          </div>
        </div>

        {/* Body Text */}
        <div className="p-4 rounded-xl bg-[#101A17] border border-white/5 space-y-1.5 text-xs text-[#A4B0A8]">
          <p>
            Are you sure you want to remove{" "}
            <span className="font-bold text-white uppercase">
              {player.fullName}
            </span>{" "}
            (Jersey{" "}
            <span className="text-[#B9F66B] font-mono font-bold">
              #{player.jerseyNumber}
            </span>
            , {player.position}) from the academy squad roster?
          </p>
          <p className="text-[11px] text-[#A4B0A8]/80 font-mono">
            This action deletes the player profile, contract status, and all linked biometric records.
          </p>
        </div>

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
            <span>{isDeleting ? "DELETING..." : "DELETE PLAYER"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
