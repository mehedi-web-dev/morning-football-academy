"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Activity,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  ResultDocument,
  PaginationMeta,
} from "../../lib/api-client";
import { calculateOutcome, ResultOutcome } from "../../lib/result-utils";
import PublicResultCard from "../../components/results/PublicResultCard";

const OUTCOME_TABS: { label: string; value: string }[] = [
  { label: "ALL RESULTS", value: "ALL" },
  { label: "WINS ONLY", value: "WIN" },
  { label: "DRAWS", value: "DRAW" },
  { label: "LOSSES", value: "LOSS" },
];

export default function ResultsPage() {
  const [selectedOutcome, setSelectedOutcome] = useState<string>("ALL");
  const [competitionFilter, setCompetitionFilter] = useState<string>("");
  const [searchOpponent, setSearchOpponent] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  const [results, setResults] = useState<ResultDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback((abortSignal?: { aborted: boolean }) => {
    const compParam = competitionFilter.trim() || undefined;

    apiClient.results
      .getAll({
        page,
        limit,
        competition: compParam,
        sortBy: "matchDate",
        sortOrder,
      })
      .then((res) => {
        if (!abortSignal?.aborted) {
          setResults(res.data || []);
          setPagination(res.pagination || null);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortSignal?.aborted) {
          setError("Failed to load match results from database.");
          setIsLoading(false);
        }
      });
  }, [page, limit, competitionFilter, sortOrder]);

  useEffect(() => {
    const signal = { aborted: false };
    fetchResults(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchResults]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchResults();
  };

  const handleOutcomeChange = (outcome: string) => {
    setSelectedOutcome(outcome);
  };

  const handleResetFilters = () => {
    setSelectedOutcome("ALL");
    setCompetitionFilter("");
    setSearchOpponent("");
    setSortOrder("desc");
    setPage(1);
  };

  // Filter results client-side for opponent search & outcome
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Opponent search filter
      if (searchOpponent.trim()) {
        const q = searchOpponent.toLowerCase().trim();
        if (!item.opponent.toLowerCase().includes(q)) return false;
      }

      // Outcome filter
      if (selectedOutcome !== "ALL") {
        const itemOutcome = calculateOutcome(item.homeScore, item.awayScore);
        if (itemOutcome !== (selectedOutcome as ResultOutcome)) return false;
      }

      return true;
    });
  }, [results, searchOpponent, selectedOutcome]);

  // Aggregate stats across current dataset
  const stats = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;

    results.forEach((r) => {
      const outcome = calculateOutcome(r.homeScore, r.awayScore);
      if (outcome === "WIN") wins++;
      else if (outcome === "DRAW") draws++;
      else losses++;
    });

    return { wins, draws, losses };
  }, [results]);

  const totalCount = pagination?.total ?? results.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen">
      {/* 1. Cinematic Hero Header */}
      <section className="relative w-full py-16 sm:py-24 bg-[#101A17] border-b border-white/[0.08] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-40">
          <Image
            src="/images/team.jpeg"
            alt="Morning Football Academy Match Results"
            fill
            priority
            className="object-cover object-center filter blur-sm brightness-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-[#101A17]/95 to-[#101A17]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-[#B9F66B]/30 text-xs font-mono font-bold tracking-[0.24em] text-[#B9F66B] uppercase shadow-[0_0_15px_rgba(185,246,107,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
            OFFICIAL RESULTS ARCHIVE
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              MATCH <span className="text-[#B9F66B]">RESULTS.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
              Audited match reports, final scorelines, and performance outcomes for Morning Football Academy sanctioned tournament games and friendly encounters.
            </p>
          </div>

          {/* Quick Metrics & Records Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-[#A4B0A8]">
              <Trophy className="w-4 h-4 text-[#B9F66B]" />
              <span>
                Total Played:{" "}
                <strong className="text-white font-bold">{totalCount}</strong>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-[#B9F66B]">
              <span className="w-2 h-2 rounded-full bg-[#B9F66B]" />
              <span>
                Wins: <strong className="font-bold">{stats.wins}</strong>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>
                Draws: <strong className="font-bold">{stats.draws}</strong>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>
                Losses: <strong className="font-bold">{stats.losses}</strong>
              </span>
            </div>

            <Button
              onPress={handleRefresh}
              isDisabled={isLoading}
              className="bg-[#18251F] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center gap-2 ml-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`} />
              <span>Refresh Results</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Filter Controls Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-5">
          {/* Top row: Outcome Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/[0.08]">
            <span className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider mr-2 hidden sm:inline-flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#B9F66B]" />
              OUTCOME:
            </span>

            {OUTCOME_TABS.map((tab) => {
              const isActive = selectedOutcome === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleOutcomeChange(tab.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_12px_rgba(185,246,107,0.35)]"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white hover:bg-white/[0.08] border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Bottom row: Opponent Search, Competition Filter, Sort Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search opponent */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search opponent..."
                value={searchOpponent}
                onChange={(e) => setSearchOpponent(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
              />
            </div>

            {/* Filter competition */}
            <div className="relative">
              <Shield className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter competition..."
                value={competitionFilter}
                onChange={(e) => {
                  setCompetitionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
              />
            </div>

            {/* Sort Order Toggle */}
            <div>
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="w-full px-3.5 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs font-mono text-white hover:border-[#B9F66B]/50 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#B9F66B]" />
                  <span>Date: {sortOrder === "desc" ? "Latest First" : "Oldest First"}</span>
                </span>
                <span className="text-[10px] text-[#A4B0A8] uppercase font-bold">
                  {sortOrder.toUpperCase()}
                </span>
              </button>
            </div>

            {/* Reset Filters */}
            <div>
              <button
                onClick={handleResetFilters}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-white hover:border-white/20 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* 3. Results Grid / States */}
        {error ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-[#A4B0A8]">{error}</p>
            <Button
              onPress={handleRefresh}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : isLoading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#18251F]/60 border border-white/5 h-56 flex flex-col justify-between p-6"
              >
                <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                <div className="space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-6 bg-white/10 rounded w-2/3" />
                </div>
                <div className="h-4 bg-white/10 rounded w-1/2 pt-4" />
              </div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          /* Results Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result) => (
                <PublicResultCard key={result._id} result={result} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                <p className="text-xs font-mono text-[#A4B0A8]">
                  Showing page <strong className="text-white">{page}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong> ({totalCount} total results)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    isDisabled={page <= 1}
                    className="bg-[#18251F] border border-white/10 text-white text-xs px-3 py-1.5 rounded-xl hover:border-[#B9F66B]/50 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </Button>

                  <Button
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    isDisabled={page >= totalPages}
                    className="bg-[#18251F] border border-white/10 text-white text-xs px-3 py-1.5 rounded-xl hover:border-[#B9F66B]/50 disabled:opacity-30 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 sm:p-16 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#202E27] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B] shadow-[0_0_20px_rgba(185,246,107,0.15)]">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              No Results Found
            </h3>
            <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-md mx-auto">
              No match results match your current filter criteria. Try resetting your search filters or check back later.
            </p>
            <div className="pt-2">
              <Button
                onPress={handleResetFilters}
                className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
