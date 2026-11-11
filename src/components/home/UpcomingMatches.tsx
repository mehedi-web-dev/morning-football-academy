"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  apiClient,
  MatchDocument,
  ResultDocument,
} from "../../lib/api-client";
import {
  formatMatchDate,
  formatKickOffTime,
  getMatchStatusMeta,
} from "../../lib/match-utils";
import PublicMatchCard, { TeamEmblem } from "../matches/PublicMatchCard";
import PublicResultCard from "../results/PublicResultCard";

export default function UpcomingMatches() {
  const [matches, setMatches] = useState<MatchDocument[]>([]);
  const [recentResults, setRecentResults] = useState<ResultDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchData = useCallback((abortSignal?: { aborted: boolean }) => {
    Promise.all([
      // 1. Fetch upcoming matches sorted by matchDate ascending
      apiClient.matches.getAll({
        status: "upcoming",
        sortBy: "matchDate",
        sortOrder: "asc",
        limit: 4,
      }),
      // 2. Fetch latest 3-4 match results sorted by matchDate descending
      apiClient.results.getAll({
        limit: 4,
        sortBy: "matchDate",
        sortOrder: "desc",
      }),
    ])
      .then(([matchesRes, resultsRes]) => {
        if (!abortSignal?.aborted) {
          setMatches(matchesRes.data || []);
          setRecentResults(resultsRes.data || []);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortSignal?.aborted) {
          setError("Failed to load match fixtures and results from database.");
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const signal = { aborted: false };
    fetchMatchData(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchMatchData]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchMatchData();
  };

  const featuredMatch = matches.length > 0 ? matches[0] : null;
  const secondaryMatches = matches.length > 1 ? matches.slice(1) : [];

  return (
    <section
      id="fixtures"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]"
      aria-labelledby="upcoming-matches-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. Section Header: Match Center */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase">
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
              Every match is another opportunity to prove ourselves. Follow our upcoming academy fixtures and match results.
            </p>
          </div>

          <div>
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/15 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-xs font-bold tracking-[0.14em] uppercase text-white hover:text-[#B9F66B] transition-all duration-300 group cursor-pointer"
            >
              <span>View All Fixtures</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B9F66B] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. Error State */}
        {error ? (
          <div className="p-8 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-[#A4B0A8]">{error}</p>
            <Button
              onPress={handleRetry}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : isLoading ? (
          /* 3. Loading Skeletons */
          <div className="space-y-8 animate-pulse">
            <div className="rounded-2xl bg-[#18251F]/60 border border-white/10 p-8 sm:p-10 h-72 flex flex-col justify-between" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[#18251F]/40 border border-white/5 h-48"
                />
              ))}
            </div>
          </div>
        ) : featuredMatch ? (
          /* 4. Real Featured Upcoming Match Card */
          <>
            <div className="group relative rounded-2xl bg-[#18251F] border border-white/10 p-6 sm:p-8 lg:p-10 hover:border-[#B9F66B]/40 transition-all duration-300 shadow-md hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div
                className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#B9F66B]/30 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-xs font-black tracking-wider uppercase">
                  <Shield className="w-3.5 h-3.5" />
                  {featuredMatch.competition}
                </span>

                {(() => {
                  const meta = getMatchStatusMeta(featuredMatch.status);
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${meta.badgeClass}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${meta.dotClass} ${
                          meta.isPulse ? "animate-pulse" : ""
                        }`}
                      />
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              {/* Card Matchup Arena */}
              <div className="py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4 text-center">
                  {/* Home Team */}
                  <div className="flex flex-col items-center space-y-3">
                    <TeamEmblem
                      name={
                        featuredMatch.homeAway === "home"
                          ? "Morning Football Academy"
                          : featuredMatch.opponent
                      }
                      logo={
                        featuredMatch.homeAway === "home"
                          ? undefined
                          : featuredMatch.opponentLogo
                      }
                      isMFA={featuredMatch.homeAway === "home"}
                      size="lg"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#B9F66B]">
                        HOME TEAM
                      </span>
                      <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                        {featuredMatch.homeAway === "home"
                          ? "Morning Football Academy"
                          : featuredMatch.opponent}
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
                      <span>{formatKickOffTime(featuredMatch.kickOffTime)}</span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center space-y-3">
                    <TeamEmblem
                      name={
                        featuredMatch.homeAway === "away"
                          ? "Morning Football Academy"
                          : featuredMatch.opponent
                      }
                      logo={
                        featuredMatch.homeAway === "away"
                          ? undefined
                          : featuredMatch.opponentLogo
                      }
                      isMFA={featuredMatch.homeAway === "away"}
                      size="lg"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#A4B0A8]">
                        AWAY TEAM
                      </span>
                      <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
                        {featuredMatch.homeAway === "away"
                          ? "Morning Football Academy"
                          : featuredMatch.opponent}
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
                        {formatMatchDate(featuredMatch.matchDate)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B9F66B]" />
                    <span>
                      Kickoff:{" "}
                      <strong className="text-white font-bold">
                        {formatKickOffTime(featuredMatch.kickOffTime)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#B9F66B]" />
                    <span>
                      Venue:{" "}
                      <strong className="text-white font-bold">
                        {featuredMatch.venue}
                      </strong>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/matches/${featuredMatch._id}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-7 py-3 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(185,246,107,0.25)] hover:shadow-[0_0_24px_rgba(185,246,107,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>MATCH DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 5. Additional Upcoming Fixtures */}
            {secondaryMatches.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
                    UPCOMING FIXTURES
                  </h3>
                  <span className="text-[11px] font-mono text-[#A4B0A8] uppercase">
                    Official Match Schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {secondaryMatches.map((match) => (
                    <PublicMatchCard key={match._id} match={match} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 6. Empty State: No Upcoming Matches */
          <div className="p-10 sm:p-14 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.04] border border-[#B9F66B]/30 flex items-center justify-center shadow-[0_0_20px_rgba(185,246,107,0.15)] text-[#B9F66B]">
              <Calendar className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                No Upcoming Matches Scheduled
              </h3>
              <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
                The academy coaching team is currently confirming the next tournament fixtures and friendly matchups. Please check back soon or browse our full match archive.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider hover:bg-[#cbfd82] transition-colors cursor-pointer"
              >
                <span>VIEW MATCH ARCHIVE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 7. Homepage Recent Results Section */}
        <div id="results" className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#B9F66B]" />
                <h3 className="text-sm sm:text-base font-black tracking-[0.2em] text-white uppercase">
                  RECENT MATCH RESULTS
                </h3>
              </div>
              <p className="text-xs text-[#A4B0A8]">
                Official final scores and outcomes from our latest academy matches.
              </p>
            </div>

            <div>
              <Link
                href="/results"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider hover:bg-[#cbfd82] transition-colors cursor-pointer"
              >
                <span>VIEW ALL RESULTS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Results Grid / States */}
          {recentResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentResults.map((result) => (
                <PublicResultCard key={result._id} result={result} />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-2xl bg-[#18251F]/80 border border-white/10 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A4B0A8]">
                <Activity className="w-5 h-5 text-[#B9F66B]" />
              </div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                No Results Recorded Yet
              </p>
              <p className="text-xs text-[#A4B0A8] max-w-md mx-auto leading-relaxed">
                Official sanctioned match reports and final scores will appear here after upcoming academy fixtures are concluded.
              </p>
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
              Live tournament fixtures and scoreline records updated directly from the Morning Football Academy database.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
