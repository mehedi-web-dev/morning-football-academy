"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  ResultDocument,
  PaginationMeta,
  ApiError,
} from "../../../lib/api-client";
import ResultFormModal from "../../../components/admin/ResultFormModal";
import DeleteResultModal from "../../../components/admin/DeleteResultModal";

type OutcomeFilter = "ALL" | "WIN" | "DRAW" | "LOSS";

/**
 * Format match result date
 */
function formatResultDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Derive match outcome from scoreline
 */
function getMatchOutcome(homeScore: number, awayScore: number): "WIN" | "DRAW" | "LOSS" {
  if (homeScore > awayScore) return "WIN";
  if (homeScore === awayScore) return "DRAW";
  return "LOSS";
}

/**
 * Outcome badge styling
 */
function getOutcomeBadge(outcome: "WIN" | "DRAW" | "LOSS") {
  switch (outcome) {
    case "WIN":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_6px_#B9F66B]" />
          WIN
        </span>
      );
    case "DRAW":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          DRAW
        </span>
      );
    case "LOSS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          LOSS
        </span>
      );
  }
}

/**
 * Admin Results Management Page (CRUD)
 * Fully connected to MongoDB through the Express backend Results REST APIs
 */
export default function AdminResultsPage() {
  // Query Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeFilter>("ALL");
  const [competitionFilter, setCompetitionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Data & Async State
  const [results, setResults] = useState<ResultDocument[]>([]);
  const [allSeasonResults, setAllSeasonResults] = useState<ResultDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Modals & Action State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resultToEdit, setResultToEdit] = useState<ResultDocument | null>(null);
  const [resultToDelete, setResultToDelete] = useState<ResultDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch all season results for performance metrics calculation
  const loadSeasonMetrics = useCallback(() => {
    apiClient.results
      .getAll({ limit: 100, sortBy: "matchDate", sortOrder: "desc" })
      .then((res) => {
        setAllSeasonResults(res.data || []);
      })
      .catch(() => {
        // Silently fallback to empty array if metrics fetch fails
        setAllSeasonResults([]);
      });
  }, []);

  // Fetch paginated results from backend API
  const loadResults = useCallback(
    (abortSignal?: { aborted: boolean }) => {
      const compParam = competitionFilter.trim() || undefined;

      apiClient.results
        .getAll({
          page,
          limit,
          competition: compParam,
          sortBy: "matchDate",
          sortOrder: "desc", // Latest match results first
        })
        .then((response) => {
          if (!abortSignal?.aborted) {
            setResults(response.data || []);
            setPagination(response.pagination || null);
            setError(null);
            setIsAuthError(false);
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!abortSignal?.aborted) {
            if (err instanceof ApiError) {
              setError(err.message);
              setIsAuthError(err.isAuthError);
            } else {
              setError("Failed to fetch match results from database.");
            }
            setIsLoading(false);
          }
        });
    },
    [page, limit, competitionFilter]
  );

  // Initial load and parameter updates
  useEffect(() => {
    const signal = { aborted: false };
    loadResults(signal);
    loadSeasonMetrics();
    return () => {
      signal.aborted = true;
    };
  }, [loadResults, loadSeasonMetrics]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    loadResults();
    loadSeasonMetrics();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setResultToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (result: ResultDocument) => {
    setResultToEdit(result);
    setIsFormOpen(true);
  };

  // Form Success Callback
  const handleFormSuccess = (savedResult: ResultDocument, isEdit: boolean) => {
    const outcome = getMatchOutcome(savedResult.homeScore, savedResult.awayScore);
    setNotification({
      type: "success",
      message: isEdit
        ? `Result vs ${savedResult.opponent} (${savedResult.homeScore}-${savedResult.awayScore}) updated successfully.`
        : `Result vs ${savedResult.opponent} logged as ${outcome} (${savedResult.homeScore}-${savedResult.awayScore}).`,
    });
    handleRefresh();
  };

  // Open Delete Modal
  const handleOpenDelete = (result: ResultDocument) => {
    setResultToDelete(result);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!resultToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.results.delete(resultToDelete._id);
      setNotification({
        type: "success",
        message: `Result vs ${resultToDelete.opponent} deleted successfully.`,
      });
      setResultToDelete(null);
      if (results.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        handleRefresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete result record.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side filtering for search query and outcome filter
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.opponent.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.competition.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.venue.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const outcome = getMatchOutcome(item.homeScore, item.awayScore);
      const matchesOutcome =
        selectedOutcome === "ALL" || outcome === selectedOutcome;

      return matchesSearch && matchesOutcome;
    });
  }, [results, searchTerm, selectedOutcome]);

  // Calculate Season Metrics from all season results
  const metrics = useMemo(() => {
    const source = allSeasonResults.length > 0 ? allSeasonResults : results;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    source.forEach((res) => {
      const outcome = getMatchOutcome(res.homeScore, res.awayScore);
      if (outcome === "WIN") wins++;
      else if (outcome === "DRAW") draws++;
      else losses++;

      goalsFor += res.homeScore;
      goalsAgainst += res.awayScore;
    });

    const total = source.length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const goalDiff = goalsFor - goalsAgainst;

    return {
      total,
      wins,
      draws,
      losses,
      winRate,
      goalsFor,
      goalsAgainst,
      goalDiff,
    };
  }, [allSeasonResults, results]);

  // Distinct competitions for tournament filter
  const distinctCompetitions = useMemo(() => {
    const comps = new Set<string>();
    allSeasonResults.forEach((r) => {
      if (r.competition && r.competition.trim()) {
        comps.add(r.competition.trim());
      }
    });
    return Array.from(comps).sort();
  }, [allSeasonResults]);

  const totalCount = pagination?.total ?? results.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              RESULTS LEDGER
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              {totalCount} FIXTURES ARCHIVED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            MATCH RESULTS.
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            Log official match scorelines, track tournament outcomes, and review season performance records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onPress={handleOpenCreate}
            className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>RECORD RESULT</span>
          </Button>
        </div>
      </div>

      {/* Floating / Inline Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg transition-all animate-fade-in ${
            notification.type === "success"
              ? "bg-[#18251F] border-[#B9F66B]/40 text-[#B9F66B]"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#B9F66B]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <p className="text-xs sm:text-sm font-medium text-white">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Season Highlights Metric Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Fixtures */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              TOTAL PLAYED
            </span>
            <Trophy className="w-3.5 h-3.5 text-[#A4B0A8]/40" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {metrics.total}
          </span>
          <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
            Recorded in database
          </span>
        </div>

        {/* Victories */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-[#B9F66B]/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase tracking-wider block">
              VICTORIES
            </span>
            <span className="w-2 h-2 rounded-full bg-[#B9F66B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#B9F66B] block">
            {metrics.wins}
          </span>
          <span className="text-[10px] text-[#B9F66B]/70 block font-mono">
            {metrics.total > 0 ? `${metrics.winRate}% win rate` : "--"}
          </span>
        </div>

        {/* Draws */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-amber-400/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
              DRAWS
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
            {metrics.draws}
          </span>
          <span className="text-[10px] text-amber-300/70 block font-mono">
            Shared points
          </span>
        </div>

        {/* Defeats */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-rose-500/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
              DEFEATS
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 block">
            {metrics.losses}
          </span>
          <span className="text-[10px] text-rose-400/70 block font-mono">
            Matches dropped
          </span>
        </div>

        {/* Goal Difference / Performance */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              GOAL METRICS
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#B9F66B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {metrics.goalsFor}:{metrics.goalsAgainst}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                metrics.goalDiff > 0
                  ? "text-[#B9F66B]"
                  : metrics.goalDiff < 0
                  ? "text-rose-400"
                  : "text-[#A4B0A8]"
              }`}
            >
              {metrics.goalDiff > 0 ? `+${metrics.goalDiff}` : metrics.goalDiff} GD
            </span>
          </div>
          <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
            Scored : Conceded
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Opponent & Competition Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records by opponent, tournament, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
          />
        </div>

        {/* Competition Dropdown & Outcome Filter Chips & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {distinctCompetitions.length > 0 && (
            <select
              value={competitionFilter}
              onChange={(e) => {
                setCompetitionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#A4B0A8] hover:text-white focus:text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <option value="">All Competitions</option>
              {distinctCompetitions.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden sm:block" />
            {(["ALL", "WIN", "DRAW", "LOSS"] as OutcomeFilter[]).map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => setSelectedOutcome(outcome)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedOutcome === outcome
                    ? "bg-[#B9F66B] text-[#101A17] font-black shadow-sm"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {outcome}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh results"
            className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 4. Results List / Grid */}
      {error ? (
        /* Error State */
        <div className="p-8 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Failed to load match results
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
          </div>
          {isAuthError ? (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider hover:bg-[#a8ec56] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in to Admin</span>
            </Link>
          ) : (
            <Button
              onPress={handleRefresh}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              Retry
            </Button>
          )}
        </div>
      ) : isLoading && results.length === 0 ? (
        /* Loading Skeletons */
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#202E27] border border-white/5 animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-8 rounded-md bg-white/5 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-white/5 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="h-8 w-16 bg-white/5 rounded-xl" />
                <div className="h-8 w-8 bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResults.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#A4B0A8]">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {searchTerm || selectedOutcome !== "ALL" || competitionFilter
                ? "No matching match results"
                : "No match results recorded yet"}
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-sm mx-auto">
              {searchTerm || selectedOutcome !== "ALL" || competitionFilter
                ? "Try clearing your filters or searching for another tournament or opponent team."
                : "Log your first academy match scoreline to track win rates, goals, and official season archives."}
            </p>
          </div>
          {searchTerm || selectedOutcome !== "ALL" || competitionFilter ? (
            <Button
              onPress={() => {
                setSearchTerm("");
                setSelectedOutcome("ALL");
                setCompetitionFilter("");
              }}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              onPress={handleOpenCreate}
              className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Result</span>
            </Button>
          )}
        </div>
      ) : (
        /* Results List */
        <div className="space-y-3">
          {filteredResults.map((result) => {
            const outcome = getMatchOutcome(result.homeScore, result.awayScore);

            return (
              <div
                key={result._id}
                className="p-4 sm:p-5 rounded-2xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Outcome Badge & Fixture Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Outcome Badge */}
                  <div className="w-16 shrink-0 text-center pt-0.5 sm:pt-0">
                    {getOutcomeBadge(outcome)}
                  </div>

                  {/* Teams & Scoreboard */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-sm sm:text-base font-black text-white tracking-tight">
                        Morning Football Academy
                      </span>

                      {/* Scoreline Badge */}
                      <div className="px-3 py-1 rounded-lg bg-[#101A17] border border-white/15 font-mono font-black text-sm sm:text-base text-white tracking-wider flex items-center gap-1.5 shadow-inner">
                        <span
                          className={
                            result.homeScore > result.awayScore
                              ? "text-[#B9F66B]"
                              : result.homeScore < result.awayScore
                              ? "text-rose-400"
                              : "text-amber-300"
                          }
                        >
                          {result.homeScore}
                        </span>
                        <span className="text-white/40">-</span>
                        <span
                          className={
                            result.awayScore > result.homeScore
                              ? "text-[#B9F66B]"
                              : result.awayScore < result.homeScore
                              ? "text-rose-400"
                              : "text-amber-300"
                          }
                        >
                          {result.awayScore}
                        </span>
                      </div>

                      <span className="text-sm sm:text-base font-black text-[#A4B0A8] tracking-tight">
                        {result.opponent}
                      </span>
                    </div>

                    {/* Metadata: Competition, Date, Venue */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A4B0A8]">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-[#B9F66B]/80 shrink-0" />
                        <span className="font-semibold text-white/90">
                          {result.competition}
                        </span>
                      </div>

                      <span className="text-white/20 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
                        <span>{formatResultDate(result.matchDate)}</span>
                      </div>

                      <span className="text-white/20 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">
                          {result.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t border-white/5 md:border-t-0 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(result)}
                    title="Edit scoreline and details"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:text-[#B9F66B] hover:border-[#B9F66B]/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">EDIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDelete(result)}
                    title="Delete match result"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">DELETE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination & Page Size */}
      {totalCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A4B0A8] font-mono">
              Showing{" "}
              <strong className="text-white">
                {Math.min((page - 1) * limit + 1, totalCount)}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(page * limit, totalCount)}
              </strong>{" "}
              of <strong className="text-white">{totalCount}</strong> results
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span className="text-[11px] text-[#A4B0A8] font-mono uppercase">
                Per page:
              </span>
              {[8, 12, 24].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setLimit(sz);
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                    limit === sz
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "text-[#A4B0A8] hover:text-white bg-white/5"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              isDisabled={page <= 1 || isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs font-mono text-[#A4B0A8] px-2">
              Page <strong className="text-white">{page}</strong> of{" "}
              <strong className="text-white">{totalPages}</strong>
            </span>

            <Button
              onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              isDisabled={page >= totalPages || isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 6. Live Database Integration Notice */}
      <div className="p-4 rounded-xl bg-[#18251F]/60 border border-white/5 text-center">
        <p className="text-[11px] font-mono text-[#A4B0A8]/70 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
          <span>
            Connected to MongoDB Match Results collection via Express REST API. Scoreline updates automatically sync with fixture records.
          </span>
        </p>
      </div>

      {/* Result Form Modal (Create / Edit) */}
      <ResultFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        resultToEdit={resultToEdit}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteResultModal
        isOpen={!!resultToDelete}
        onClose={() => setResultToDelete(null)}
        result={resultToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}