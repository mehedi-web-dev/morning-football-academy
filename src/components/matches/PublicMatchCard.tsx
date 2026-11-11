"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, Shield } from "lucide-react";
import { MatchDocument } from "../../lib/api-client";
import {
  formatMatchDate,
  formatKickOffTime,
  deriveTeamShortName,
  getMatchStatusMeta,
} from "../../lib/match-utils";

/**
 * Team Logo or Athletic Crest Fallback
 */
export function TeamEmblem({
  name,
  logo,
  isMFA = false,
  size = "md",
}: {
  name: string;
  logo?: string;
  isMFA?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const shortName = isMFA ? "MFA" : deriveTeamShortName(name);

  const sizeClasses = {
    sm: "w-9 h-9 text-[11px] rounded-xl",
    md: "w-11 h-11 sm:w-12 sm:h-12 text-xs rounded-xl",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-sm sm:text-base rounded-2xl",
  }[size];

  // If MFA official logo is requested
  if (isMFA) {
    return (
      <div
        className={`relative ${sizeClasses} flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#18251F] to-[#0A0A0A] border border-[#B9F66B]/40 text-[#B9F66B] shadow-[0_0_15px_rgba(185,246,107,0.18)] transition-transform duration-300 group-hover:scale-105 shrink-0`}
        aria-label="Morning Football Academy Crest"
      >
        <Image
          src="/images/logo.jpeg"
          alt="Morning Football Academy"
          fill
          className="object-contain p-1"
          sizes="80px"
        />
      </div>
    );
  }

  // If opponent has a valid logo and hasn't errored
  if (logo && !imgError) {
    return (
      <div
        className={`relative ${sizeClasses} flex items-center justify-center overflow-hidden bg-[#18181B] border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0`}
        aria-label={`${name} logo`}
      >
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain p-1"
          sizes="80px"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Default athletic crest with team initials
  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center font-black font-mono tracking-wider transition-transform duration-300 group-hover:scale-105 shrink-0 select-none bg-gradient-to-br from-[#202024] to-[#18181B] border border-white/20 text-white shadow-sm`}
      aria-label={`${name} emblem`}
    >
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none opacity-20">
        <div className="w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
      </div>
      <span className="relative z-10">{shortName}</span>
    </div>
  );
}

interface PublicMatchCardProps {
  match: MatchDocument;
  variant?: "default" | "compact";
}

/**
 * PublicMatchCard Component
 * Athletic fixture card displaying teams, date, venue, and status
 */
export default function PublicMatchCard({
  match,
  variant = "default",
}: PublicMatchCardProps) {
  const statusMeta = getMatchStatusMeta(match.status);
  const isHome = match.homeAway === "home";

  // Derive Home vs Away display
  const homeTeam = {
    name: isHome ? "Morning Football Academy" : match.opponent,
    logo: isHome ? undefined : match.opponentLogo,
    isMFA: isHome,
    isHost: true,
  };

  const awayTeam = {
    name: isHome ? match.opponent : "Morning Football Academy",
    logo: isHome ? match.opponentLogo : undefined,
    isMFA: !isHome,
    isHost: false,
  };

  const matchDetailUrl = `/matches/${match._id}`;

  return (
    <div className="group relative rounded-2xl bg-[#18251F] border border-white/10 p-5 sm:p-6 hover:border-[#B9F66B]/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* 1. Fixture Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B9F66B] uppercase tracking-wider truncate max-w-[200px]">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{match.competition}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shrink-0 ${statusMeta.badgeClass}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass} ${
              statusMeta.isPulse ? "animate-pulse" : ""
            }`}
          />
          {statusMeta.label}
        </span>
      </div>

      {/* 2. Matchup Teams Arena */}
      <div className="py-5 space-y-3.5">
        {/* Home Team */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TeamEmblem
              name={homeTeam.name}
              logo={homeTeam.logo}
              isMFA={homeTeam.isMFA}
              size="sm"
            />
            <span
              className={`text-sm font-black uppercase truncate ${
                homeTeam.isMFA ? "text-[#B9F66B]" : "text-white"
              }`}
            >
              {homeTeam.name}
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-[#A4B0A8]/80 uppercase shrink-0">
            HOME
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <TeamEmblem
              name={awayTeam.name}
              logo={awayTeam.logo}
              isMFA={awayTeam.isMFA}
              size="sm"
            />
            <span
              className={`text-sm font-black uppercase truncate transition-colors ${
                awayTeam.isMFA ? "text-[#B9F66B]" : "text-[#A4B0A8] group-hover:text-white"
              }`}
            >
              {awayTeam.name}
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-[#A4B0A8]/80 uppercase shrink-0">
            AWAY
          </span>
        </div>
      </div>

      {/* 3. Fixture Footer */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A4B0A8] gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{formatMatchDate(match.matchDate, { short: true })}</span>
          </div>

          <span className="text-white/20">&bull;</span>

          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{formatKickOffTime(match.kickOffTime)}</span>
          </div>

          {variant !== "compact" && (
            <>
              <span className="text-white/20 hidden sm:inline">&bull;</span>
              <div className="items-center gap-1 hidden sm:flex truncate max-w-[140px]">
                <MapPin className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
                <span className="truncate">{match.venue}</span>
              </div>
            </>
          )}
        </div>

        <Link
          href={matchDetailUrl}
          className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-white hover:text-[#B9F66B] transition-colors shrink-0 group-hover:translate-x-0.5 duration-200"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B9F66B]" />
        </Link>
      </div>
    </div>
  );
}
