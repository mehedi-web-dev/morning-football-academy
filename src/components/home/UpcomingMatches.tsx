"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Shield,
  Activity,
} from "lucide-react";
import {
  FEATURED_MATCH,
  UPCOMING_FIXTURES,
  RECENT_DEMO_RESULT,
  MatchTeam,
} from "../../data/matches";

/**
 * Temporary CSS-based Team Crest Component
 * Creates an athletic, modern European club shield without inventing official logos
 */
function TeamEmblem({
  team,
  size = "md",
}: {
  team: MatchTeam;
  size?: "sm" | "md" | "lg";
}) {
  const isMFA = team.shortName === "MFA";
  const sizeClasses = {
    sm: "w-9 h-9 text-[11px] rounded-xl",
    md: "w-12 h-12 text-xs rounded-xl",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-sm sm:text-base rounded-2xl",
  }[size];

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center font-black font-mono tracking-wider transition-transform duration-300 group-hover:scale-105 shrink-0 select-none ${
        isMFA
          ? "bg-gradient-to-br from-[#202024] to-[#0A0A0A] border border-[#B9F66B]/40 text-[#B9F66B] shadow-[0_0_15px_rgba(185,246,107,0.18)]"
          : "bg-gradient-to-br from-[#202024] to-[#18181B] border border-white/20 text-white shadow-sm"
      }`}
      aria-label={`${team.name} emblem`}
    >
      {/* Subtle interior diagonal crest highlight */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none opacity-20">
        <div className="w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
      </div>
      <span className="relative z-10">{team.shortName}</span>
    </div>
  );
}

export default function UpcomingMatches() {
  return (
    <section
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]"
      aria-labelledby="upcoming-matches-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#202024] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              MATCH CENTER
            </div>
            <h2
              id="upcoming-matches-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              THE NEXT CHALLENGE
            </h2>
            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-xl leading-relaxed">
              Every match is another opportunity to prove ourselves.
            </p>
          </div>

          <div>
            <Link
              href="/fixtures"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/15 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-xs font-bold tracking-[0.14em] uppercase text-white hover:text-[#B9F66B] transition-all duration-300 group"
            >
              <span>View All Fixtures</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B9F66B] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. Featured Upcoming Match Card */}
        <div className="group relative rounded-2xl bg-[#202024] border border-white/10 p-6 sm:p-8 lg:p-10 hover:border-[#B9F66B]/40 transition-all duration-300 shadow-md hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Subtle top edge glow */}
          <div
            className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#B9F66B]/30 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Card Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-xs font-black tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5" />
              {FEATURED_MATCH.competition}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold tracking-wider uppercase text-white">
              <span className="w-2 h-2 rounded-full bg-[#B9F66B] animate-pulse" />
              {FEATURED_MATCH.status}
            </span>
          </div>

          {/* Card Matchup Arena */}
          <div className="py-8 sm:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4 text-center">
              {/* Home Team */}
              <div className="flex flex-col items-center space-y-3">
                <TeamEmblem team={FEATURED_MATCH.homeTeam} size="lg" />
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#B9F66B]">
                    HOME TEAM
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                    {FEATURED_MATCH.homeTeam.name}
                  </h3>
                </div>
              </div>

              {/* Center VS & Kickoff Callout */}
              <div className="flex flex-col items-center justify-center space-y-3 py-2">
                <span className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-[#B9F66B] select-none">
                  VS
                </span>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#A4B0A8] bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/[0.06]">
                  <Clock className="w-3.5 h-3.5 text-[#B9F66B]" />
                  <span>KICKOFF TBA</span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center space-y-3">
                <TeamEmblem team={FEATURED_MATCH.awayTeam} size="lg" />
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#A4B0A8]">
                    AWAY TEAM
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                    {FEATURED_MATCH.awayTeam.name}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer: Metadata & Action */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-[#A4B0A8]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B9F66B]" />
                <span>
                  Date:{" "}
                  <strong className="text-white font-bold">
                    {FEATURED_MATCH.date}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B9F66B]" />
                <span>
                  Kickoff:{" "}
                  <strong className="text-white font-bold">
                    {FEATURED_MATCH.kickoff}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B9F66B]" />
                <span>
                  Venue:{" "}
                  <strong className="text-white font-bold">
                    {FEATURED_MATCH.venue}
                  </strong>
                </span>
              </div>
            </div>

            <Link href={FEATURED_MATCH.matchHref} className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-7 py-3 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(185,246,107,0.25)] hover:shadow-[0_0_24px_rgba(185,246,107,0.45)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>MATCH DETAILS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. Additional Upcoming Fixtures */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
              UPCOMING FIXTURES
            </h3>
            <span className="text-[11px] font-mono text-[#A4B0A8]/80 uppercase">
              Demonstration Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {UPCOMING_FIXTURES.map((match) => (
              <div
                key={match.id}
                className="group relative rounded-2xl bg-[#202024] border border-white/10 p-5 sm:p-6 hover:border-[#B9F66B]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex flex-col justify-between"
              >
                {/* Fixture Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <span className="text-[11px] font-bold text-[#B9F66B] uppercase tracking-wider truncate max-w-[170px]">
                    {match.competition}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A4B0A8] border border-white/[0.08]">
                    {match.status}
                  </span>
                </div>

                {/* Matchup Rows */}
                <div className="py-5 space-y-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamEmblem team={match.homeTeam} size="sm" />
                      <span className="text-sm font-black text-white uppercase truncate">
                        {match.homeTeam.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B9F66B] uppercase shrink-0">
                      HOME
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamEmblem team={match.awayTeam} size="sm" />
                      <span className="text-sm font-black text-[#A4B0A8] uppercase truncate group-hover:text-white transition-colors">
                        {match.awayTeam.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#A4B0A8]/80 uppercase shrink-0">
                      AWAY
                    </span>
                  </div>
                </div>

                {/* Fixture Footer */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#A4B0A8]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
                    <span>{match.date}</span>
                    <span className="text-white/20">&bull;</span>
                    <span>{match.venue}</span>
                  </div>

                  <Link
                    href={match.matchHref}
                    className="inline-flex items-center gap-1 font-bold text-white hover:text-[#B9F66B] transition-colors"
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recent Results Preview */}
        <div className="rounded-2xl bg-[#202024]/80 border border-white/10 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#B9F66B]" />
              <h3 className="text-xs sm:text-sm font-black tracking-[0.2em] text-white uppercase">
                RECENT RESULTS PREVIEW
              </h3>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-bold tracking-widest uppercase w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
              {RECENT_DEMO_RESULT.status}
            </span>
          </div>

          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Teams & Scoreboard */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full md:w-auto text-center sm:text-left">
              {/* Home */}
              <div className="flex items-center gap-3">
                <TeamEmblem team={RECENT_DEMO_RESULT.homeTeam} size="md" />
                <div>
                  <span className="block text-sm sm:text-base font-black text-white uppercase">
                    {RECENT_DEMO_RESULT.homeTeam.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#B9F66B] uppercase tracking-wider">
                    WINNER
                  </span>
                </div>
              </div>

              {/* Score Display */}
              <div className="px-5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-center font-mono">
                <span className="text-2xl sm:text-3xl font-black text-[#B9F66B]">
                  {RECENT_DEMO_RESULT.score?.home}
                </span>
                <span className="text-lg font-bold text-white/40 mx-2">-</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {RECENT_DEMO_RESULT.score?.away}
                </span>
              </div>

              {/* Away */}
              <div className="flex items-center gap-3">
                <TeamEmblem team={RECENT_DEMO_RESULT.awayTeam} size="md" />
                <div>
                  <span className="block text-sm sm:text-base font-black text-white uppercase">
                    {RECENT_DEMO_RESULT.awayTeam.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider">
                    RUNNER-UP
                  </span>
                </div>
              </div>
            </div>

            {/* Match Action */}
            <div className="w-full md:w-auto text-center md:text-right">
              <Link href={RECENT_DEMO_RESULT.matchHref}>
                <Button
                  variant="outline"
                  className="w-full md:w-auto bg-white/[0.03] border border-white/20 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] font-bold text-xs tracking-wider uppercase rounded-full px-5 py-2.5 transition-all cursor-pointer"
                >
                  FULL MATCH REPORT
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
              * Fictional demonstration result for UI presentation. Official match
              reports will appear here after sanctioned academy games.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
