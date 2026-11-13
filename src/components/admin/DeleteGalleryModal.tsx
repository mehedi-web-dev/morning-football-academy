"use client";

import { AlertTriangle, Trash2, X, Video, Calendar } from "lucide-react";
import { Button } from "@heroui/react";
import { GalleryDocument } from "../../lib/api-client";
import { formatBnDate } from "../../lib/bn-utils";

interface DeleteGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryDocument | null;
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

/**
 * DeleteGalleryModal Component
 * Confirmation dialog preventing accidental removal of media records
 */
export default function DeleteGalleryModal({
  isOpen,
  onClose,
  item,
  onConfirm,
  isDeleting,
}: DeleteGalleryModalProps) {
  if (!isOpen || !item) return null;

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
                মিডিয়া সম্পদ মুছে ফেলবেন?
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
            আপনি কি নিশ্চিত যে আপনি Morning Football Academy গ্যালারি ভাণ্ডার থেকে এই মিডিয়া সম্পদটি স্থায়ীভাবে মুছে ফেলতে চান?
          </p>

          {/* Media Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 flex items-center gap-3.5">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg bg-[#202E27] overflow-hidden shrink-0 border border-white/10 relative flex items-center justify-center">
              {item.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Video className="w-6 h-6 text-[#B9F66B]" />
              )}
            </div>

            {/* Details */}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="text-xs font-black text-white uppercase truncate">
                {item.title}
              </h4>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-[#202E27] text-[#B9F66B] border border-[#B9F66B]/20 uppercase">
                  {item.category}
                </span>

                <span className="text-white/20">•</span>

                <span className="text-[#A4B0A8] uppercase">
                  {item.mediaType === "image" ? "ছবি" : "ভিডিও"}
                </span>

                <span className="text-white/20">•</span>

                <span className={item.isPublished ? "text-[#B9F66B]" : "text-amber-300"}>
                  {item.isPublished ? "প্রকাশিত" : "খসড়া"}
                </span>
              </div>

              {item.createdAt && (
                <div className="flex items-center gap-1 text-[10px] text-[#A4B0A8]/60 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-[11px] text-red-300">
            ⚠️ এই পদক্ষেপটি পরিবর্তনযোগ্য নয়। মিডিয়া রেকর্ডটি ডেটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#101A17]/40">
          <Button
            type="button"
            onPress={onClose}
            isDisabled={isDeleting}
            className="bg-transparent border border-white/10 text-[#A4B0A8] hover:text-white hover:border-white/20 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            onPress={onConfirm}
            isDisabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
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
