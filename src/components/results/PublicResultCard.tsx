"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Shield } from "lucide-react";
import { ResultDocument } from "../../lib/api-client";
import { formatMatchDate } from "../../lib/match-utils";
import { calculateOutcome, getOutcomeMeta } from "../../lib/result-utils";
import { toBnNum } from "../../lib/bn-utils";
import { TeamEmblem } from "../matches/PublicMatchCard";

interface PublicResultCardProps {
  result: ResultDocument;
}

/**
 * PublicResultCard Component
 * Displays match scoreline, team emblems, competition, and outcome badge
 */
export default function PublicResultCard({ result }: PublicResultCardProps) {
  const outcome = calculateOutcome(result.homeScore, result.awayScore);
  const outcomeMeta = getOutcomeMeta(outcome);
  const detailUrl = `/results/${result._id}`;

  return (
    <div className="group relative rounded-2xl bg-[#18251F] border border-white/10 p-5 sm:p-6 hover:border-[#B9F66B]/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* 1. Header Bar: Competition & Outcome */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B9F66B] uppercase tracking-wider truncate max-w-[200px]">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{result.competition}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shrink-0 ${outcomeMeta.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${outcomeMeta.dotClass}`} />
          {outcomeMeta.label}
        </span>
      </div>

      {/* 2. Scoreboard Arena */}
      <div className="py-5 space-y-3">
        {/* Morning Football Academy (Home) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TeamEmblem name="Morning Football Academy" isMFA={true} size="sm" />
            <span className="text-sm font-black text-[#B9F66B] uppercase truncate">
              Morning Football Academy
            </span>
          </div>
          <span className="text-lg font-black font-mono text-white shrink-0 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10">
            {toBnNum(result.homeScore)}
          </span>
        </div>

        {/* Opponent (Away) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TeamEmblem name={result.opponent} size="sm" />
            <span className="text-sm font-black text-white/90 uppercase truncate group-hover:text-white transition-colors">
              {result.opponent}
            </span>
          </div>
          <span className="text-lg font-black font-mono text-white/90 shrink-0 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10">
            {toBnNum(result.awayScore)}
          </span>
        </div>
      </div>

      {/* 3. Footer Metadata & Action */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A4B0A8] gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{formatMatchDate(result.matchDate, { short: true })}</span>
          </div>

          <span className="text-white/20 hidden sm:inline">&bull;</span>

          <div className="items-center gap-1 hidden sm:flex truncate max-w-[140px]">
            <MapPin className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
            <span className="truncate">{result.venue}</span>
          </div>
        </div>

        <Link
          href={detailUrl}
          className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-white hover:text-[#B9F66B] transition-colors shrink-0 group-hover:translate-x-0.5 duration-200"
        >
          <span>ম্যাচ রিপোর্ট</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B9F66B]" />
        </Link>
      </div>
    </div>
  );
}
