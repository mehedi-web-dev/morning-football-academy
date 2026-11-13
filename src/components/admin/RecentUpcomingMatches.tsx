"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  RefreshCw,
  AlertCircle,
  Inbox,
  LogIn,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  MatchDocument,
  ApiError,
} from "../../lib/api-client";
import { formatBnDate, formatBnKickOffTime } from "../../lib/bn-utils";

/**
 * RecentUpcomingMatches Component
 * Fetches and displays scheduled tournament and league fixtures from backend API
 */
export default function RecentUpcomingMatches() {
  const [matches, setMatches] = useState<MatchDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const loadData = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.matches
      .getUpcoming(5)
      .then((response) => {
        if (!abortSignal?.aborted) {
          setMatches(response.data || []);
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
            setError("ব্যাকএন্ড এপিআই থেকে আসন্ন ম্যাচসমূহ লোড করতে ব্যর্থ হয়েছে।");
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

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18251F] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
              আসন্ন ম্যাচসমূহ
            </h2>
            <span className="text-[10px] font-mono text-[#A4B0A8] block">
              পরবর্তী নির্ধারিত ফিক্সচার
            </span>
          </div>
        </div>

        <Link
          href="/admin/matches"
          className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#B9F66B] hover:text-white transition-colors"
        >
          <span>সকল ম্যাচ</span>
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
              className="p-3.5 rounded-xl bg-[#18251F] border border-white/5 space-y-2 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-44 bg-white/10 rounded" />
              <div className="h-3 w-56 bg-white/5 rounded" />
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
      ) : matches.length === 0 ? (
        // Empty State
        <div className="py-8 px-4 text-center rounded-xl bg-[#18251F]/60 border border-white/5 space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 text-[#A4B0A8] flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            কোনো আসন্ন ম্যাচ নেই
          </p>
          <p className="text-[11px] font-mono text-[#A4B0A8] max-w-sm mx-auto">
            বর্তমানে কোনো একাডেমি ফিক্সচার নির্ধারিত নেই। ম্যাচ অ্যাডমিন থেকে যুক্ত করা নতুন ম্যাচ এখানে দেখা যাবে।
          </p>
        </div>
      ) : (
        // Matches List
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match._id}
              className="p-3.5 rounded-xl bg-[#18251F] border border-white/5 hover:border-white/15 transition-all space-y-2"
            >
              {/* Matchup Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#101A17] border border-[#B9F66B]/25 text-[10px] font-mono font-bold text-[#B9F66B] uppercase">
                  <Shield className="w-3 h-3" />
                  {match.competition}
                </span>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                  {match.homeAway === "home" ? "হোম ফিক্সচার" : "অ্যাওয়ে ফিক্সচার"}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white uppercase tracking-tight">
                  MFA <span className="text-[#B9F66B]">বনাম</span> {match.opponent}
                </span>
              </div>

              {/* Schedule & Venue Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#A4B0A8] pt-0.5 border-t border-white/5">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-[#B9F66B]" />
                  <span>
                    {formatBnDate(match.matchDate)} • {formatBnKickOffTime(match.kickOffTime)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] truncate">
                  <MapPin className="w-3 h-3 text-[#A4B0A8]" />
                  <span className="truncate">{match.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
