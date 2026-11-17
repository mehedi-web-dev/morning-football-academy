"use client";

import { useState } from "react";
import { AlertTriangle, X, Trash2, Ban } from "lucide-react";
import { apiClient, TournamentDocument } from "../../lib/api-client";

interface DeleteTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentDocument | null;
  onSuccess: (message: string) => void;
}

export default function DeleteTournamentModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: DeleteTournamentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tournament) return null;

  const canDelete =
    tournament.status === "draft" || tournament.status === "cancelled";

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.tournaments.delete(tournament._id);
      onSuccess("টুর্নামেন্টটি ডাটাবেস থেকে সফলভাবে মুছে ফেলা হয়েছে।");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "মুছে ফেলতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      await apiClient.tournaments.cancel(tournament._id);
      onSuccess("টুর্নামেন্টটি সফলভাবে বাতিল (Cancelled) ঘোষণা করা হয়েছে।");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "বাতিল করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">টুর্নামেন্ট ব্যবস্থাপনা</h2>
              <p className="text-xs text-slate-400">মুছে ফেলা অথবা বাতিলকরণ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            আপনি কি নিশ্চিতভাবে <span className="font-bold text-white">&quot;{tournament.name}&quot;</span> নিয়ে এই পদক্ষেপ নিতে চান?
          </p>

          {!canDelete && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              যেহেতু এই টুর্নামেন্টের টিম বা ফিক্সচার তৈরি হয়ে গেছে, তাই টুর্নামেন্টটি সরাসরি মুছে ফেলা যাবে না। তবে আপনি চাইলে টুর্নামেন্টটি <strong>বাতিল (Cancelled)</strong> করতে পারেন।
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting || isCancelling}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            ফিরে যান
          </button>

          {tournament.status !== "cancelled" && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isDeleting || isCancelling}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              {isCancelling ? "বাতিল হচ্ছে..." : "টুর্নামেন্ট বাতিল করুন"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isCancelling}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors shadow-lg shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "মুছে ফেলা হচ্ছে..." : "স্থায়ীভাবে মুছুন"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
