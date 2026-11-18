"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Swords,
  Trophy,
  ArrowRight,
  Flame,
  Minus,
  Users,
} from "lucide-react";
import {
  apiClient,
  FriendlySeriesDetailResponse,
  FriendlySeriesMatchDocument,
  TopGoalScorerEntry,
} from "../../lib/api-client";
import {
  toBnNum,
  getBnFriendlySeriesFormat,
  getBnFriendlySeriesStatus,
  formatBnDate,
} from "../../lib/bn-utils";

export default function LatestFriendlySeries() {
  const [latestSeriesData, setLatestSeriesData] =
    useState<FriendlySeriesDetailResponse | null>(null);
  const [latestMatch, setLatestMatch] =
    useState<FriendlySeriesMatchDocument | null>(null);
  const [topScorers, setTopScorers] = useState<TopGoalScorerEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLatestSeries() {
      try {
        const res = await apiClient.friendlySeries.getAll({ limit: 20 });
        const list = res.data || [];
        if (list.length === 0) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Sort by createdAt descending to pick ONLY ONE: the most recently created
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.series.createdAt || 0).getTime();
          const dateB = new Date(b.series.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const target = sorted[0];
        if (!target) {
          if (isMounted) setIsLoading(false);
          return;
        }

        if (isMounted) {
          setLatestSeriesData(target);
        }

        // Fetch matches and top scorers in parallel
        const [matchesRes, scorersRes] = await Promise.allSettled([
          apiClient.friendlySeries.getMatches(target.series._id),
          apiClient.friendlySeries.getTopScorers(target.series._id),
        ]);

        if (isMounted) {
          if (matchesRes.status === "fulfilled" && matchesRes.value.data) {
            const completed = matchesRes.value.data
              .filter((m) => m.status === "completed" && m.result)
              .sort((a, b) => b.matchNumber - a.matchNumber);
            if (completed.length > 0) {
              setLatestMatch(completed[0]);
            }
          }
          if (scorersRes.status === "fulfilled" && scorersRes.value.data) {
            setTopScorers(scorersRes.value.data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load latest friendly series:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    fetchLatestSeries();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !latestSeriesData) {
    return null;
  }

  const { series, teamA, teamB, stats, championTeam } = latestSeriesData;
  const isCompleted = series.status === "completed";
  const isDrawnSeries = series.isDrawnSeries || stats?.isDrawnSeries;

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              সর্বশেষ ফ্রেন্ডলি সিরিজ
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
              {series.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#A4B0A8] mt-1.5">
              সিজন {toBnNum(series.season)} •{" "}
              {getBnFriendlySeriesFormat(series.format)} •{" "}
              {getBnFriendlySeriesStatus(series.status)}
            </p>
          </div>

          <Link
            href={`/friendly-series/${series.slug}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B9F66B] hover:text-[#c4f87f] transition-colors group"
          >
            <span>সম্পূর্ণ সিরিজ দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Series Showcase Card */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#121314] via-[#101112] to-[#0A0A0A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Matchup & Scoreboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-6 lg:gap-4 py-2 border-b border-white/[0.08] pb-8">
              {/* Team A */}
              <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
                <div className="order-2 lg:order-1 text-left lg:text-right">
                  <h3 className="text-lg sm:text-2xl font-black text-white truncate max-w-[220px]">
                    {teamA?.name}
                  </h3>
                  {teamA?.shortCode && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {teamA.shortCode}
                    </span>
                  )}
                  <p className="text-xs text-[#B9F66B] font-semibold mt-1">
                    {toBnNum(stats?.teamAWins ?? 0)} জয়
                  </p>
                </div>

                <div
                  className="order-1 lg:order-2 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0 border border-white/15"
                  style={{ backgroundColor: teamA?.color || "#10b981" }}
                >
                  {teamA?.shortCode ? teamA.shortCode.slice(0, 3) : "A"}
                </div>
              </div>

              {/* Center Series Score */}
              <div className="lg:col-span-1 text-center space-y-1">
                <div className="inline-block px-4 py-2 rounded-2xl bg-black/60 border border-white/10 font-mono font-black text-2xl sm:text-3xl text-white">
                  {toBnNum(stats?.teamAWins ?? 0)} -{" "}
                  {toBnNum(stats?.teamBWins ?? 0)}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {toBnNum(stats?.matchesPlayed ?? 0)}/
                  {toBnNum(stats?.maxMatches ?? 0)} ম্যাচ
                  {stats?.draws ? ` • ${toBnNum(stats.draws)} ড্র` : ""}
                </div>
              </div>

              {/* Team B */}
              <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0 border border-white/15"
                  style={{ backgroundColor: teamB?.color || "#3b82f6" }}
                >
                  {teamB?.shortCode ? teamB.shortCode.slice(0, 3) : "B"}
                </div>

                <div className="text-right lg:text-left">
                  <h3 className="text-lg sm:text-2xl font-black text-white truncate max-w-[220px]">
                    {teamB?.name}
                  </h3>
                  {teamB?.shortCode && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {teamB.shortCode}
                    </span>
                  )}
                  <p className="text-xs text-blue-400 font-semibold mt-1">
                    {toBnNum(stats?.teamBWins ?? 0)} জয়
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-panels: Latest Completed Match & Top Scorers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Sub-panel: Latest Completed Match or Champion Status */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-[#B9F66B]" />
                    {isCompleted
                      ? "সিরিজ সমাপ্তি ফলাফল"
                      : "সর্বশেষ সমাপ্ত ম্যাচ"}
                  </span>

                  {isCompleted ? (
                    isDrawnSeries ? (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                        <div className="text-amber-300 font-bold text-sm flex items-center gap-2">
                          <Minus className="w-4 h-4 stroke-[3]" />
                          <span>ড্র সিরিজ (Drawn Series)</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          উভয় দল প্রয়োজনীয় জয় পূরণ করতে না পারায় সিরিজ
                          সমতায় শেষ হয়েছে।
                        </p>
                      </div>
                    ) : championTeam ? (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                        <div className="text-emerald-300 font-bold text-sm flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>চ্যাম্পিয়ন: {championTeam.name}</span>
                        </div>
                        <p className="text-xs text-slate-400">
                          প্রয়োজনীয় {toBnNum(stats?.requiredWins ?? 0)} ম্যাচ
                          জয় নিশ্চিত করে সিরিজ জয়ী।
                        </p>
                      </div>
                    ) : null
                  ) : null}

                  {latestMatch && latestMatch.result ? (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-white font-mono">
                          ম্যাচ #{toBnNum(latestMatch.matchNumber)} এর স্কোর:
                        </span>
                        <span>
                          {latestMatch.matchDate
                            ? formatBnDate(latestMatch.matchDate)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-white/5 font-mono text-sm">
                        <span className="font-bold text-white flex-1 truncate text-right">
                          {latestMatch.homeTeamId === teamA?._id
                            ? teamA?.name
                            : teamB?.name}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black text-[#B9F66B] font-black text-base border border-white/10">
                          {toBnNum(latestMatch.result.homeScore)} -{" "}
                          {toBnNum(latestMatch.result.awayScore)}
                        </span>
                        <span className="font-bold text-white flex-1 truncate text-left">
                          {latestMatch.awayTeamId === teamA?._id
                            ? teamA?.name
                            : teamB?.name}
                        </span>
                      </div>
                      {latestMatch.result.isDraw && (
                        <p className="text-[11px] text-amber-400 text-center font-medium">
                          ম্যাচটি ড্র হয়েছে
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-500">
                      এখনও কোনো ম্যাচ সমাপ্ত হয়নি।
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                  <span>
                    সিরিজ ফরম্যাট: {getBnFriendlySeriesFormat(series.format)}
                  </span>
                  <span>
                    জয়ের শর্ত: {toBnNum(stats?.requiredWins ?? 0)} ম্যাচ
                  </span>
                </div>
              </div>

              {/* Right Sub-panel: Top Goal Scorers from both teams */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      সিরিজের শীর্ষ গোলদাতা
                    </span>
                    {topScorers.length > 0 && (
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {toBnNum(topScorers.length)} জন গোলদাতা
                      </span>
                    )}
                  </div>

                  {topScorers.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl">
                      সিরিজে এখনও কোনো গোল নথিভুক্ত হয়নি।
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topScorers.slice(0, 3).map((scorer) => {
                        const name =
                          scorer.playerName ||
                          scorer.playerFullName ||
                          "খেলোয়াড়";
                        const photo = scorer.playerImage || scorer.photo;
                        const goals =
                          scorer.totalGoals || scorer.goalsCount || 0;
                        const isRankOne = scorer.rank === 1;

                        return (
                          <div
                            key={scorer.playerId}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isRankOne
                                ? "bg-amber-500/10 border-amber-500/30 text-white"
                                : "bg-slate-900/60 border-white/5 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold font-mono text-[11px] shrink-0 ${
                                  isRankOne
                                    ? "bg-amber-400 text-black"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {toBnNum(scorer.rank)}
                              </span>

                              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                                {photo ? (
                                  <Image
                                    src={photo}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="28px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <Users className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <span className="text-xs font-bold truncate block">
                                  {name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {scorer.teamName}
                                </span>
                              </div>
                            </div>

                            <span className="font-mono font-black text-sm text-amber-400 shrink-0">
                              {toBnNum(goals)} গোল
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-3 flex items-center justify-end">
                  <Link
                    href={`/friendly-series/${series.slug}`}
                    className="text-xs font-bold text-[#B9F66B] hover:underline flex items-center gap-1"
                  >
                    <span>স্কোরার ও স্কোয়াড বিবরণী</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
