"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  UserPlus,
  Clock,
  RefreshCw,
  AlertCircle,
  Inbox,
  LogIn,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  RegistrationDocument,
  ApiError,
} from "../../lib/api-client";
import { toBnNum, formatBnDate, getBnPosition } from "../../lib/bn-utils";

/**
 * Format registration submission timestamp into user-friendly string
 */
function formatSubmissionDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `আজ, ${toBnNum(
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      )}`;
    } else if (diffDays === 1) {
      return "গতকাল";
    }
    return formatBnDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Derive age / category label from candidate date of birth
 */
function formatAgeGroup(dobStr?: string): string {
  if (!dobStr) return "ট্রায়ালিস্ট";
  try {
    const birthYear = new Date(dobStr).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age <= 13) return `অনূর্ধ্ব-${toBnNum(13)}`;
    if (age <= 15) return `অনূর্ধ্ব-${toBnNum(15)}`;
    if (age <= 17) return `অনূর্ধ্ব-${toBnNum(17)}`;
    if (age <= 19) return `অনূর্ধ্ব-${toBnNum(19)}`;
    return `সিনিয়র (${toBnNum(age)} বছর)`;
  } catch {
    return "যুব একাডেমি";
  }
}

/**
 * RecentRegistrations Component
 * Fetches and displays recent registration candidates directly from backend API
 */
export default function RecentRegistrations() {
  const [registrations, setRegistrations] = useState<RegistrationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const loadData = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.registrations
      .getAll({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      .then((response) => {
        if (!abortSignal?.aborted) {
          setRegistrations(response.data || []);
          setError(null);
          setIsAuthError(false);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!abortSignal?.aborted) {
          if (err instanceof ApiError) {
            setError(err.message);
            setIsAuthError(err.isAuthError);
          } else {
            setError("ব্যাকএন্ড এপিআই থেকে সাম্প্রতিক রেজিস্ট্রেশন তথ্য লোড করতে ব্যর্থ হয়েছে।");
          }
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const signal = { aborted: false };
    loadData(signal);
    return () => {
      signal.aborted = true;
    };
  }, [loadData]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setIsAuthError(false);
    loadData();
  };

  const getStatusBadge = (status: RegistrationDocument["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            পর্যালোচনাধীন
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            অনুমোদিত
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            প্রত্যাখ্যাত
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18251F] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              সাম্প্রতিক রেজিস্ট্রেশন
            </h2>
            <span className="text-[10px] font-mono text-[#A4B0A8] block">
              একাডেমিতে ভর্তির সর্বশেষ আবেদনসমূহ
            </span>
          </div>
        </div>

        <Link
          href="/admin/registrations"
          className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#B9F66B] hover:text-white transition-colors"
        >
          <span>সকল রেজিস্ট্রেশন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content States */}
      {isLoading ? (
        // Skeleton Loader
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#18251F] border border-white/5 flex items-center justify-between gap-3 animate-pulse"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-36 bg-white/10 rounded" />
                <div className="h-3 w-48 bg-white/5 rounded" />
              </div>
              <div className="h-6 w-24 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="p-4 rounded-xl bg-[#18251F] border border-red-500/30 text-white space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs text-[#A4B0A8] flex-1">{error}</p>
          </div>
          <div className="flex justify-end">
            {isAuthError ? (
              <Link
                href="/admin/login"
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>আবার সাইন ইন করুন</span>
              </Link>
            ) : (
              <Button
                variant="outline"
                onPress={handleRetry}
                className="bg-white/[0.04] border border-white/10 hover:border-[#B9F66B]/50 text-white hover:text-[#B9F66B] font-mono text-xs uppercase px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় চেষ্টা করুন</span>
              </Button>
            )}
          </div>
        </div>
      ) : registrations.length === 0 ? (
        // Empty State
        <div className="py-8 px-4 text-center rounded-xl bg-[#18251F]/60 border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 text-[#A4B0A8] flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            কোনো রেজিস্ট্রেশন পাওয়া যায়নি
          </p>
          <p className="text-[11px] font-mono text-[#A4B0A8] max-w-sm mx-auto">
            এখনও কোনো ট্রায়ালিস্ট রেজিস্ট্রেশন আবেদন জমা পড়েনি। নতুন প্রার্থীর আবেদন এখানে প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        // Real Data List
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg._id}
              className="p-3.5 rounded-xl bg-[#18251F] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Applicant Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white uppercase tracking-tight">
                    {reg.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#101A17] border border-white/10 text-[10px] font-mono text-[#B9F66B] font-bold">
                    {formatAgeGroup(reg.dateOfBirth)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#A4B0A8]">
                  <span>{getBnPosition(reg.position)}</span>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <Clock className="w-3 h-3 text-[#B9F66B]" />
                    <span>{formatSubmissionDate(reg.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto shrink-0">
                {getStatusBadge(reg.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
