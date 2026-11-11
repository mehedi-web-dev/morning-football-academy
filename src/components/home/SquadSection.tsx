"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, AlertCircle, Users } from "lucide-react";
import { Button } from "@heroui/react";
import { apiClient, PlayerDocument } from "../../lib/api-client";
import PublicPlayerCard from "../squad/PublicPlayerCard";

/**
 * SquadSection Component
 * Displays real active academy players fetched directly from MongoDB
 */
export default function SquadSection() {
  const [players, setPlayers] = useState<PlayerDocument[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlayers = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.players
      .getAll({
        isActive: true,
        limit: 8,
      })
      .then((res) => {
        if (!abortSignal?.aborted) {
          setPlayers(res.data || []);
          setTotalCount(res.pagination?.total ?? res.data?.length ?? 0);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortSignal?.aborted) {
          setError("Unable to load squad roster from database.");
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    const signal = { aborted: false };
    fetchActivePlayers(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchActivePlayers]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchActivePlayers();
  };

  return (
    <section
      id="players"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]"
      aria-labelledby="squad-section-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
                OUR SQUAD
              </div>

              {/* Squad Count Label */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <strong className="text-[#B9F66B] font-bold">
                  {totalCount > 0 ? totalCount : "OFFICIAL"}
                </strong>{" "}
                SQUAD MEMBERS
              </span>
            </div>

            <h2
              id="squad-section-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              MEET THE SQUAD.
            </h2>

            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-xl leading-relaxed">
              Talent, discipline, and teamwork make us stronger. Meet the players
              representing Morning Football Academy.
            </p>
          </div>

          {/* View Full Squad Button */}
          <div>
            <Link
              href="/squad"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(185,246,107,0.25)] hover:shadow-[0_0_24px_rgba(185,246,107,0.45)] group shrink-0 cursor-pointer"
            >
              <span>VIEW FULL SQUAD</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. Player Cards Grid / States */}
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
          /* Loading Skeleton Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#18181B] border border-white/5 aspect-[3/4] animate-pulse flex flex-col justify-end p-5 space-y-3"
              >
                <div className="h-4 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-36 bg-white/10 rounded" />
                <div className="h-4 w-28 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          /* Empty Active Squad State */
          <div className="p-12 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#B9F66B]">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Squad Roster In Formation
              </h3>
              <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-md mx-auto">
                Official squad profiles are being registered for the upcoming competitive season.
                Apply for upcoming academy trials to join the roster.
              </p>
            </div>
            <Link href="/join">
              <Button className="bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#a8ec56] transition-all cursor-pointer">
                Join The Academy
              </Button>
            </Link>
          </div>
        ) : (
          /* Real Active Player Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {players.map((player) => (
              <PublicPlayerCard key={player._id} player={player} />
            ))}
          </div>
        )}

        {/* 3. Squad Roster Footer Link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] text-[11px] font-mono text-[#A4B0A8]/70">
          <span>
            Morning Football Academy • Official Registered Player Roster
          </span>
          <Link
            href="/squad"
            className="text-[#B9F66B] hover:underline flex items-center gap-1.5 font-bold uppercase tracking-wider"
          >
            <span>Explore all positions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
