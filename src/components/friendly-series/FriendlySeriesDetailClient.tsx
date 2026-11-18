"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Swords,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Minus,
  Info,
  Flame,
  Users,
  Award,
} from "lucide-react";
import {
  apiClient,
  FriendlySeriesDetailResponse,
  FriendlySeriesMatchDocument,
  FriendlyTeamSummary,
  TopGoalScorerEntry,
  FriendlySeriesTeamPlayersResponse,
  PlayerDocument,
} from "../../lib/api-client";
import {
  toBnNum,
  formatBnDate,
  formatBnKickOffTime,
  getBnFriendlySeriesStatus,
  getBnFriendlySeriesFormat,
  getBnFriendlyMatchStatus,
  getBnPosition,
} from "../../lib/bn-utils";

type ActiveTab = "matches" | "topScorers" | "rosters";

interface FriendlySeriesDetailClientProps {
  initialData: FriendlySeriesDetailResponse;
}

export default function FriendlySeriesDetailClient({
  initialData,
}: FriendlySeriesDetailClientProps) {
  const [seriesData, setSeriesData] =
    useState<FriendlySeriesDetailResponse>(initialData);
  const [matches, setMatches] = useState<FriendlySeriesMatchDocument[]>([]);
  const [topScorers, setTopScorers] = useState<TopGoalScorerEntry[]>([]);
  const [playersData, setPlayersData] =
    useState<FriendlySeriesTeamPlayersResponse | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("matches");
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingExtra, setIsLoadingExtra] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { series, teamA, teamB, stats, championTeam } = seriesData;

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
        setError(null);
      }
      try {
        const [detailRes, matchesRes, topScorersRes, playersRes] =
          await Promise.allSettled([
            apiClient.friendlySeries.getBySlug(series.slug),
            apiClient.friendlySeries.getMatches(series._id),
            apiClient.friendlySeries.getTopScorers(series._id),
            apiClient.friendlySeries.getPlayers(series._id),
          ]);

        if (detailRes.status === "fulfilled" && detailRes.value.data) {
          setSeriesData(detailRes.value.data);
        }
        if (matchesRes.status === "fulfilled" && matchesRes.value.data) {
          setMatches(
            matchesRes.value.data.sort((a, b) => a.matchNumber - b.matchNumber)
          );
        }
        if (topScorersRes.status === "fulfilled" && topScorersRes.value.data) {
          setTopScorers(topScorersRes.value.data);
        }
        if (playersRes.status === "fulfilled" && playersRes.value.data) {
          setPlayersData(playersRes.value.data);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "সিরিজের তথ্য রিফ্রেশ করতে সমস্যা হয়েছে";
        setError(msg);
      } finally {
        setIsLoadingMatches(false);
        setIsLoadingExtra(false);
        setIsRefreshing(false);
      }
    },
    [series._id, series.slug]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const teamsMap = useMemo(() => {
    const map = new Map<string, FriendlyTeamSummary>();
    if (teamA) map.set(teamA._id, teamA);
    if (teamB) map.set(teamB._id, teamB);
    return map;
  }, [teamA, teamB]);

  // Lookup map of all players in both rosters
  const playersMap = useMemo(() => {
    const map = new Map<string, PlayerDocument>();
    if (playersData?.teamA?.players) {
      playersData.teamA.players.forEach((p) => map.set(p._id, p));
    }
    if (playersData?.teamB?.players) {
      playersData.teamB.players.forEach((p) => map.set(p._id, p));
    }
    return map;
  }, [playersData]);

  const isCompleted = series.status === "completed";
  const isDrawnSeries = series.isDrawnSeries || stats?.isDrawnSeries;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/friendly-series"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            সকল ফ্রেন্ডলি সিরিজে ফিরে যান
          </Link>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            রিফ্রেশ
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="text-xs font-bold underline hover:text-rose-300 cursor-pointer"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. HERO HEADER SECTION */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Format & Status Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Swords className="w-3.5 h-3.5" />
                {getBnFriendlySeriesStatus(series.status)}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
                সিজন {toBnNum(series.season)}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Trophy className="w-3.5 h-3.5" />
                {getBnFriendlySeriesFormat(series.format)}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {series.name}
              </h1>
              {series.description && (
                <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                  {series.description}
                </p>
              )}
            </div>

            {/* Venue & Dates Meta */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-400 pt-2 border-t border-slate-800/80">
              {series.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{series.venue}</span>
                </div>
              )}

              {series.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>
                    শুরু: {formatBnDate(series.startDate)}
                    {series.endDate && ` • সমাপ্তি: ${formatBnDate(series.endDate)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SCOREBOARD & STANDINGS SUMMARY */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* Series Completed Champion or Draw Callout */}
          {isCompleted && (
            <div
              className={`p-6 rounded-3xl border text-center space-y-3 ${
                isDrawnSeries
                  ? "bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-amber-500/30"
                  : "bg-gradient-to-r from-emerald-500/15 via-slate-900 to-emerald-500/15 border-emerald-500/30 shadow-xl shadow-emerald-500/5"
              }`}
            >
              {isDrawnSeries ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Minus className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                    ড্র সিরিজ (Drawn Series)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    সর্বোচ্চ {toBnNum(stats?.maxMatches ?? 0)}টি ম্যাচ অনুষ্ঠিত
                    হওয়ার পরেও কোনো দলই প্রয়োজনীয়{" "}
                    {toBnNum(stats?.requiredWins ?? 0)} জয়ের শর্ত পূরণ করতে না
                    পারায় ফ্রেন্ডলি সিরিজটি অমীমাংসিত (ড্র) হিসেবে সমাপ্ত
                    ঘোষিত হয়েছে।
                  </p>
                </div>
              ) : championTeam ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest block">
                    সিরিজ চ্যাম্পিয়ন
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: championTeam.color || "#10b981",
                      }}
                    />
                    {championTeam.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    অভিনন্দন! {championTeam.name} সিরিজ জয়ের প্রয়োজনীয়{" "}
                    {toBnNum(stats?.requiredWins ?? 0)} জয়ের লক্ষ্যমাত্রা অর্জন
                    করে সিরিজ চ্যাম্পিয়ন হয়েছে।
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Team Wins Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Team A Card */}
            <div
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                championTeam?._id === teamA?._id
                  ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: teamA?.color || "#10b981" }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {teamA?.name || "দল ১"}
                    </h3>
                    {teamA?.shortCode && (
                      <span className="text-xs font-mono text-slate-400">
                        {teamA.shortCode}
                      </span>
                    )}
                  </div>
                </div>

                {championTeam?._id === teamA?._id && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5" />
                    বিজয়ী
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ম্যাচ জয়
                </span>
                <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-400">
                  {toBnNum(stats?.teamAWins ?? 0)}
                </span>
              </div>

              {/* Required Wins Indicator */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.teamAWins ?? 0) / (stats?.requiredWins || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Middle Series Status Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-center items-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-emerald-400" />
                সিরিজ অগ্রগতি
              </span>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {toBnNum(stats?.matchesPlayed ?? 0)} /{" "}
                  {toBnNum(stats?.maxMatches ?? 0)}
                </div>
                <p className="text-xs text-slate-400">ম্যাচ সম্পন্ন</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs border-t border-slate-800/80 w-full">
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">ড্র: </span>
                  <span className="font-bold text-amber-400 font-mono">
                    {toBnNum(stats?.draws ?? 0)}
                  </span>
                </div>

                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">বাকি: </span>
                  <span className="font-bold text-slate-300 font-mono">
                    {toBnNum(stats?.matchesRemaining ?? 0)}
                  </span>
                </div>

                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400">জয়ের লক্ষ্য: </span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {toBnNum(stats?.requiredWins ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team B Card */}
            <div
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                championTeam?._id === teamB?._id
                  ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: teamB?.color || "#3b82f6" }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {teamB?.name || "দল ২"}
                    </h3>
                    {teamB?.shortCode && (
                      <span className="text-xs font-mono text-slate-400">
                        {teamB.shortCode}
                      </span>
                    )}
                  </div>
                </div>

                {championTeam?._id === teamB?._id && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5" />
                    বিজয়ী
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ম্যাচ জয়
                </span>
                <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-400">
                  {toBnNum(stats?.teamBWins ?? 0)}
                </span>
              </div>

              {/* Required Wins Indicator */}
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 flex justify-end">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.teamBWins ?? 0) / (stats?.requiredWins || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rules clarification alert */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>ড্র নিয়মাবলী:</strong> ড্র হওয়া ম্যাচ একটি বৈধ
                ফলাফল। ড্রয়ের ফলে কোনো দলই জয় পায় না এবং এটি কোনো দলের পরাজয়
                হিসেবে গণ্য হয় না।
              </p>
              <p>
                ড্র সত্ত্বেও পরবর্তী নির্ধারিত ম্যাচ অনুষ্ঠিত হতে থাকবে।
                সর্বোচ্চ {toBnNum(stats?.maxMatches ?? 0)}টি ম্যাচ সমাপ্ত হওয়ার
                পর কোনো দল প্রয়োজনীয় {toBnNum(stats?.requiredWins ?? 0)} জয় না
                পেলে সিরিজটি সমতায় (Drawn Series) শেষ হবে।
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVIGATION TABS */}
        {/* ======================================================== */}
        <div className="border-b border-slate-800 flex items-center gap-2 sm:gap-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "matches"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>ম্যাচ সূচি ও ফলাফল</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {toBnNum(matches.length)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("topScorers")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "topScorers"
                ? "border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>শীর্ষ গোলদাতা লিডারবোর্ড</span>
            {topScorers.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {toBnNum(topScorers.length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("rosters")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "rosters"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>দলের খেলোয়াড় রোস্টার</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MATCH SCHEDULE & RESULTS LIST */}
        {/* ======================================================== */}
        {activeTab === "matches" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  ম্যাচ সূচি ও ফলাফল
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  সিরিজের প্রতিটি ব্যক্তিগত ম্যাচের লাইভ স্কোর, গোলদাতা ও সময়সূচি।
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                মোট ম্যাচ: {toBnNum(matches.length)}/
                {toBnNum(stats?.maxMatches ?? 0)}
              </span>
            </div>

            {isLoadingMatches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4"
                  >
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-10 bg-slate-800/60 rounded-xl" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">
                  এখনও কোনো ম্যাচ নির্ধারিত হয়নি
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  অ্যাডমিন প্যানেল থেকে ম্যাচের সময়সূচি ও ভেন্যু নির্ধারণ করা
                  হলে এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => {
                  const home = teamsMap.get(match.homeTeamId);
                  const away = teamsMap.get(match.awayTeamId);
                  const isMatchCompleted = match.status === "completed";
                  const isMatchDraw =
                    isMatchCompleted && Boolean(match.result?.isDraw);
                  const winnerId = match.result?.winnerTeamId;

                  const matchGoals =
                    match.result?.goals || match.goals || [];
                  const homeGoals = matchGoals.filter(
                    (g) => g.teamId === match.homeTeamId
                  );
                  const awayGoals = matchGoals.filter(
                    (g) => g.teamId === match.awayTeamId
                  );

                  return (
                    <div
                      key={match._id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 p-5 space-y-4 transition-all"
                    >
                      {/* Match Card Header */}
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                        <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                          <Swords className="w-3.5 h-3.5 text-emerald-400" />
                          ম্যাচ {toBnNum(match.matchNumber)}
                        </span>

                        <div className="flex items-center gap-2">
                          {isMatchDraw && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ম্যাচ ড্র
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isMatchCompleted
                                ? "bg-slate-800 text-slate-300"
                                : match.status === "live"
                                ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {getBnFriendlyMatchStatus(match.status)}
                          </span>
                        </div>
                      </div>

                      {/* Teams & Score Comparison */}
                      <div className="grid grid-cols-7 items-center gap-2 py-1">
                        {/* Home Team */}
                        <div className="col-span-3 text-right space-y-1">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`font-bold text-sm truncate block ${
                                winnerId === match.homeTeamId
                                  ? "text-emerald-400 font-black"
                                  : "text-white"
                              }`}
                            >
                              {home?.name || "হোম দল"}
                            </span>
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: home?.color || "#10b981",
                              }}
                            />
                          </div>
                          {home?.shortCode && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {home.shortCode}
                            </span>
                          )}
                        </div>

                        {/* Center Scoreline / VS */}
                        <div className="col-span-1 text-center">
                          {isMatchCompleted && match.result ? (
                            <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono font-black text-base sm:text-lg text-white">
                              {toBnNum(match.result.homeScore)} -{" "}
                              {toBnNum(match.result.awayScore)}
                            </span>
                          ) : (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 text-[10px] font-bold text-slate-400">
                              VS
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="col-span-3 text-left space-y-1">
                          <div className="flex items-center justify-start gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: away?.color || "#3b82f6",
                              }}
                            />
                            <span
                              className={`font-bold text-sm truncate block ${
                                winnerId === match.awayTeamId
                                  ? "text-emerald-400 font-black"
                                  : "text-white"
                              }`}
                            >
                              {away?.name || "অ্যাওয়ে দল"}
                            </span>
                          </div>
                          {away?.shortCode && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              {away.shortCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Goal Scorers list for completed matches */}
                      {isMatchCompleted && matchGoals.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <Flame className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ম্যাচের গোলদাতা:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Home Team Goals */}
                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                              <span
                                className="text-[10px] uppercase font-bold text-slate-400 block truncate"
                                style={{ color: home?.color }}
                              >
                                {home?.name || "হোম দল"} (
                                {toBnNum(homeGoals.length)})
                              </span>
                              {homeGoals.length === 0 ? (
                                <span className="text-[11px] text-slate-500 italic">
                                  কোনো গোল নেই
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  {homeGoals.map((g, gIdx) => {
                                    const scorer = playersMap.get(g.playerId);
                                    const scorerName =
                                      scorer?.fullName || "খেলোয়াড়";
                                    const isOwnGoal = g.type === "own_goal";
                                    return (
                                      <div
                                        key={gIdx}
                                        className="flex items-center justify-between text-[11px] text-slate-300"
                                      >
                                        <span className="truncate">
                                          ⚽ {scorerName}
                                          {isOwnGoal && (
                                            <span className="text-amber-400 ml-1 font-semibold">
                                              (ওন গোল)
                                            </span>
                                          )}
                                        </span>
                                        {g.minute !== undefined && (
                                          <span className="font-mono text-slate-400 shrink-0 ml-1">
                                            {toBnNum(g.minute)}&apos;
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Away Team Goals */}
                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                              <span
                                className="text-[10px] uppercase font-bold text-slate-400 block truncate"
                                style={{ color: away?.color }}
                              >
                                {away?.name || "অ্যাওয়ে দল"} (
                                {toBnNum(awayGoals.length)})
                              </span>
                              {awayGoals.length === 0 ? (
                                <span className="text-[11px] text-slate-500 italic">
                                  কোনো গোল নেই
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  {awayGoals.map((g, gIdx) => {
                                    const scorer = playersMap.get(g.playerId);
                                    const scorerName =
                                      scorer?.fullName || "খেলোয়াড়";
                                    const isOwnGoal = g.type === "own_goal";
                                    return (
                                      <div
                                        key={gIdx}
                                        className="flex items-center justify-between text-[11px] text-slate-300"
                                      >
                                        <span className="truncate">
                                          ⚽ {scorerName}
                                          {isOwnGoal && (
                                            <span className="text-amber-400 ml-1 font-semibold">
                                              (ওন গোল)
                                            </span>
                                          )}
                                        </span>
                                        {g.minute !== undefined && (
                                          <span className="font-mono text-slate-400 shrink-0 ml-1">
                                            {toBnNum(g.minute)}&apos;
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes if present */}
                      {match.result?.notes && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                          মন্তব্য: {match.result.notes}
                        </p>
                      )}

                      {/* Footer: Date, Time & Venue */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {match.matchDate
                              ? formatBnDate(match.matchDate)
                              : "তারিখ নির্ধারিত হয়নি"}
                            {match.kickOffTime &&
                              ` • ${formatBnKickOffTime(match.kickOffTime)}`}
                          </span>
                        </div>

                        {match.venue && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-[130px]">
                              {match.venue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TOP GOAL SCORERS LEADERBOARD */}
        {/* ======================================================== */}
        {activeTab === "topScorers" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                সিরিজ শীর্ষ গোলদাতা তালিকা
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                সিরিজের সকল সমাপ্ত ম্যাচের সাধারণ গোলদাতার ক্রমতালিকা (ওন গোল
                বাতিল)।
              </p>
            </div>

            {isLoadingExtra ? (
              <div className="h-56 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-sm text-slate-400">লিডারবোর্ড প্রস্তুত হচ্ছে...</p>
              </div>
            ) : topScorers.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Flame className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">
                  এখনও কোনো গোল নথিভুক্ত হয়নি
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  ম্যাচ ফলাফল ও গোলদাতা এন্ট্রি সম্পন্ন হলে শীর্ষ গোলদাতাদের
                  লিডারবোর্ড এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top Podium Cards (Ranks 1 to 3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topScorers.slice(0, 3).map((scorer, idx) => {
                    const isRankOne = scorer.rank === 1;
                    const playerName =
                      scorer.playerName || scorer.playerFullName || "খেলোয়াড়";
                    const photo = scorer.playerImage || scorer.photo;
                    const goals = scorer.totalGoals || scorer.goalsCount || 0;

                    return (
                      <div
                        key={scorer.playerId}
                        className={`rounded-2xl border p-5 flex items-center gap-4 relative overflow-hidden transition-all ${
                          isRankOne
                            ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 shadow-xl shadow-amber-500/10"
                            : "border-slate-800 bg-slate-900/60"
                        }`}
                      >
                        {/* Rank Badge */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                            isRankOne
                              ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50"
                              : idx === 1
                              ? "bg-slate-300 text-slate-950"
                              : "bg-amber-700/60 text-amber-200"
                          }`}
                        >
                          {toBnNum(scorer.rank)}
                        </div>

                        {/* Player Photo */}
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={playerName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Users className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 block truncate flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  scorer.teamColor || "#10b981",
                              }}
                            />
                            {scorer.teamName}
                          </span>
                          <h4 className="font-bold text-white text-base truncate">
                            {playerName}
                          </h4>
                          {scorer.matchesScored !== undefined && (
                            <span className="text-xs text-slate-400">
                              {toBnNum(scorer.matchesScored)} ম্যাচে
                            </span>
                          )}
                        </div>

                        {/* Goals */}
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono font-black text-2xl text-amber-400 block">
                            {toBnNum(goals)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            গোল
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Complete Table of All Scorers */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 text-center w-16">র‌্যাঙ্ক</th>
                          <th className="py-3 px-4">খেলোয়াড়</th>
                          <th className="py-3 px-4">দল</th>
                          <th className="py-3 px-4 text-center">ম্যাচে স্কোর</th>
                          <th className="py-3 px-4 text-right">মোট গোল</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {topScorers.map((entry) => {
                          const isTop = entry.rank === 1;
                          const pName =
                            entry.playerName ||
                            entry.playerFullName ||
                            "খেলোয়াড়";
                          const pImage = entry.playerImage || entry.photo;
                          const total = entry.totalGoals || entry.goalsCount || 0;

                          return (
                            <tr
                              key={entry.playerId}
                              className={`hover:bg-slate-850/50 transition-colors ${
                                isTop ? "bg-amber-500/5 font-semibold" : ""
                              }`}
                            >
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
                                    isTop
                                      ? "bg-amber-400 text-slate-950"
                                      : entry.rank === 2
                                      ? "bg-slate-300 text-slate-950"
                                      : entry.rank === 3
                                      ? "bg-amber-700/60 text-amber-100"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {toBnNum(entry.rank)}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                                    {pImage ? (
                                      <Image
                                        src={pImage}
                                        alt={pName}
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Users className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block">
                                      {pName}
                                    </span>
                                    {isTop && (
                                      <span className="text-[10px] text-amber-400 font-bold inline-flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        শীর্ষ গোলদাতা
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{
                                      backgroundColor:
                                        entry.teamColor || "#10b981",
                                    }}
                                  />
                                  <span className="text-slate-300 truncate max-w-[180px]">
                                    {entry.teamName}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center font-mono text-slate-400">
                                {entry.matchesScored !== undefined
                                  ? `${toBnNum(entry.matchesScored)} টি`
                                  : "-"}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <span className="font-mono font-black text-base text-amber-400">
                                  {toBnNum(total)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TEAM ROSTERS */}
        {/* ======================================================== */}
        {activeTab === "rosters" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                দলের স্কোয়াড ও খেলোয়াড় তালিকা
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                সিরিজে অংশগ্রহণকারী উভয় দলের অফিসিয়াল খেলোয়াড় রোস্টার।
              </p>
            </div>

            {isLoadingExtra ? (
              <div className="h-56 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-sm text-slate-400">প্লেয়ার রোস্টার লোড হচ্ছে...</p>
              </div>
            ) : !playersData ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">
                  রোস্টার তথ্য পাওয়া যায়নি
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team A Roster */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            playersData.teamA.color || teamA?.color || "#10b981",
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {playersData.teamA.name || teamA?.name}
                        </h3>
                        {playersData.teamA.shortCode && (
                          <span className="text-xs font-mono text-slate-400">
                            {playersData.teamA.shortCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      {toBnNum(playersData.teamA.players?.length || 0)} জন খেলোয়াড়
                    </span>
                  </div>

                  {!playersData.teamA.players ||
                  playersData.teamA.players.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      এই দলে কোনো নিবন্ধিত খেলোয়াড় নেই।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {playersData.teamA.players.map((player) => (
                        <div
                          key={player._id}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                              {player.photo ? (
                                <Image
                                  src={player.photo}
                                  alt={player.fullName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Users className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={
                                  player.slug
                                    ? `/squad/${player.slug}`
                                    : "/squad"
                                }
                                className="font-bold text-sm text-white hover:text-emerald-400 transition-colors truncate block"
                              >
                                {player.fullName}
                              </Link>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {getBnPosition(player.position)}
                              </span>
                            </div>
                          </div>

                          <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">
                            #{toBnNum(player.jerseyNumber)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team B Roster */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            playersData.teamB.color || teamB?.color || "#3b82f6",
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {playersData.teamB.name || teamB?.name}
                        </h3>
                        {playersData.teamB.shortCode && (
                          <span className="text-xs font-mono text-slate-400">
                            {playersData.teamB.shortCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      {toBnNum(playersData.teamB.players?.length || 0)} জন খেলোয়াড়
                    </span>
                  </div>

                  {!playersData.teamB.players ||
                  playersData.teamB.players.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      এই দলে কোনো নিবন্ধিত খেলোয়াড় নেই।
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {playersData.teamB.players.map((player) => (
                        <div
                          key={player._id}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                              {player.photo ? (
                                <Image
                                  src={player.photo}
                                  alt={player.fullName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Users className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={
                                  player.slug
                                    ? `/squad/${player.slug}`
                                    : "/squad"
                                }
                                className="font-bold text-sm text-white hover:text-emerald-400 transition-colors truncate block"
                              >
                                {player.fullName}
                              </Link>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {getBnPosition(player.position)}
                              </span>
                            </div>
                          </div>

                          <span className="font-mono font-bold text-xs text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded shrink-0">
                            #{toBnNum(player.jerseyNumber)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
