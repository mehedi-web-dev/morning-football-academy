"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { apiClient, FriendlySeriesDocument } from "../../lib/api-client";

interface DeleteFriendlySeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: FriendlySeriesDocument | null;
  onSuccess: (message: string) => void;
}

export default function DeleteFriendlySeriesModal({
  isOpen,
  onClose,
  series,
  onSuccess,
}: DeleteFriendlySeriesModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !series) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.friendlySeries.delete(series._id);
      onSuccess(`"${series.name}" সিরিজ এবং এর সকল ম্যাচ সফলভাবে মুছে ফেলা হয়েছে।`);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ফ্রেন্ডলি সিরিজ মুছতে সমস্যা হয়েছে।";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ফ্রেন্ডলি সিরিজ মুছুন</h2>
              <p className="text-xs text-slate-400">স্থায়ীভাবে সিরিজ ও এর ম্যাচ মুছে ফেলুন</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            আপনি কি নিশ্চিত যে <strong className="text-white">&quot;{series.name}&quot;</strong> সিরিজটি মুছে ফেলতে চান?
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-rose-400">
            <strong>সতর্কতা:</strong> এই সিরিজের অন্তর্ভুক্ত সকল ম্যাচ, ফলাফল ও স্কোরবোর্ড তথ্য স্থায়ীভাবে মুছে যাবে। এই কাজটি আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}
          </button>
        </div>
      </div>
    </div>
  );
}