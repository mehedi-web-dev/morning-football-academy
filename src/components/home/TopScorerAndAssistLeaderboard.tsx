"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Target,
  Trophy,
  ArrowRight,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { apiClient, PlayerDocument } from "../../lib/api-client";
import { toBnNum, getBnPosition } from "../../lib/bn-utils";

export interface RankedPlayer {
  rank: number;
  player: PlayerDocument;
  statValue: number;
}

/**
 * Standard Competition Ranking ("1224" rule)
 * Players with equal statistics share the same rank.
 * Next rank is incremented by the count of tied players.
 */
export function computeCompetitionRanking(
  players: PlayerDocument[],
  getStatValue: (player: PlayerDocument) => number
): RankedPlayer[] {
  const sorted = [...players].sort((a, b) => {
    const valA = getStatValue(a);
    const valB = getStatValue(b);
    if (valB !== valA) return valB - valA;
    // Tie-breaker: fewer appearances is ranked higher
    const appA = a.statistics?.appearances ?? 0;
    const appB = b.statistics?.appearances ?? 0;
    if (appA !== appB) return appA - appB;
    return a.fullName.localeCompare(b.fullName);
  });

  const ranked: RankedPlayer[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    const currentVal = getStatValue(sorted[i]);
    if (i > 0) {
      const prevVal = getStatValue(sorted[i - 1]);
      if (currentVal < prevVal) {
        currentRank = i + 1;
      }
    }
    ranked.push({
      rank: currentRank,
      player: sorted[i],
      statValue: currentVal,
    });
  }

  return ranked;
}

/**
 * Individual Player Row in Leaderboard Card
 */
function LeaderboardRow({
  item,
  type,
}: {
  item: RankedPlayer;
  type: "goals" | "assists";
}) {
  const [imageError, setImageError] = useState(false);
  const { rank, player, statValue } = item;
  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;
  const isTopThree = isTop1 || isTop2 || isTop3;

  const profileUrl = player.slug ? `/squad/${player.slug}` : "/squad";

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
        isTop1
          ? "bg-[#B9F66B]/[0.06] border-[#B9F66B]/30 hover:border-[#B9F66B]/60 shadow-[0_4px_20px_rgba(185,246,107,0.08)]"
          : isTop2
          ? "bg-white/[0.03] border-white/10 hover:border-white/20"
          : isTop3
          ? "bg-white/[0.02] border-white/10 hover:border-white/20"
          : "bg-transparent border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
      }`}
    >
      {/* Left: Rank badge, Avatar, Name & Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
        {/* Rank Badge */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs sm:text-sm shrink-0 transition-transform duration-300 group-hover:scale-105 ${
            isTop1
              ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_12px_rgba(185,246,107,0.4)]"
              : isTop2
              ? "bg-slate-200 text-[#0A0A0A] shadow-sm"
              : isTop3
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white/10 text-slate-300"
          }`}
          title={`র‌্যাঙ্ক #${toBnNum(rank)}`}
        >
          #{toBnNum(rank)}
        </div>

        {/* Player Avatar */}
        <Link
          href={profileUrl}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-[#18181B] border border-white/15 shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          {player.photo && !imageError ? (
            <Image
              src={player.photo}
              alt={player.fullName}
              fill
              sizes="(max-width: 640px) 48px, 56px"
              className="object-cover object-top"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] text-[#B9F66B]">
              <User className="w-6 h-6 opacity-80" />
            </div>
          )}

          {/* Top 1 Crown/Flame Indicator on Avatar */}
          {isTop1 && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#B9F66B] rounded-bl-lg flex items-center justify-center" />
          )}
        </Link>

        {/* Name and Position Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              href={profileUrl}
              className={`font-black text-sm sm:text-base text-white hover:text-[#B9F66B] transition-colors truncate block ${
                isTop1 ? "text-[#B9F66B]" : ""
              }`}
            >
              {player.fullName}
            </Link>
            {isTop1 && (
              <span className="shrink-0 text-amber-400" title="শীর্ষ তারকা">
                <Trophy className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[#A4B0A8] mt-0.5">
            <span className="font-mono font-bold text-[#B9F66B]/90">
              #{toBnNum(player.jerseyNumber)}
            </span>
            <span className="text-white/20">•</span>
            <span className="truncate">{getBnPosition(player.position)}</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-slate-400">
              {toBnNum(player.statistics?.appearances ?? 0)} ম্যাচ
            </span>
          </div>
        </div>
      </div>

      {/* Right: Prominent Stat Display */}
      <div className="text-right shrink-0 pl-2">
        <div className="flex items-baseline justify-end gap-1">
          <span
            className={`font-mono font-black text-2xl sm:text-3xl leading-none tracking-tight ${
              type === "goals"
                ? isTop1
                  ? "text-[#B9F66B] drop-shadow-[0_0_12px_rgba(185,246,107,0.3)]"
                  : "text-white"
                : isTop1
                ? "text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                : "text-white"
            }`}
          >
            {toBnNum(statValue)}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#A4B0A8]">
            {type === "goals" ? "গোল" : "অ্যাসিস্ট"}
          </span>
        </div>

        {isTopThree && (
          <span
            className={`inline-block text-[10px] font-mono uppercase tracking-wider font-bold mt-1 px-2 py-0.5 rounded-full ${
              isTop1
                ? type === "goals"
                  ? "bg-[#B9F66B]/20 text-[#B9F66B]"
                  : "bg-cyan-500/20 text-cyan-300"
                : isTop2
                ? "bg-slate-300/15 text-slate-300"
                : "bg-amber-600/15 text-amber-400"
            }`}
          >
            {isTop1 ? "১ম স্থান" : isTop2 ? "২য় স্থান" : "৩য় স্থান"}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * TopScorerAndAssistLeaderboard Component
 * Displays Top 5 Scorers and Top 5 Assists side-by-side on the homepage
 */
export default function TopScorerAndAssistLeaderboard() {
  const [scorers, setScorers] = useState<RankedPlayer[]>([]);
  const [assists, setAssists] = useState<RankedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (abortSignal?: { aborted: boolean }) => {
      try {
        const [scorersRes, assistsRes] = await Promise.all([
          apiClient.players.getTopScorers(5),
          apiClient.players.getTopAssists(5),
        ]);

        if (!abortSignal?.aborted) {
          const rankedScorers = computeCompetitionRanking(
            scorersRes.data || [],
            (p) => p.statistics?.goals ?? 0
          );
          const rankedAssists = computeCompetitionRanking(
            assistsRes.data || [],
            (p) => p.statistics?.assists ?? 0
          );

          setScorers(rankedScorers);
          setAssists(rankedAssists);
          setError(null);
          setIsLoading(false);
        }
      } catch {
        if (!abortSignal?.aborted) {
          setError("লিডারবোর্ড তথ্য লোড করতে ব্যর্থ হয়েছে।");
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const signal = { aborted: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchData]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchData();
  };

  return (
    <section
      id="leaderboard"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="leaderboard-heading"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none select-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-white/[0.08]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              পারফরম্যান্স লিডারবোর্ড
            </div>

            <h2
              id="leaderboard-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight"
            >
              শীর্ষ গোলদাতা ও অ্যাসিস্ট লিডারবোর্ড
            </h2>

            <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-2xl leading-relaxed">
              চলতি সিজনে একাডেমি স্কোয়াডের আক্রমণভাগ ও প্লে-মেকিংয়ের শীর্ষ
              তারকাদের অফিসিয়াল পারফরম্যান্স পরিসংখ্যান।
            </p>
          </div>

          <Link
            href="/squad"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B9F66B] hover:text-[#c4f87f] transition-colors group self-start md:self-end"
          >
            <span>সকল খেলোয়াড় দেখুন</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-bold text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Loading State Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-3xl border border-white/10 bg-[#121314] p-6 sm:p-8 space-y-6 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((rowIdx) => (
                    <div
                      key={rowIdx}
                      className="h-16 rounded-2xl bg-white/5 border border-white/5"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content: 2 Side-by-Side Leaderboard Cards */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ======================================================== */}
            {/* 1. TOP SCORERS CARD */}
            {/* ======================================================== */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141816] via-[#111312] to-[#0A0A0A] p-5 sm:p-7 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#B9F66B]/15 border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B] shadow-md shadow-[#B9F66B]/10">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <span>শীর্ষ গোলদাতা</span>
                      <span className="text-xs font-mono font-normal text-slate-400 lowercase">
                        (Top Scorers)
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#A4B0A8]">
                      চলতি সিজনে সর্বোচ্চ গোল করা সেরা ৫ খেলোয়াড়
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#B9F66B]/10 border border-[#B9F66B]/20 text-[#B9F66B] shrink-0">
                  গোল
                </span>
              </div>

              {/* Card Body: Player Rows */}
              <div className="relative z-10 space-y-2.5">
                {scorers.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    এখনও কোনো গোল নথিভুক্ত হয়নি।
                  </div>
                ) : (
                  scorers.map((item) => (
                    <LeaderboardRow
                      key={item.player._id}
                      item={item}
                      type="goals"
                    />
                  ))
                )}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#A4B0A8] font-mono text-[11px]">
                  * সমসংখ্যক গোলের খেলোয়াড়রা একই স্থান ভাগ করেছে
                </span>
                <Link
                  href="/squad"
                  className="font-bold text-[#B9F66B] hover:underline inline-flex items-center gap-1"
                >
                  <span>স্কোয়াড দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 2. TOP ASSISTS CARD */}
            {/* ======================================================== */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#13161A] via-[#101215] to-[#0A0A0A] p-5 sm:p-7 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <span>শীর্ষ অ্যাসিস্টদাতা</span>
                      <span className="text-xs font-mono font-normal text-slate-400 lowercase">
                        (Top Assists)
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#A4B0A8]">
                      চলতি সিজনে সর্বোচ্চ গোল করানো সেরা ৫ প্লে-মেকার
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  অ্যাসিস্ট
                </span>
              </div>

              {/* Card Body: Player Rows */}
              <div className="relative z-10 space-y-2.5">
                {assists.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    এখনও কোনো অ্যাসিস্ট নথিভুক্ত হয়নি।
                  </div>
                ) : (
                  assists.map((item) => (
                    <LeaderboardRow
                      key={item.player._id}
                      item={item}
                      type="assists"
                    />
                  ))
                )}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#A4B0A8] font-mono text-[11px]">
                  * সমসংখ্যক অ্যাসিস্টের খেলোয়াড়রা একই স্থান ভাগ করেছে
                </span>
                <Link
                  href="/squad"
                  className="font-bold text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>স্কোয়াড দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
