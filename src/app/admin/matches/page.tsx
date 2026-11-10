"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  MatchDocument,
  PaginationMeta,
  MatchStatus,
  ApiError,
} from "../../../lib/api-client";
import MatchFormModal from "../../../components/admin/MatchFormModal";
import DeleteMatchModal from "../../../components/admin/DeleteMatchModal";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "ALL STATUS", value: "ALL" },
  { label: "UPCOMING", value: "upcoming" },
  { label: "LIVE", value: "live" },
  { label: "COMPLETED", value: "completed" },
  { label: "POSTPONED", value: "postponed" },
  { label: "CANCELLED", value: "cancelled" },
];

const HOME_AWAY_FILTERS: { label: string; value: string }[] = [
  { label: "ALL VENUES", value: "ALL" },
  { label: "HOME ONLY", value: "home" },
  { label: "AWAY ONLY", value: "away" },
];

/**
 * Format match fixture date
 */
function formatMatchDate(dateStr: string): string {
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
 * Match status badge styling
 */
function getStatusBadge(status: MatchStatus) {
  switch (status) {
    case "upcoming":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
          UPCOMING
        </span>
      );
    case "live":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          LIVE NOW
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
          COMPLETED
        </span>
      );
    case "postponed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
          POSTPONED
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
          CANCELLED
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 text-[10px] font-mono uppercase">
          {status}
        </span>
      );
  }
}

/**
 * Admin Matches Management Page (CRUD)
 * Fully connected to MongoDB through the Express backend Match REST APIs
 */
export default function AdminMatchesPage() {
  // Query Filters & Pagination State
  const [competitionSearch, setCompetitionSearch] = useState("");
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedHomeAway, setSelectedHomeAway] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Data & Async State
  const [matches, setMatches] = useState<MatchDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Modals & Action State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<MatchDocument | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<MatchDocument | null>(null);
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

  // Fetch matches from backend API
  const loadMatches = useCallback(
    (abortSignal?: { aborted: boolean }) => {
      const statusParam = selectedStatus === "ALL" ? undefined : selectedStatus;
      const compParam = competitionSearch.trim() || undefined;
      const fromParam = fromDate || undefined;
      const toParam = toDate || undefined;

      apiClient.matches
        .getAll({
          page,
          limit,
          status: statusParam,
          competition: compParam,
          from: fromParam,
          to: toParam,
          sortBy: "matchDate",
          sortOrder: "asc", // chronological fixture ordering
        })
        .then((response) => {
          if (!abortSignal?.aborted) {
            setMatches(response.data || []);
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
              setError("Failed to fetch match fixtures from database.");
            }
            setIsLoading(false);
          }
        });
    },
    [page, limit, selectedStatus, competitionSearch, fromDate, toDate]
  );

  // Trigger query on parameter change
  useEffect(() => {
    const signal = { aborted: false };
    loadMatches(signal);
    return () => {
      signal.aborted = true;
    };
  }, [loadMatches]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    loadMatches();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setMatchToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (match: MatchDocument) => {
    setMatchToEdit(match);
    setIsFormOpen(true);
  };

  // Form Success Callback
  const handleFormSuccess = (savedMatch: MatchDocument, isEdit: boolean) => {
    setNotification({
      type: "success",
      message: isEdit
        ? `Fixture vs ${savedMatch.opponent} updated successfully.`
        : `Fixture vs ${savedMatch.opponent} scheduled successfully.`,
    });
    handleRefresh();
  };

  // Open Delete Modal
  const handleOpenDelete = (match: MatchDocument) => {
    setMatchToDelete(match);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!matchToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.matches.delete(matchToDelete._id);
      setNotification({
        type: "success",
        message: `Fixture vs ${matchToDelete.opponent} deleted successfully.`,
      });
      setMatchToDelete(null);
      if (matches.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        handleRefresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to delete match fixture.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side filtering for opponent name and Home/Away location
  const filteredMatches = matches.filter((m) => {
    const matchesOpponent =
      !opponentSearch.trim() ||
      m.opponent.toLowerCase().includes(opponentSearch.toLowerCase().trim());
    const matchesLocation =
      selectedHomeAway === "ALL" || m.homeAway === selectedHomeAway;
    return matchesOpponent && matchesLocation;
  });

  const totalCount = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              FIXTURE SCHEDULE
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              {totalCount} MATCHES IN DATABASE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            MATCH FIXTURES.
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            Plan upcoming matches, assign home/away venues, set kickoff times, and oversee matchday rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onPress={handleOpenCreate}
            className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>SCHEDULE MATCH</span>
          </Button>
        </div>
      </div>

      {/* Floating / Inline Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg transition-all animate-fade-in ${
            notification.type === "success"
              ? "bg-[#18251F] border-[#B9F66B]/40 text-[#B9F66B]"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#B9F66B] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-xs font-mono font-bold">
              {notification.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/60 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Filter & Search Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-4">
        {/* Row 1: Search Inputs & Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Opponent Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by opponent club..."
              value={opponentSearch}
              onChange={(e) => setOpponentSearch(e.target.value)}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
            />
          </div>

          {/* Competition Filter */}
          <div className="relative flex-1">
            <Shield className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tournament / league..."
              value={competitionSearch}
              onChange={(e) => {
                setCompetitionSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Page Limit */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#101A17] border border-white/10 text-xs text-[#A4B0A8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B9F66B]/50"
              aria-label="Items per page"
            >
              <option value={8}>8 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>

            {/* Toggle Date Range Filters */}
            <Button
              variant="outline"
              onPress={() => setShowAdvancedFilters((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                showAdvancedFilters || fromDate || toDate
                  ? "bg-[#B9F66B]/15 border-[#B9F66B]/50 text-[#B9F66B]"
                  : "bg-[#101A17] border-white/10 text-[#A4B0A8] hover:text-white"
              }`}
              aria-label="Toggle date range filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>

            {/* Refresh */}
            <Button
              variant="outline"
              onPress={handleRefresh}
              className="p-2.5 rounded-xl bg-[#101A17] border border-white/10 text-[#A4B0A8] hover:text-[#B9F66B] hover:border-[#B9F66B]/40 transition-colors cursor-pointer"
              aria-label="Refresh fixtures"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Row 2: Status & Home/Away Filter Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-white/5">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden sm:block" />
            {STATUS_FILTERS.map((s) => {
              const isSelected = selectedStatus === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(s.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                    isSelected
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Home/Away Chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            {HOME_AWAY_FILTERS.map((loc) => {
              const isSelected = selectedHomeAway === loc.value;
              return (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setSelectedHomeAway(loc.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                    isSelected
                      ? "bg-white text-[#101A17] font-black"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Optional Date Range Filter Drawer */}
        {showAdvancedFilters && (
          <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#18251F] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#B9F66B]/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#18251F] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#B9F66B]/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onPress={() => {
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
                className="w-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-white py-2 rounded-xl"
              >
                RESET DATES
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Matches Content List */}
      {isLoading ? (
        // Loading Skeleton
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#202E27] border border-white/10 animate-pulse flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-6 w-64 bg-white/10 rounded" />
                <div className="h-4 w-48 bg-white/5 rounded" />
              </div>
              <div className="h-9 w-32 bg-white/5 rounded-xl self-end md:self-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="p-6 rounded-2xl bg-[#202E27] border border-red-500/30 text-white space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              Unable to Load Match Fixtures
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {isAuthError ? (
              <Link
                href="/admin/login"
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN AGAIN</span>
              </Link>
            ) : (
              <Button
                variant="outline"
                onPress={handleRefresh}
                className="bg-white/[0.04] border border-white/10 hover:border-[#B9F66B]/50 text-white hover:text-[#B9F66B] font-mono text-xs uppercase px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RETRY QUERY</span>
              </Button>
            )}
          </div>
        </div>
      ) : filteredMatches.length === 0 ? (
        // Empty State
        <div className="py-16 px-4 rounded-2xl bg-[#202E27] border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#18251F] border border-white/10 text-[#A4B0A8] flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              {competitionSearch || opponentSearch || selectedStatus !== "ALL" || selectedHomeAway !== "ALL" || fromDate || toDate
                ? "No Fixtures Match Current Filters"
                : "No Match Fixtures in Database"}
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              {competitionSearch || opponentSearch || selectedStatus !== "ALL" || selectedHomeAway !== "ALL" || fromDate || toDate
                ? "Try clearing your tournament or opponent search, or reset the date and venue filters."
                : "The academy database currently has zero scheduled fixtures. Click 'Schedule Match' to plan your first fixture."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {competitionSearch || opponentSearch || selectedStatus !== "ALL" || selectedHomeAway !== "ALL" || fromDate || toDate ? (
              <Button
                variant="outline"
                onPress={() => {
                  setCompetitionSearch("");
                  setOpponentSearch("");
                  setSelectedStatus("ALL");
                  setSelectedHomeAway("ALL");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
                className="bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:text-[#B9F66B] px-4 py-2 rounded-xl"
              >
                CLEAR ALL FILTERS
              </Button>
            ) : (
              <Button
                onPress={handleOpenCreate}
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>SCHEDULE FIRST FIXTURE</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Matches Cards List
        <div className="space-y-3 sm:space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match._id}
              className="p-4 sm:p-5 rounded-2xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              {/* Match Details Columns */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Competition & Schedule Badge */}
                <div className="sm:w-48 shrink-0 space-y-1.5 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#B9F66B] shrink-0" />
                    <span className="text-[10px] font-mono font-black tracking-wider text-[#B9F66B] uppercase truncate block">
                      {match.competition}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[#A4B0A8] shrink-0" />
                    <span>{formatMatchDate(match.matchDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A4B0A8]">
                    <Clock className="w-3 h-3 text-[#A4B0A8] shrink-0" />
                    <span>{match.kickOffTime}</span>
                  </div>
                </div>

                {/* Match Teams & Venue */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                      Morning Football Academy
                    </span>
                    <span className="text-xs font-mono font-bold text-[#B9F66B] px-1.5 py-0.5 rounded bg-[#101A17] border border-white/10">
                      VS
                    </span>
                    <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                      {match.opponent}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A4B0A8]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B9F66B] shrink-0" />
                      <span className="truncate max-w-xs">{match.venue}</span>
                    </div>

                    <span className="text-white/20">•</span>

                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        match.homeAway === "home"
                          ? "bg-[#B9F66B]/10 text-[#B9F66B] border border-[#B9F66B]/30"
                          : "bg-white/5 text-[#A4B0A8] border border-white/10"
                      }`}
                    >
                      {match.homeAway === "home" ? "HOME VENUE" : "AWAY VENUE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                <div>{getStatusBadge(match.status)}</div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    onPress={() => handleOpenEdit(match)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-[#B9F66B] hover:border-[#B9F66B]/50 transition-colors cursor-pointer flex items-center gap-1"
                    aria-label={`Edit fixture vs ${match.opponent}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">EDIT</span>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={() => handleOpenDelete(match)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1"
                    aria-label={`Delete fixture vs ${match.opponent}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">DELETE</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-[#A4B0A8]">
            Showing{" "}
            <span className="text-white font-bold">
              {Math.min((page - 1) * limit + 1, totalCount)}
            </span>{" "}
            to{" "}
            <span className="text-white font-bold">
              {Math.min(page * limit, totalCount)}
            </span>{" "}
            of <span className="text-[#B9F66B] font-bold">{totalCount}</span>{" "}
            fixtures
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              isDisabled={page <= 1 || isLoading}
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-[#101A17] border border-white/10 text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </Button>

            <span className="px-3 py-1 rounded-xl bg-[#202E27] border border-white/10 text-white font-bold">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              isDisabled={page >= totalPages || isLoading}
              onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl bg-[#101A17] border border-white/10 text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals: Create/Edit & Delete */}
      <MatchFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        matchToEdit={matchToEdit}
        onSuccess={handleFormSuccess}
      />

      <DeleteMatchModal
        isOpen={Boolean(matchToDelete)}
        onClose={() => setMatchToDelete(null)}
        match={matchToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
