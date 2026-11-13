"use client";

import { CheckCircle2, XCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@heroui/react";
import { RegistrationDocument, RegistrationStatus } from "../../lib/api-client";
import { getBnPosition } from "../../lib/bn-utils";

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
        title: "ভর্তি আবেদন অনুমোদন",
        subtitle: "অফিসিয়াল একাডেমি ট্রায়ালের জন্য প্রার্থীকে অনুমোদন দিন",
        icon: <CheckCircle2 className="w-5 h-5 text-[#B9F66B]" />,
        iconBg: "bg-[#B9F66B]/20 border-[#B9F66B]/30",
        confirmBtn: "bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black",
        confirmLabel: "অনুমোদন নিশ্চিত করুন",
        description:
          "আপনি কি নিশ্চিত যে আপনি এই আবেদনকারীকে অনুমোদন করতে চান? প্রার্থীর স্ট্যাটাস অনুমোদিত হিসেবে চিহ্নিত হবে এবং তিনি একাডেমি ট্রায়ালে অংশ নেওয়ার যোগ্য বিবেচিত হবেন।",
      };
    }
    if (isReject) {
      return {
        title: "আবেদন প্রত্যাখ্যান",
        subtitle: "এই মৌসুমের জন্য প্রার্থীর ভর্তি প্রত্যাখ্যান করুন",
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
        iconBg: "bg-rose-500/20 border-rose-500/30",
        confirmBtn: "bg-rose-500 hover:bg-rose-600 text-white font-black",
        confirmLabel: "প্রত্যাখ্যান নিশ্চিত করুন",
        description:
          "আপনি কি নিশ্চিত যে আপনি এই আবেদনটি প্রত্যাখ্যান করতে চান? আবেদনকারীকে বর্তমান ট্রায়াল ব্যাচের জন্য অনুপযুক্ত হিসেবে সংরক্ষণ করা হবে।",
      };
    }
    return {
      title: "অপেক্ষমাণ তালিকায় ফিরিয়ে নিন",
      subtitle: "আবেদনটি পুনরায় মূল্যায়ন সারিতে ফিরিয়ে নিন",
      icon: <RotateCcw className="w-5 h-5 text-amber-300" />,
      iconBg: "bg-amber-400/20 border-amber-400/30",
      confirmBtn: "bg-amber-400 hover:bg-amber-500 text-[#101A17] font-black",
      confirmLabel: "অপেক্ষমাণে ফিরিয়ে নিন",
      description:
        "আপনি কি নিশ্চিত যে আপনি এই আবেদনটি অপেক্ষমাণ পর্যালোচনায় ফিরিয়ে নিতে চান? এটি সক্রিয় মূল্যায়ন তালিকায় পুনরায় প্রদর্শিত হবে।",
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
              প্রার্থী
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase">
                {registration.fullName}
              </span>
              <span className="text-xs font-mono text-[#B9F66B]">
                {getBnPosition(registration.position)}
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
            বাতিল
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
                <span>আপডেট হচ্ছে...</span>
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
