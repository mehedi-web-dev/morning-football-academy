"use client";

import { AlertTriangle, Trash2, X, Calendar, User } from "lucide-react";
import { Button } from "@heroui/react";
import { RegistrationDocument } from "../../lib/api-client";
import {
  formatBnDate,
  getBnPosition,
  getBnRegistrationStatus,
} from "../../lib/bn-utils";

interface DeleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationDocument | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return formatBnDate(dateStr);
  } catch {
    return dateStr;
  }
}

export default function DeleteRegistrationModal({
  isOpen,
  onClose,
  registration,
  onConfirm,
  isDeleting,
}: DeleteRegistrationModalProps) {
  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#18251F] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                আবেদন মুছে ফেলবেন?
              </h2>
              <p className="text-[11px] text-[#A4B0A8] font-mono">
                স্থায়ীভাবে মুছে ফেলার নিশ্চয়তা
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-[#A4B0A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            আপনি কি নিশ্চিত যে আপনি{" "}
            <strong className="text-white uppercase">{registration.fullName}</strong>-এর একাডেমি ভর্তি আবেদনটি স্থায়ীভাবে মুছে ফেলতে চান?
          </p>

          {/* Applicant Info Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase flex items-center gap-2">
                <User className="w-4 h-4 text-[#B9F66B]" />
                <span>{registration.fullName}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202E27] text-[#B9F66B] uppercase border border-[#B9F66B]/20">
                {getBnPosition(registration.position)}
              </span>
            </div>

            <div className="text-xs text-[#A4B0A8] font-mono space-y-0.5">
              <p>ইমেইল: {registration.email}</p>
              <p>ফোন: {registration.phone}</p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A4B0A8]/60 pt-1 border-t border-white/5">
              <Calendar className="w-3 h-3" />
              <span>আবেদনের তারিখ: {formatDate(registration.createdAt)}</span>
              <span className="text-white/20">•</span>
              <span className="uppercase text-amber-300">
                স্ট্যাটাস: {getBnRegistrationStatus(registration.status)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-[11px] text-red-300">
            ⚠️ এই পদক্ষেপটি পরিবর্তনযোগ্য নয়। আবেদনকারীর রেকর্ড, মূল্যায়ন এবং যোগাযোগের তথ্য ডেটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#101A17]/40">
          <Button
            type="button"
            onPress={onClose}
            isDisabled={isDeleting}
            className="bg-transparent border border-white/10 text-[#A4B0A8] hover:text-white hover:border-white/20 text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            onPress={onConfirm}
            isDisabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>মুছে ফেলা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>মুছে ফেলার নিশ্চিতকরণ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
