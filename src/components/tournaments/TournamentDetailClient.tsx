"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Calendar,
  Shield,
  Flame,
  MapPin,
  Clock,
  ArrowLeft,
  Award,
  Users,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  apiClient,
  TournamentDocument,
  TournamentTeamDocument,
  TournamentMatchDocument,
  TeamStanding,
  GoldenBootEntry,
  PlayerDocument,
} from "../../lib/api-client";
import {
  toBnNum,
  getBnPosition,
  formatBnDate,
  getBnTournamentStatus,
  getBnRound,
  getBnTournamentMatchStatus,
  getBnGoalType,
} from "../../lib/bn-utils";

type ActiveTab = "standings" | "fixtures" | "teams" | "goldenBoot";
type RoundFilter = string;

interface TournamentDetailClientProps {
  tournament: TournamentDocument;
}

export default function TournamentDetailClient({
  tournament: initialTournament,
}: TournamentDetailClientProps) {
  const [tournament, setTournament] = useState<TournamentDocument>(initialTournament);
  const [activeTab, setActiveTab] = useState<ActiveTab>("standings");
  const [roundFilter, setRoundFilter] = useState<RoundFilter>("all");

  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [matches, setMatches] = useState<TournamentMatchDocument[]>([]);
  const [teams, setTeams] = useState<
    (TournamentTeamDocument & { players?: PlayerDocument[] })[]
  >([]);
  const [goldenBoot, setGoldenBoot] = useState<GoldenBootEntry[]>([]);
  const [allPlayersMap, setAllPlayersMap] = useState<Map<string, PlayerDocument>>(
    new Map()
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teams lookup map
  const teamsMap = useMemo(() => {
    const map = new Map<string, TournamentTeamDocument>();
    teams.forEach((t) => map.set(t._id, t));
    return map;
  }, [teams]);

  // Load all tournament data
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
      setError(null);
    }

    try {
      // 1. Refresh tournament document if slug is known
      const [tournRes, standingsRes, matchesRes, teamsRes, playersRes, gbRes] =
        await Promise.allSettled([
          apiClient.tournaments.getBySlug(tournament.slug),
          apiClient.tournaments.getStandings(tournament._id),
          apiClient.tournaments.getMatches(tournament._id),
          apiClient.tournaments.getTeams(tournament._id),
          apiClient.players.getAllPages(),
          apiClient.tournaments.getGoldenBoot(tournament._id),
        ]);

      if (tournRes.status === "fulfilled" && tournRes.value.data) {
        setTournament(tournRes.value.data);
      }

      if (standingsRes.status === "fulfilled" && standingsRes.value.data) {
        setStandings(standingsRes.value.data);
      }

      if (matchesRes.status === "fulfilled" && matchesRes.value.data) {
        setMatches(matchesRes.value.data);
      }

      const pMap = new Map<string, PlayerDocument>();
      if (playersRes.status === "fulfilled" && Array.isArray(playersRes.value)) {
        playersRes.value.forEach((p) => pMap.set(p._id, p));
        setAllPlayersMap(pMap);
      }

      if (teamsRes.status === "fulfilled" && teamsRes.value.data) {
        const rawTeams = teamsRes.value.data;
        // Attach populated players to teams
        const enhancedTeams = rawTeams.map((team) => {
          const teamPlayers: PlayerDocument[] = [];
          if (Array.isArray(team.playerIds)) {
            team.playerIds.forEach((pid) => {
              const p = pMap.get(pid);
              if (p) teamPlayers.push(p);
            });
          }
          return {
            ...team,
            players: team.players && team.players.length > 0 ? team.players : teamPlayers,
          };
        });
        setTeams(enhancedTeams);
      }

      if (gbRes.status === "fulfilled" && gbRes.value.data) {
        setGoldenBoot(gbRes.value.data);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "টুর্নামেন্টের তথ্য লোড করতে সমস্যা হয়েছে";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament._id]);

  // Winner team helper
  const winnerTeam = useMemo(() => {
    if (!tournament.winnerTeamId) return null;
    return teamsMap.get(tournament.winnerTeamId) || null;
  }, [tournament.winnerTeamId, teamsMap]);

  // Golden boot top player helper
  const goldenBootWinner = useMemo(() => {
    if (goldenBoot.length === 0) return null;
    return goldenBoot[0];
  }, [goldenBoot]);

  // Filtered matches by round
  const filteredMatches = useMemo(() => {
    let list = [...matches];
    if (roundFilter === "final") {
      list = list.filter((m) => m.stage === "final");
    } else if (roundFilter !== "all") {
      const rNum = parseInt(roundFilter, 10);
      list = list.filter((m) => m.stage === "league" && m.round === rNum);
    }
    // Sort by matchNumber
    return list.sort((a, b) => a.matchNumber - b.matchNumber);
  }, [matches, roundFilter]);

  // Group matches by round for "all" view
  const groupedMatches = useMemo(() => {
    const groups: {
      title: string;
      stage: string;
      round?: number;
      matches: TournamentMatchDocument[];
    }[] = [];
    if (roundFilter !== "all") {
      return [
        {
          title:
            roundFilter === "final"
              ? "গ্র্যান্ড ফাইনাল"
              : `রাউন্ড ${toBnNum(parseInt(roundFilter, 10))}`,
          stage: roundFilter === "final" ? "final" : "league",
          round: roundFilter === "final" ? undefined : parseInt(roundFilter, 10),
          matches: filteredMatches,
        },
      ];
    }

    // Extract unique league rounds dynamically
    const leagueRounds = Array.from(
      new Set(
        matches
          .filter((m) => m.stage === "league" && typeof m.round === "number")
          .map((m) => m.round as number)
      )
    ).sort((a, b) => a - b);

    for (const r of leagueRounds) {
      const rMatches = matches.filter((m) => m.stage === "league" && m.round === r);
      if (rMatches.length > 0) {
        groups.push({
          title: `রাউন্ড ${toBnNum(r)}`,
          stage: "league",
          round: r,
          matches: rMatches.sort((a, b) => a.matchNumber - b.matchNumber),
        });
      }
    }

    // Final
    const finalMatches = matches.filter((m) => m.stage === "final");
    if (finalMatches.length > 0) {
      groups.push({
        title: "গ্র্যান্ড ফাইনাল (শীর্ষ ২ দলের লড়াই)",
        stage: "final",
        matches: finalMatches,
      });
    }

    return groups;
  }, [matches, roundFilter, filteredMatches]);

  const availableLeagueRounds = useMemo(() => {
    const rounds = new Set<number>();
    matches.forEach((m) => {
      if (m.stage === "league" && typeof m.round === "number") {
        rounds.add(m.round);
      }
    });
    return Array.from(rounds).sort((a, b) => a - b);
  }, [matches]);

  const hasFinalMatch = useMemo(() => {
    return matches.some((m) => m.stage === "final");
  }, [matches]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            সকল টুর্নামেন্টে ফিরে যান
          </Link>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Trophy className="w-3.5 h-3.5" />
                {getBnTournamentStatus(tournament.status)}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                সিজন: {tournament.season}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-3.5 h-3.5" />
                কমপক্ষে ৩ দল • প্রতি দলে ৫–৬ জন
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {tournament.name}
              </h1>
              {tournament.description && (
                <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                  {tournament.description}
                </p>
              )}
            </div>

            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  {formatBnDate(tournament.startDate)}
                  {tournament.endDate && ` – ${formatBnDate(tournament.endDate)}`}
                </span>
              </div>

              {tournament.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{tournament.venue}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>রাউন্ড-রবিন লিগ + গ্র্যান্ড ফাইনাল</span>
              </div>
            </div>

            {/* Champion Banner (If completed) */}
            {tournament.status === "completed" && winnerTeam && (
              <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                      চ্যাম্পিয়ন টিম
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full"
                        style={{ backgroundColor: winnerTeam.color || "#10b981" }}
                      />
                      {winnerTeam.name}
                      {winnerTeam.shortCode && (
                        <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                          {winnerTeam.shortCode}
                        </span>
                      )}
                    </h2>
                  </div>
                </div>

                {goldenBootWinner && (
                  <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-amber-500/30">
                    <Flame className="w-6 h-6 text-amber-400" />
                    <div>
                      <span className="text-xs text-slate-400 block">গোল্ডেন বুট উইনার</span>
                      <span className="text-sm font-bold text-white">
                        {goldenBootWinner.playerFullName} ({toBnNum(goldenBootWinner.goalsCount)} গোল)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("standings")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "standings"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Trophy className="w-4 h-4" />
            পয়েন্ট টেবিল (স্ট্যান্ডিংস)
          </button>

          <button
            onClick={() => setActiveTab("fixtures")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "fixtures"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            ফিক্সচার ও ফলাফল
            {matches.length > 0 && (
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === "fixtures"
                    ? "bg-slate-950 text-emerald-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {toBnNum(matches.length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "teams"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            দল ও স্কোয়াড (৫–৬ জন/টিম)
            {teams.length > 0 && (
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === "teams"
                    ? "bg-slate-950 text-emerald-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {toBnNum(teams.length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("goldenBoot")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === "goldenBoot"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Flame className="w-4 h-4" />
            গোল্ডেন বুট লিডারবোর্ড
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: STANDINGS (পয়েন্ট টেবিল) */}
        {/* ======================================================== */}
        {activeTab === "standings" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  অফিসিয়াল পয়েন্ট টেবিল
                </h2>
                <p className="text-sm text-slate-400">
                  সিঙ্গেল রাউন্ড-রবিন ভিত্তিক পয়েন্ট তালিকা। শীর্ষ ২ দল সরাসরি গ্র্যান্ড ফাইনালে উত্তীর্ণ হবে।
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">১ম ও ২য় স্থান = গ্র্যান্ড ফাইনালিস্ট</span>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm text-slate-400">পয়েন্ট টেবিল প্রস্তুত হচ্ছে...</p>
              </div>
            ) : standings.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">এখনও কোনো ম্যাচ অনুষ্ঠিত হয়নি</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ম্যাচ ফলাফল জমা হওয়ার সাথে সাথে পয়েন্ট তালিকা স্বয়ংক্রিয়ভাবে হালনাগাদ হবে।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-4 text-center w-14">স্থান</th>
                      <th className="py-4 px-4">দল</th>
                      <th className="py-4 px-3 text-center" title="ম্যাচ খেলেছে">ম্যাচ</th>
                      <th className="py-4 px-3 text-center text-emerald-400" title="জয়">জয়</th>
                      <th className="py-4 px-3 text-center text-amber-400" title="ড্র">ড্র</th>
                      <th className="py-4 px-3 text-center text-rose-400" title="পরাজয়">হার</th>
                      <th className="py-4 px-3 text-center hidden sm:table-cell" title="স্বপক্ষে গোল">GF</th>
                      <th className="py-4 px-3 text-center hidden sm:table-cell" title="বিপক্ষে গোল">GA</th>
                      <th className="py-4 px-3 text-center" title="গোল ব্যবধান">GD</th>
                      <th className="py-4 px-4 text-center text-white font-bold bg-slate-950/60" title="মোট পয়েন্ট">পয়েন্ট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standings.map((team) => {
                      const isFinalist = team.rank <= 2;
                      return (
                        <tr
                          key={team.teamId}
                          className={`transition-colors hover:bg-slate-800/40 ${
                            isFinalist ? "bg-emerald-950/10" : ""
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                                isFinalist
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black"
                                  : "text-slate-400 bg-slate-800/50"
                              }`}
                            >
                              {toBnNum(team.rank)}
                            </span>
                          </td>

                          {/* Team Details */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: team.teamColor || "#10b981" }}
                              />
                              <div>
                                <span className="font-bold text-white block sm:inline">
                                  {team.teamName}
                                </span>
                                {team.teamShortCode && (
                                  <span className="sm:ml-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                                    {team.teamShortCode}
                                  </span>
                                )}
                                {isFinalist && (
                                  <span className="block sm:inline sm:ml-2 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                                    • ফাইনালিস্ট
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Stats */}
                          <td className="py-4 px-3 text-center text-slate-300 font-mono">
                            {toBnNum(team.played)}
                          </td>
                          <td className="py-4 px-3 text-center text-emerald-400 font-mono font-medium">
                            {toBnNum(team.won)}
                          </td>
                          <td className="py-4 px-3 text-center text-amber-400 font-mono font-medium">
                            {toBnNum(team.drawn)}
                          </td>
                          <td className="py-4 px-3 text-center text-rose-400 font-mono font-medium">
                            {toBnNum(team.lost)}
                          </td>
                          <td className="py-4 px-3 text-center text-slate-400 font-mono hidden sm:table-cell">
                            {toBnNum(team.goalsFor)}
                          </td>
                          <td className="py-4 px-3 text-center text-slate-400 font-mono hidden sm:table-cell">
                            {toBnNum(team.goalsAgainst)}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-semibold">
                            <span
                              className={
                                team.goalDifference > 0
                                  ? "text-emerald-400"
                                  : team.goalDifference < 0
                                  ? "text-rose-400"
                                  : "text-slate-400"
                              }
                            >
                              {team.goalDifference > 0 ? "+" : ""}
                              {toBnNum(team.goalDifference)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-black text-white text-base bg-slate-950/40">
                            {toBnNum(team.points)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rules Note */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Info className="w-4 h-4 text-emerald-400" />
                টাই-ব্রেকিং ও স্ট্যান্ডিংস নিয়মাবলী:
              </div>
              <p>
                পয়েন্ট গণনা: জয় = ৩ পয়েন্ট, ড্র = ১ পয়েন্ট, পরাজয় = ০ পয়েন্ট।
              </p>
              <p>
                পয়েন্ট সমান হলে টাই-ব্রেকিং ক্রম: পয়েন্ট &gt; গোল ব্যবধান &gt; স্বপক্ষে গোল &gt; হেড-টু-হেড পয়েন্ট &gt; হেড-টু-হেড গোল ব্যবধান &gt; সর্বনিম্ন বিপক্ষে গোল।
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FIXTURES & RESULTS (ফিক্সচার ও ফলাফল) */}
        {/* ======================================================== */}
        {activeTab === "fixtures" && (
          <div className="space-y-6">
            {/* Round Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  ফিক্সচার ও ম্যাচ ফলাফল
                </h2>
                <p className="text-sm text-slate-400">
                  রাউন্ড-রবিন লিগ ম্যাচ ও শীর্ষ দুই দলের গ্র্যান্ড ফাইনাল।
                </p>
              </div>

              {/* Round Filter Pills */}
              <div className="flex overflow-x-auto gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 max-w-full">
                <button
                  onClick={() => setRoundFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    roundFilter === "all"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  সকল ম্যাচ
                </button>

                {availableLeagueRounds.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoundFilter(String(r))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      roundFilter === String(r)
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {getBnRound(r)}
                  </button>
                ))}

                {hasFinalMatch && (
                  <button
                    onClick={() => setRoundFilter("final")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      roundFilter === "final"
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    গ্র্যান্ড ফাইনাল
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm text-slate-400">ফিক্সচার লোড হচ্ছে...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">কোনো ফিক্সচার পাওয়া যায়নি</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  টুর্নামেন্টে দল নিবন্ধিত হলে অ্যাডমিন প্যানেল থেকে স্বয়ংক্রিয়ভাবে ফিক্সচার তৈরি করা হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedMatches.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2">
                      <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                        {group.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({toBnNum(group.matches.length)} টি ম্যাচ)
                      </span>
                    </div>

                    {/* Odd-Team Bye Alert for this round */}
                    {group.stage === "league" &&
                      group.round &&
                      (() => {
                        const playingIds = new Set(
                          group.matches.flatMap((m) => [m.homeTeamId, m.awayTeamId])
                        );
                        const byeTeam = teams.find((t) => !playingIds.has(t._id));
                        if (!byeTeam) return null;
                        return (
                          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center gap-2.5 text-xs text-cyan-300">
                            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span>
                              এই রাউন্ডে বিরতি (Bye): <strong>{byeTeam.name}</strong>
                            </span>
                          </div>
                        );
                      })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.matches.map((m) => {
                        const homeTeam = teamsMap.get(m.homeTeamId);
                        const awayTeam = teamsMap.get(m.awayTeamId);
                        const isCompleted = m.status === "completed";
                        const isFinal = m.stage === "final";

                        return (
                          <div
                            key={m._id}
                            className={`rounded-2xl border p-5 transition-all space-y-4 ${
                              isFinal
                                ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 shadow-xl shadow-amber-500/5"
                                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                            }`}
                          >
                            {/* Match Header */}
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-3">
                              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                {isFinal ? (
                                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {isFinal
                                  ? `গ্র্যান্ড ফাইনাল • ম্যাচ ${toBnNum(m.matchNumber)}`
                                  : `${getBnRound(m.round || 1)} • ম্যাচ ${toBnNum(m.matchNumber)}`}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${
                                  isCompleted
                                    ? "bg-slate-800 text-slate-300 border border-slate-700/60"
                                    : m.status === "live"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {getBnTournamentMatchStatus(m.status)}
                              </span>
                            </div>

                            {/* Teams & Scoreline */}
                            <div className="grid grid-cols-7 items-center gap-2 py-2">
                              {/* Home Team */}
                              <div className="col-span-3 text-right space-y-1">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold text-white text-sm sm:text-base leading-snug">
                                    {homeTeam ? homeTeam.name : "হোম দল"}
                                  </span>
                                  <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: homeTeam?.color || "#10b981",
                                    }}
                                  />
                                </div>
                                {homeTeam?.shortCode && (
                                  <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                    {homeTeam.shortCode}
                                  </span>
                                )}
                              </div>

                              {/* Center Score / VS */}
                              <div className="col-span-1 text-center">
                                {isCompleted && m.result ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-block px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono font-black text-lg sm:text-xl text-white">
                                      {toBnNum(m.result.homeScore)} - {toBnNum(m.result.awayScore)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 text-xs font-bold text-slate-400">
                                    VS
                                  </div>
                                )}
                              </div>

                              {/* Away Team */}
                              <div className="col-span-3 text-left space-y-1">
                                <div className="flex items-center justify-start gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: awayTeam?.color || "#3b82f6",
                                    }}
                                  />
                                  <span className="font-bold text-white text-sm sm:text-base leading-snug">
                                    {awayTeam ? awayTeam.name : "অ্যাওয়ে দল"}
                                  </span>
                                </div>
                                {awayTeam?.shortCode && (
                                  <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                    {awayTeam.shortCode}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra-time or Penalties Notice */}
                            {isCompleted && m.result?.wentToExtraTime && (
                              <div className="text-center text-xs text-amber-400 font-medium bg-amber-500/10 py-1 px-2 rounded-lg border border-amber-500/20">
                                অতিরিক্ত সময় সমাপ্ত
                                {m.result.wentToPenalties && (
                                  <span className="ml-1 font-bold">
                                    • পেনাল্টি শুটআউট: {toBnNum(m.result.homePenaltyScore ?? 0)} - {toBnNum(m.result.awayPenaltyScore ?? 0)}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Goal Scorers list if any */}
                            {m.goals && m.goals.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-emerald-400" />
                                  গোলদাতা:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.goals.map((g, gIdx2) => {
                                    const scorer = allPlayersMap.get(g.playerId);
                                    const team = teamsMap.get(g.teamId);
                                    return (
                                      <span
                                        key={gIdx2}
                                        className="inline-flex items-center gap-1 text-[11px] bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300"
                                      >
                                        <span
                                          className="w-1.5 h-1.5 rounded-full"
                                          style={{
                                            backgroundColor: team?.color || "#10b981",
                                          }}
                                        />
                                        <span className="font-medium text-white">
                                          {scorer?.fullName || "প্লেয়ার"}
                                        </span>
                                        {g.minute !== undefined && (
                                          <span className="text-slate-400 font-mono">
                                            {toBnNum(g.minute)}&apos;
                                          </span>
                                        )}
                                        {g.type !== "regular" && (
                                          <span className="text-amber-400 text-[10px]">
                                            ({getBnGoalType(g.type)})
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Date, Time, Venue Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>
                                  {m.matchDate ? formatBnDate(m.matchDate) : "তারিখ নির্ধারিত হয়নি"}
                                  {m.kickOffTime && ` • ${m.kickOffTime}`}
                                </span>
                              </div>

                              {m.venue && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="truncate max-w-[140px]">{m.venue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TEAMS & SQUADS (দল ও স্কোয়াড - প্রতি দলে ৫–৬ জন) */}
        {/* ======================================================== */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                অংশগ্রহণকারী দল ও ৫–৬ জন খেলোয়াড়ের স্কোয়াড
              </h2>
              <p className="text-sm text-slate-400">
                টুর্নামেন্টের অফিসিয়াল নিয়ম অনুযায়ী প্রতিটি দলে ৫–৬ জন করে খেলোয়াড় অন্তর্ভুক্ত থাকে।
              </p>
            </div>

            {isLoading ? (
              <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm text-slate-400">দলের তথ্য লোড হচ্ছে...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Shield className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">কোনো দল নিবন্ধিত হয়নি</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  অ্যাডমিন প্যানেল থেকে টুর্নামেন্টের জন্য দল ও তাদের খেলোয়াড় স্কোয়াড নিবন্ধন করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => {
                  const teamPlayers = team.players || [];
                  const squadCount = team.playerIds?.length || 0;
                  const isFull = squadCount >= 5 && squadCount <= 6;

                  return (
                    <div
                      key={team._id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg flex flex-col hover:border-slate-700 transition-all"
                    >
                      {/* Team Header Band */}
                      <div
                        className="p-5 border-b border-slate-800 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${team.color || "#10b981"}22, #0f172a 80%)`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-4 h-4 rounded-full flex-shrink-0 shadow-md ring-2 ring-white/20"
                              style={{ backgroundColor: team.color || "#10b981" }}
                            />
                            <div>
                              <h3 className="text-lg font-bold text-white leading-tight">
                                {team.name}
                              </h3>
                              {team.shortCode && (
                                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                                  {team.shortCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                              isFull
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {toBnNum(squadCount)} / ৫–৬ জন
                          </span>
                        </div>
                      </div>

                      {/* Players Roster */}
                      <div className="p-4 flex-1 space-y-2">
                        {teamPlayers.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            কোনো খেলোয়াড় অন্তর্ভুক্ত নেই
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/60">
                            {teamPlayers.map((player) => (
                              <div
                                key={player._id}
                                className="py-2.5 flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Player Avatar */}
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                    {player.photo ? (
                                      <Image
                                        src={player.photo}
                                        alt={player.fullName}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                        {player.fullName.charAt(0)}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <Link
                                      href={player.slug ? `/squad/${player.slug}` : `/squad`}
                                      className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors block"
                                    >
                                      {player.fullName}
                                    </Link>
                                    <span className="text-xs text-slate-400">
                                      {getBnPosition(player.position)}
                                    </span>
                                  </div>
                                </div>

                                {/* Jersey Number */}
                                <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                                  #{toBnNum(player.jerseyNumber)}
                                </span>
                              </div>
                            ))}
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
        {/* TAB 4: GOLDEN BOOT LEADERBOARD (গোল্ডেন বুট) */}
        {/* ======================================================== */}
        {activeTab === "goldenBoot" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                গোল্ডেন বুট পুরস্কার লিডারবোর্ড
              </h2>
              <p className="text-sm text-slate-400">
                টুর্নামেন্টের সর্বোচ্চ গোলদাতা খেলোয়াড়দের তালিকা (শুধুমাত্র সাধারণ ও অতিরিক্ত সময়ের গোল অন্তর্ভুক্ত)।
              </p>
            </div>

            {isLoading ? (
              <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-sm text-slate-400">লিডারবোর্ড প্রস্তুত হচ্ছে...</p>
              </div>
            ) : goldenBoot.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <Flame className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">এখনও কোনো গোল নথিভুক্ত হয়নি</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  ম্যাচ চলাকালীন গোল নথিভুক্ত হলে এখানে শীর্ষ গোলদাতাদের তালিকা প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top 3 Podium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goldenBoot.slice(0, 3).map((scorer, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={scorer.playerId}
                        className={`rounded-2xl border p-5 flex items-center gap-4 relative overflow-hidden ${
                          isFirst
                            ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 shadow-xl shadow-amber-500/10"
                            : "border-slate-800 bg-slate-900/60"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            isFirst
                              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                              : idx === 1
                              ? "bg-slate-300 text-slate-950"
                              : "bg-amber-700/60 text-amber-200"
                          }`}
                        >
                          {toBnNum(idx + 1)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-xs uppercase tracking-wider text-slate-400 block">
                            {scorer.teamName}
                          </span>
                          <h4 className="font-bold text-white text-base truncate">
                            {scorer.playerFullName}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {getBnPosition(scorer.position)} • #{toBnNum(scorer.jerseyNumber)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-2xl text-amber-400 block">
                            {toBnNum(scorer.goalsCount)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">গোল</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full Leaderboard Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-14">র‌্যাঙ্ক</th>
                        <th className="py-3 px-4">খেলোয়াড়</th>
                        <th className="py-3 px-4">দল</th>
                        <th className="py-3 px-4 hidden sm:table-cell">পজিশন</th>
                        <th className="py-3 px-4 text-center font-bold text-amber-400">মোট গোল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {goldenBoot.map((entry) => (
                        <tr
                          key={entry.playerId}
                          className="transition-colors hover:bg-slate-800/40"
                        >
                          <td className="py-3 px-4 text-center font-bold font-mono">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                                entry.rank === 1
                                  ? "bg-amber-400/20 text-amber-400 border border-amber-400/40 font-black"
                                  : "text-slate-400 bg-slate-800/50"
                              }`}
                            >
                              {toBnNum(entry.rank)}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                                {entry.photo ? (
                                  <Image
                                    src={entry.photo}
                                    alt={entry.playerFullName}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                    {entry.playerFullName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-white">
                                {entry.playerFullName}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.teamColor || "#10b981" }}
                              />
                              <span className="text-slate-300">{entry.teamName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 hidden sm:table-cell text-slate-400">
                            {getBnPosition(entry.position)}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-black text-amber-400 text-base">
                            {toBnNum(entry.goalsCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footnote */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Info className="w-4 h-4 text-amber-400" />
                    গোল্ডেন বুট নীতি:
                  </div>
                  <p>
                    শুধুমাত্র ম্যাচ চলাকালীন সাধারণ ৯০ মিনিট ও অতিরিক্ত সময়ে দেওয়া বৈধ গোলসমূহ গোল্ডেন বুট তালিকায় যুক্ত হয়। পেনাল্টি শুটআউট ও ওন গোল গণনা বহির্ভূত।
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
