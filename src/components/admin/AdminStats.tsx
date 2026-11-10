"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Trophy,
  FileText,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Button } from "@heroui/react";
import { apiClient, DashboardStats, ApiError } from "../../lib/api-client";

interface StatItemConfig {
  id: string;
  label: string;
  key: keyof DashboardStats;
  sublabel: string;
  getTrend: (val: number) => string;
  href: string;
  icon: typeof Users;
}

const STATS_CONFIG: StatItemConfig[] = [
  {
    id: "total-players",
    label: "TOTAL PLAYERS",
    key: "totalPlayers",
    sublabel: "Active Squad Roster",
    getTrend: (val) => (val === 1 ? "1 active player" : `${val} active players`),
    href: "/admin/players",
    icon: Users,
  },
  {
    id: "upcoming-matches",
    label: "UPCOMING MATCHES",
    key: "upcomingMatches",
    sublabel: "Scheduled Fixtures",
    getTrend: (val) => (val === 0 ? "No fixtures scheduled" : `${val} upcoming fixtures`),
    href: "/admin/matches",
    icon: Calendar,
  },
  {
    id: "match-results",
    label: "MATCH RESULTS",
    key: "matchResults",
    sublabel: "Completed Games",
    getTrend: (val) => (val === 0 ? "No records logged" : `${val} recorded outcomes`),
    href: "/admin/results",
    icon: Trophy,
  },
  {
    id: "pending-registrations",
    label: "PENDING REGISTRATIONS",
    key: "pendingRegistrations",
    sublabel: "New Applications",
    getTrend: (val) =>
      val > 0 ? `${val} require review` : "All applications reviewed",
    href: "/admin/registrations",
    icon: FileText,
  },
];

/**
 * AdminStats Component
 * 4 metric overview cards displaying real academy KPIs fetched from backend REST APIs
 */
export default function AdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const loadData = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.dashboard
      .getStats()
      .then((data) => {
        if (!abortSignal?.aborted) {
          setStats(data);
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
            setError("Failed to connect to backend statistics API.");
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

  // 1. Error State
  if (error && !isLoading) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-red-500/30 text-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-white">
                Unable to Load Academy Statistics
              </h4>
              <p className="text-xs text-[#A4B0A8]">{error}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthError ? (
              <Link
                href="/admin/login"
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Again</span>
              </Link>
            ) : (
              <Button
                variant="outline"
                onPress={handleRetry}
                className="bg-white/[0.04] border border-white/10 hover:border-[#B9F66B]/50 text-white hover:text-[#B9F66B] font-mono text-xs uppercase px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="w-10 h-10 rounded-xl bg-white/5" />
            </div>
            <div className="space-y-2 py-1">
              <div className="h-9 w-14 bg-white/10 rounded" />
              <div className="h-3 w-28 bg-white/5 rounded" />
            </div>
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <div className="h-2.5 w-32 bg-white/5 rounded" />
              <div className="w-3.5 h-3.5 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Render Metric Cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {STATS_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const count = stats ? stats[stat.key] : 0;
        const formattedValue = String(count).padStart(2, "0");

        return (
          <Link
            key={stat.id}
            href={stat.href}
            className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
          >
            {/* Top Bar: Label & Icon */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#A4B0A8] uppercase">
                {stat.label}
              </span>

              <div className="w-10 h-10 rounded-xl bg-[#18251F] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B9F66B] group-hover:text-[#0A0A0A] transition-all duration-300 shadow-sm shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="py-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight group-hover:text-[#B9F66B] transition-colors">
                {formattedValue}
              </span>
              <span className="text-xs text-[#A4B0A8] block font-medium mt-0.5">
                {stat.sublabel}
              </span>
            </div>

            {/* Bottom Meta & Arrow */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#A4B0A8]">
              <span className="truncate pr-2 text-white/70">
                {stat.getTrend(count)}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B9F66B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
