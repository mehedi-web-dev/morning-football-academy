"use client";

import { CheckCircle2, XCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@heroui/react";
import { RegistrationDocument, RegistrationStatus } from "../../lib/api-client";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationDocument | null;
  targetStatus: RegistrationStatus | null;
  onConfirm: () => Promise<void>;
  isUpdating: boolean;
}

export default function StatusChangeModal({
  isOpen,
  onClose,
  registration,
  targetStatus,
  onConfirm,
  isUpdating,
}: StatusChangeModalProps) {
  if (!isOpen || !registration || !targetStatus) return null;

  const isApprove = targetStatus === "approved";
  const isReject = targetStatus === "rejected";

  const getModalConfig = () => {
    if (isApprove) {
      return {
        title: "APPROVE APPLICANT ADMISSION",
        subtitle: "Accept candidate for official academy trials",
        icon: <CheckCircle2 className="w-5 h-5 text-[#B9F66B]" />,
        iconBg: "bg-[#B9F66B]/20 border-[#B9F66B]/30",
        confirmBtn: "bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black",
        confirmLabel: "CONFIRM ACCEPTANCE",
        description:
          "Are you sure you want to approve this applicant? Their status will be marked as accepted, qualifying them for age-group roster placement and academy trial scheduling.",
      };
    }
    if (isReject) {
      return {
        title: "REJECT APPLICATION",
        subtitle: "Decline candidate enrollment for this season",
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
        iconBg: "bg-rose-500/20 border-rose-500/30",
        confirmBtn: "bg-rose-500 hover:bg-rose-600 text-white font-black",
        confirmLabel: "CONFIRM REJECTION",
        description:
          "Are you sure you want to mark this application as rejected? The applicant will be archived as ineligible for the current trial batch.",
      };
    }
    return {
      title: "REVERT TO PENDING REVIEW",
      subtitle: "Move application back to evaluation queue",
      icon: <RotateCcw className="w-5 h-5 text-amber-300" />,
      iconBg: "bg-amber-400/20 border-amber-400/30",
      confirmBtn: "bg-amber-400 hover:bg-amber-500 text-[#101A17] font-black",
      confirmLabel: "REVERT TO PENDING",
      description:
        "Are you sure you want to reset this application to pending review? It will reappear in the active evaluation queue.",
    };
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#18251F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#101A17]/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${config.iconBg}`}
            >
              {config.icon}
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                {config.title}
              </h2>
              <p className="text-[11px] text-[#A4B0A8] font-mono">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="p-1.5 rounded-lg text-[#A4B0A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            {config.description}
          </p>

          {/* Candidate Card */}
          <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              CANDIDATE
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase">
                {registration.fullName}
              </span>
              <span className="text-xs font-mono text-[#B9F66B]">
                {registration.position}
              </span>
            </div>
            <span className="text-xs text-[#A4B0A8] block font-mono">
              {registration.email} • {registration.phone}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#101A17]/40">
          <Button
            type="button"
            onPress={onClose}
            isDisabled={isUpdating}
            className="bg-transparent border border-white/10 text-[#A4B0A8] hover:text-white hover:border-white/20 text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onPress={onConfirm}
            isDisabled={isUpdating}
            className={`${config.confirmBtn} text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2`}
          >
            {isUpdating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>UPDATING...</span>
              </>
            ) : (
              <span>{config.confirmLabel}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
