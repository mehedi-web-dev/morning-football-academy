"use client";

import Link from "next/link";
import {
  Trophy,
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  Award,
  Swords,
  Minus,
} from "lucide-react";
import {
  FriendlySeriesDetailResponse,
  FriendlySeriesStatus,
} from "../../lib/api-client";
import {
  toBnNum,
  formatBnDate,
  getBnFriendlySeriesFormat,
} from "../../lib/bn-utils";

interface PublicFriendlySeriesCardProps {
  seriesData: FriendlySeriesDetailResponse;
}

/**
 * Returns visual styles and indicators for friendly series status badges
 */
function getSeriesStatusMeta(status: FriendlySeriesStatus) {
  switch (status) {
    case "ongoing":
      return {
        label: "চলমান সিরিজ",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        dotClass: "bg-emerald-400 animate-pulse",
      };
    case "completed":
      return {
        label: "সমাপ্ত",
        badgeClass: "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30",
        dotClass: "bg-[#B9F66B]",
      };
    case "cancelled":
      return {
        label: "বাতিল",
        badgeClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        dotClass: "bg-rose-500",
      };
    case "upcoming":
    default:
      return {
        label: "আসন্ন সিরিজ",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
        dotClass: "bg-cyan-400",
      };
  }
}

export default function PublicFriendlySeriesCard({
  seriesData,
}: PublicFriendlySeriesCardProps) {
  const { series, teamA, teamB, stats, championTeam } = seriesData;
  const statusMeta = getSeriesStatusMeta(series.status);
  const detailUrl = `/friendly-series/${series.slug}`;

  const isCompleted = series.status === "completed";
  const isDrawnSeries = series.isDrawnSeries || stats?.isDrawnSeries;

  return (
    <div className="group relative rounded-2xl bg-[#18251F] border border-white/10 p-5 sm:p-6 hover:border-[#B9F66B]/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B9F66B]/40 to-transparent group-hover:via-[#B9F66B] transition-all" />

      {/* 1. Header Bar: Season, Format & Status */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#202E27] border border-white/10 flex items-center justify-center text-[#B9F66B]">
              <Swords className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-mono font-bold text-[#A4B0A8] uppercase tracking-wider">
              {getBnFriendlySeriesFormat(series.format, { short: true })} • সিজন {toBnNum(series.season)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shrink-0 ${statusMeta.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
            {statusMeta.label}
          </span>
        </div>

        {/* 2. Main Title */}
        <div className="py-3">
          <Link href={detailUrl} className="block group-hover:text-[#B9F66B] transition-colors">
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight line-clamp-2">
              {series.name}
            </h3>
          </Link>
          {series.description && (
            <p className="mt-1 text-xs text-[#A4B0A8] line-clamp-1 leading-relaxed">
              {series.description}
            </p>
          )}
        </div>

        {/* 3. Team A vs Team B Matchup Banner with Wins & Draws Scoreboard */}
        <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 my-2">
          <div className="grid grid-cols-7 items-center gap-2">
            {/* Team A */}
            <div className="col-span-3 text-left space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: teamA?.color || "#10b981" }}
                />
                <span className="font-bold text-xs sm:text-sm text-white truncate block">
                  {teamA?.name || "দল ১"}
                </span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="font-bold">{toBnNum(stats?.teamAWins ?? 0)}</span>
                <span className="text-slate-400 text-[10px]">জয়</span>
              </div>
            </div>

            {/* Center VS & Score Comparison */}
            <div className="col-span-1 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                বনাম
              </span>
              <div className="text-xs font-mono font-black text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 mt-0.5">
                {toBnNum(stats?.teamAWins ?? 0)}-{toBnNum(stats?.teamBWins ?? 0)}
              </div>
              {(stats?.draws ?? 0) > 0 && (
                <span className="text-[9px] font-mono text-amber-400 mt-0.5">
                  ড্র: {toBnNum(stats?.draws ?? 0)}
                </span>
              )}
            </div>

            {/* Team B */}
            <div className="col-span-3 text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="font-bold text-xs sm:text-sm text-white truncate block">
                  {teamB?.name || "দল ২"}
                </span>
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: teamB?.color || "#3b82f6" }}
                />
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                <span className="text-slate-400 text-[10px]">জয়</span>
                <span className="font-bold">{toBnNum(stats?.teamBWins ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Champion or Drawn Series Outcome Banner */}
        {isCompleted && (
          <div className="mt-2">
            {championTeam ? (
              <div className="p-2.5 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/30 flex items-center gap-2 text-xs font-bold text-[#B9F66B]">
                <Award className="w-4 h-4 shrink-0 text-[#B9F66B]" />
                <span className="truncate">সিরিজ চ্যাম্পিয়ন: {championTeam.name}</span>
              </div>
            ) : isDrawnSeries ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs font-bold text-amber-400">
                <Minus className="w-4 h-4 shrink-0" />
                <span>ড্র সিরিজ — কোনো চ্যাম্পিয়ন নেই</span>
              </div>
            ) : null}
          </div>
        )}

        {/* 5. Series Progress Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 pb-3 text-[10px] font-mono font-bold text-[#A4B0A8]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101A17] border border-white/10 text-white/90">
            <Shield className="w-3 h-3 text-[#B9F66B]" />
            <span>
              খেলা হয়েছে: {toBnNum(stats?.matchesPlayed ?? 0)}/{toBnNum(stats?.maxMatches ?? (series.format === "best_of_5" ? 5 : 3))} ম্যাচ
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101A17] border border-white/10 text-cyan-300">
            <Trophy className="w-3 h-3 text-cyan-400" />
            <span>জয়ের শর্ত: {toBnNum(stats?.requiredWins ?? (series.format === "best_of_5" ? 3 : 2))} ম্যাচ</span>
          </span>
        </div>
      </div>

      {/* 6. Footer Metadata & Action CTA */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A4B0A8] gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>
              {formatBnDate(series.startDate, { short: true })}
              {series.endDate && ` – ${formatBnDate(series.endDate, { short: true })}`}
            </span>
          </div>

          {series.venue && (
            <div className="items-center gap-1 hidden sm:flex truncate max-w-[130px]">
              <span className="text-white/20">&bull;</span>
              <MapPin className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
              <span className="truncate">{series.venue}</span>
            </div>
          )}
        </div>

        <Link
          href={detailUrl}
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#101A17] bg-[#B9F66B] hover:bg-[#a8ec56] px-3.5 py-1.5 rounded-xl transition-all shadow-md shrink-0 group-hover:scale-105 duration-200"
        >
          <span>সিরিজ দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}