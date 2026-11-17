"use client";

import Link from "next/link";
import { Trophy, Calendar, MapPin, Users, ArrowRight, Shield, Award } from "lucide-react";
import { TournamentDocument, TournamentStatus } from "../../lib/api-client";
import { toBnNum, formatBnDate } from "../../lib/bn-utils";

interface PublicTournamentCardProps {
  tournament: TournamentDocument;
  winnerTeamName?: string;
}

/**
 * Returns visual styles and dot indicators for tournament status badges
 */
function getTournamentStatusMeta(status: TournamentStatus) {
  switch (status) {
    case "in_progress":
      return {
        label: "চলমান টুর্নামেন্ট",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        dotClass: "bg-emerald-400 animate-pulse",
      };
    case "completed":
      return {
        label: "সমাপ্ত",
        badgeClass: "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30",
        dotClass: "bg-[#B9F66B]",
      };
    case "fixtures_generated":
      return {
        label: "ফিক্সচার প্রস্তুত",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
        dotClass: "bg-cyan-400",
      };
    case "teams_registered":
      return {
        label: "দল নিবন্ধিত",
        badgeClass: "bg-amber-400/15 text-amber-300 border border-amber-400/30",
        dotClass: "bg-amber-400",
      };
    case "cancelled":
      return {
        label: "বাতিল",
        badgeClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        dotClass: "bg-rose-500",
      };
    case "draft":
    default:
      return {
        label: "আসন্ন / খসড়া",
        badgeClass: "bg-white/10 text-white/70 border border-white/20",
        dotClass: "bg-white/50",
      };
  }
}

/**
 * PublicTournamentCard Component
 * Displays tournament banner, season, schedule dates, venue, format badges, and CTA link
 */
export default function PublicTournamentCard({
  tournament,
  winnerTeamName,
}: PublicTournamentCardProps) {
  const statusMeta = getTournamentStatusMeta(tournament.status);
  const detailUrl = `/tournaments/${tournament.slug}`;

  return (
    <div className="group relative rounded-2xl bg-[#18251F] border border-white/10 p-5 sm:p-6 hover:border-[#B9F66B]/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B9F66B]/40 to-transparent group-hover:via-[#B9F66B] transition-all" />

      {/* 1. Header Bar: Season & Status */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#202E27] border border-white/10 flex items-center justify-center text-[#B9F66B]">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-mono font-bold text-[#A4B0A8] uppercase tracking-wider">
              মৌসুম {toBnNum(tournament.season)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shrink-0 ${statusMeta.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
            {statusMeta.label}
          </span>
        </div>

        {/* 2. Main Title & Description */}
        <div className="py-4 space-y-2">
          <Link href={detailUrl} className="block group-hover:text-[#B9F66B] transition-colors">
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight line-clamp-2">
              {tournament.name}
            </h3>
          </Link>

          {tournament.description && (
            <p className="text-xs text-[#A4B0A8] line-clamp-2 leading-relaxed">
              {tournament.description}
            </p>
          )}

          {/* Winner Callout if Completed */}
          {tournament.status === "completed" && winnerTeamName && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/30 flex items-center gap-2 text-xs font-bold text-[#B9F66B]">
              <Award className="w-4 h-4 shrink-0 text-[#B9F66B]" />
              <span className="truncate">চ্যাম্পিয়ন: {winnerTeamName}</span>
            </div>
          )}
        </div>

        {/* 3. Tournament Format & Team Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-[#101A17] border border-white/10 text-white/90">
            <Users className="w-3 h-3 text-[#B9F66B]" />
            <span>কমপক্ষে ৩ দল • প্রতি দলে ৫–৬ জন</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-[#101A17] border border-white/10 text-[#A4B0A8]">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>রাউন্ড-রবিন লিগ + ফাইনাল</span>
          </span>
        </div>
      </div>

      {/* 4. Footer Metadata & Action CTA */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A4B0A8] gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>
              {formatBnDate(tournament.startDate, { short: true })}
              {tournament.endDate && ` – ${formatBnDate(tournament.endDate, { short: true })}`}
            </span>
          </div>

          {tournament.venue && (
            <div className="items-center gap-1 hidden sm:flex truncate max-w-[140px]">
              <span className="text-white/20">&bull;</span>
              <MapPin className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
              <span className="truncate">{tournament.venue}</span>
            </div>
          )}
        </div>

        <Link
          href={detailUrl}
          className="inline-flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-[#101A17] bg-[#B9F66B] hover:bg-[#a8ec56] px-3.5 py-1.5 rounded-xl transition-all shadow-md shrink-0 group-hover:scale-105 duration-200"
        >
          <span>টুর্নামেন্ট দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
