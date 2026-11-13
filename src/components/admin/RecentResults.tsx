"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  Calendar,
  RefreshCw,
  AlertCircle,
  Inbox,
  LogIn,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  ResultDocument,
  ApiError,
} from "../../lib/api-client";
import { toBnNum, formatBnDate } from "../../lib/bn-utils";

/**
 * RecentResults Component
 * Fetches and displays recent match outcomes and scorelines directly from backend API
 */
export default function RecentResults() {
  const [results, setResults] = useState<ResultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const loadData = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.results
      .getRecent(5)
      .then((response) => {
        if (!abortSignal?.aborted) {
          setResults(response.data || []);
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
            setError("ব্যাকএন্ড এপিআই থেকে সাম্প্রতিক ফলাফল লোড করতে ব্যর্থ হয়েছে।");
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

  const getOutcomeBadge = (homeScore: number, awayScore: number) => {
    if (homeScore > awayScore) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          জয়
        </span>
      );
    }
    if (homeScore === awayScore) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
          ড্র
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
        পরাজয়
      </span>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18251F] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              সাম্প্রতিক ফলাফল
            </h2>
            <span className="text-[10px] font-mono text-[#A4B0A8] block">
              সর্বশেষ সমাপ্ত ম্যাচসমূহ
            </span>
          </div>
        </div>

        <Link
          href="/admin/results"
          className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#B9F66B] hover:text-white transition-colors"
        >
          <span>সকল ফলাফল</span>
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
                <div className="h-4 w-40 bg-white/10 rounded" />
                <div className="h-3 w-52 bg-white/5 rounded" />
              </div>
              <div className="h-9 w-16 bg-white/10 rounded-xl" />
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
      ) : results.length === 0 ? (
        // Empty State
        <div className="py-8 px-4 text-center rounded-xl bg-[#18251F]/60 border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 text-[#A4B0A8] flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            কোনো ফলাফল পাওয়া যায়নি
          </p>
          <p className="text-[11px] font-mono text-[#A4B0A8] max-w-sm mx-auto">
            এখনও কোনো সমাপ্ত ম্যাচের স্কোর রেকর্ড করা হয়নি। স্কোর এন্ট্রি করার পর ফলাফল এখানে দেখা যাবে।
          </p>
        </div>
      ) : (
        // Results List
        <div className="space-y-3">
          {results.map((res) => (
            <div
              key={res._id}
              className="p-3.5 rounded-xl bg-[#18251F] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3"
            >
              {/* Opponent & Competition */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white uppercase truncate">
                    বনাম {res.opponent}
                  </span>
                  {getOutcomeBadge(res.homeScore, res.awayScore)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#A4B0A8]">
                  <span className="truncate">{res.competition}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-[#B9F66B]" />
                    {formatBnDate(res.matchDate)}
                  </span>
                </div>
              </div>

              {/* Score Box */}
              <div className="px-3 py-1.5 rounded-xl bg-[#101A17] border border-white/10 font-mono font-black text-sm sm:text-base text-center shrink-0">
                <span className="text-[#B9F66B]">{toBnNum(res.homeScore)}</span>
                <span className="text-white/30 mx-1.5">-</span>
                <span className="text-white">{toBnNum(res.awayScore)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
