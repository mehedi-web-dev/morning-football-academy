"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Swords,
  Plus,
  Search,
  Calendar,
  Clock,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Minus,
  Award,
} from "lucide-react";
import AdminGuard from "../../../components/admin/AdminGuard";
import AdminDashboardShell from "../../../components/admin/AdminDashboardShell";
import {
  apiClient,
  FriendlySeriesDetailResponse,
  FriendlySeriesDocument,
  FriendlySeriesMatchDocument,
  FriendlyTeamSummary,
} from "../../../lib/api-client";
import {
  toBnNum,
  formatBnDate,
  formatBnKickOffTime,
  getBnFriendlySeriesStatus,
  getBnFriendlySeriesFormat,
  getBnFriendlyMatchStatus,
} from "../../../lib/bn-utils";
import CreateFriendlySeriesModal from "../../../components/admin/CreateFriendlySeriesModal";
import ScheduleFriendlyMatchModal from "../../../components/admin/ScheduleFriendlyMatchModal";
import SubmitFriendlyMatchResultModal from "../../../components/admin/SubmitFriendlyMatchResultModal";
import DeleteFriendlySeriesModal from "../../../components/admin/DeleteFriendlySeriesModal";

export default function AdminFriendlySeriesPage() {
  const [seriesList, setSeriesList] = useState<FriendlySeriesDetailResponse[]>([]);
  const [availableTeams, setAvailableTeams] = useState<FriendlyTeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected series for in-depth management
  const [selectedSeriesData, setSelectedSeriesData] =
    useState<FriendlySeriesDetailResponse | null>(null);
  const [matches, setMatches] = useState<FriendlySeriesMatchDocument[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seriesToEdit, setSeriesToEdit] = useState<FriendlySeriesDocument | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<FriendlySeriesDocument | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [matchToSchedule, setMatchToSchedule] = useState<FriendlySeriesMatchDocument | null>(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [matchToEnterResult, setMatchToEnterResult] =
    useState<FriendlySeriesMatchDocument | null>(null);

  // Notification Toast State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load available academy teams
  const loadAvailableTeams = useCallback(async () => {
    try {
      const teams = await apiClient.friendlySeries.getAvailableAcademyTeams();
      setAvailableTeams(teams);
    } catch (err: unknown) {
      console.error("Failed to load academy teams:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailableTeams();
  }, [loadAvailableTeams]);

  // Load series list
  const loadSeriesList = useCallback(async (isManual = false) => {
    if (isManual) setIsLoading(true);
    try {
      const res = await apiClient.friendlySeries.getAll({ limit: 100 });
      const list = res.data || [];
      setSeriesList(list);

      // Keep selected series updated
      if (selectedSeriesData) {
        const updated = list.find((s) => s.series._id === selectedSeriesData.series._id);
        if (updated) setSelectedSeriesData(updated);
      } else if (list.length > 0) {
        setSelectedSeriesData(list[0]);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ফ্রেন্ডলি সিরিজ তালিকা লোড করতে সমস্যা হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeriesData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSeriesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load matches for selected series
  const loadMatches = useCallback(async (seriesId: string) => {
    setIsLoadingMatches(true);
    try {
      const res = await apiClient.friendlySeries.getMatches(seriesId);
      setMatches(res.data || []);
    } catch (err: unknown) {
      console.error("Failed to load matches:", err);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSeriesData?.series._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMatches(selectedSeriesData.series._id);
    }
  }, [selectedSeriesData?.series._id, loadMatches]);

  // Filter series list
  const filteredSeries = useMemo(() => {
    return seriesList.filter((item) => {
      if (statusFilter !== "ALL" && item.series.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.series.name.toLowerCase().includes(q) ||
          item.series.season.toLowerCase().includes(q) ||
          (item.series.venue && item.series.venue.toLowerCase().includes(q)) ||
          item.teamA?.name?.toLowerCase().includes(q) ||
          item.teamB?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [seriesList, statusFilter, searchQuery]);

  const maxMatches = selectedSeriesData?.series.format === "best_of_5" ? 5 : 3;
  const isSeriesCompleted = selectedSeriesData?.series.status === "completed";
  const canScheduleMoreMatches =
    !isSeriesCompleted && matches.length < maxMatches;

  return (
    <AdminGuard>
      <AdminDashboardShell>
        <div className="space-y-8">
          {/* Top Banner / Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                <Swords className="w-4 h-4" />
                ফ্রেন্ডলি সিরিজ কন্ট্রোল প্যানেল
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                ফ্রেন্ডলি সিরিজ ম্যানেজমেন্ট
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                একাডেমি দলগুলোর মধ্যকার বেস্ট অব ৩ এবং বেস্ট অব ৫ সিরিজ গঠন, ফিক্সচার শিডিউল ও ম্যাচ রেজাল্ট এন্ট্রি।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadSeriesList(true);
                  loadAvailableTeams();
                  if (selectedSeriesData) loadMatches(selectedSeriesData.series._id);
                }}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => {
                  setSeriesToEdit(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                নতুন সিরিজ তৈরি
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                বন্ধ করুন
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: SERIES SELECTOR CARDS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-emerald-400" />
                বিদ্যমান ফ্রেন্ডলি সিরিজসমূহ ({toBnNum(filteredSeries.length)})
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="সিরিজ বা দল খুঁজুন..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="upcoming">আসন্ন (Upcoming)</option>
                  <option value="ongoing">চলমান (Ongoing)</option>
                  <option value="completed">সমাপ্ত (Completed)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="h-40 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400">সিরিজ লোড হচ্ছে...</span>
              </div>
            ) : filteredSeries.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
                <Swords className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">কোনো ফ্রেন্ডলি সিরিজ পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500">
                  নতুন সিরিজ তৈরি করতে উপরের &quot;নতুন সিরিজ তৈরি&quot; বাটনে ক্লিক করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSeries.map((item) => {
                  const isSelected = selectedSeriesData?.series._id === item.series._id;

                  return (
                    <div
                      key={item.series._id}
                      onClick={() => setSelectedSeriesData(item)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isSelected
                          ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {getBnFriendlySeriesStatus(item.series.status)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {getBnFriendlySeriesFormat(item.series.format, { short: true })}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-tight">
                          {item.series.name}
                        </h3>

                        {/* Matchup summary */}
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-300 truncate max-w-[90px]">
                              {item.teamA?.name}
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              {toBnNum(item.stats?.teamAWins ?? 0)} - {toBnNum(item.stats?.teamBWins ?? 0)}
                            </span>
                            <span className="font-semibold text-slate-300 truncate max-w-[90px]">
                              {item.teamB?.name}
                            </span>
                          </div>
                          {(item.stats?.draws ?? 0) > 0 && (
                            <div className="text-[10px] text-amber-400 text-center mt-1">
                              ড্র: {toBnNum(item.stats?.draws ?? 0)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isSelected ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {isSelected ? "বর্তমানে নির্বাচিত" : "পরিচালনা করুন"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>

                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/friendly-series/${item.series.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="পাবলিক পেজ দেখুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setSeriesToEdit(item.series);
                              setIsCreateModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSeriesToDelete(item.series);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: SELECTED SERIES MANAGEMENT CONSOLE */}
          {/* ======================================================== */}
          {selectedSeriesData && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-6 shadow-2xl">
              {/* Management Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      সক্রিয় সিরিজ ড্যাশবোর্ড
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedSeriesData.series.name} ({getBnFriendlySeriesFormat(selectedSeriesData.series.format)})
                  </h2>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>সিজন: <strong>{selectedSeriesData.series.season}</strong></span>
                    <span>•</span>
                    <span>স্ট্যাটাস: <strong>{getBnFriendlySeriesStatus(selectedSeriesData.series.status)}</strong></span>
                    <span>•</span>
                    <span>ভেন্যু: <strong>{selectedSeriesData.series.venue || "নির্ধারিত নয়"}</strong></span>
                  </p>
                </div>

                {/* Workflow Triggers */}
                <div className="flex flex-wrap items-center gap-3">
                  {canScheduleMoreMatches && (
                    <button
                      onClick={() => {
                        setMatchToSchedule(null);
                        setIsScheduleModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      নতুন ম্যাচ নির্ধারণ
                    </button>
                  )}

                  <Link
                    href={`/friendly-series/${selectedSeriesData.series.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    লাইভ ভিউ
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Series Scorecard & Outcome Banner */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                  {/* Team A */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: selectedSeriesData.teamA?.color || "#10b981" }}
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {selectedSeriesData.teamA?.name}
                      </h4>
                      <span className="text-xs font-mono text-emerald-400">
                        {toBnNum(selectedSeriesData.stats?.teamAWins ?? 0)} জয় (Wins)
                      </span>
                    </div>
                  </div>

                  {/* Draws / Center */}
                  <div className="md:col-span-1 text-center py-2 border-y md:border-y-0 md:border-x border-slate-800">
                    <span className="text-xs text-slate-400 block font-mono text-[10px]">
                      ড্র
                    </span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {toBnNum(selectedSeriesData.stats?.draws ?? 0)}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                    <div className="text-right">
                      <h4 className="font-bold text-white text-base">
                        {selectedSeriesData.teamB?.name}
                      </h4>
                      <span className="text-xs font-mono text-emerald-400">
                        {toBnNum(selectedSeriesData.stats?.teamBWins ?? 0)} জয় (Wins)
                      </span>
                    </div>
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: selectedSeriesData.teamB?.color || "#3b82f6" }}
                    />
                  </div>
                </div>

                {/* Outcome Callouts */}
                {isSeriesCompleted && (
                  <div className="pt-3 border-t border-slate-850">
                    {selectedSeriesData.championTeam ? (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>সিরিজ সমাপ্ত • অফিসিয়াল চ্যাম্পিয়ন: {selectedSeriesData.championTeam.name}</span>
                      </div>
                    ) : selectedSeriesData.series.isDrawnSeries ? (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                        <Minus className="w-4 h-4 text-amber-400" />
                        <span>সিরিজ সমাপ্ত • ড্র সিরিজ — কোনো চ্যাম্পিয়ন নেই</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Matches List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    ম্যাচ শিডিউল ও রেজাল্ট ম্যানেজমেন্ট ({toBnNum(matches.length)}/{toBnNum(maxMatches)})
                  </h3>
                </div>

                {isLoadingMatches ? (
                  <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  </div>
                ) : matches.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center space-y-2">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">কোনো ম্যাচ নির্ধারণ করা হয়নি</p>
                    <p className="text-xs text-slate-500">
                      ম্যাচ শিডিউল করতে উপরের &quot;নতুন ম্যাচ নির্ধারণ&quot; বাটনে ক্লিক করুন।
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((m) => {
                      const isCompleted = m.status === "completed";
                      const isDraw = isCompleted && Boolean(m.result?.isDraw);
                      const home =
                        m.homeTeamId === selectedSeriesData.teamA?._id
                          ? selectedSeriesData.teamA
                          : selectedSeriesData.teamB;
                      const away =
                        m.awayTeamId === selectedSeriesData.teamA?._id
                          ? selectedSeriesData.teamA
                          : selectedSeriesData.teamB;

                      return (
                        <div
                          key={m._id}
                          className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4 hover:border-slate-700 transition-all"
                        >
                          {/* Match Header */}
                          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-850 pb-2">
                            <span className="font-bold text-white font-mono">
                              ম্যাচ #{toBnNum(m.matchNumber)}
                            </span>

                            <div className="flex items-center gap-2">
                              {isDraw && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ম্যাচ ড্র
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${
                                  isCompleted
                                    ? "bg-slate-800 text-slate-300"
                                    : m.status === "live"
                                    ? "bg-rose-500/20 text-rose-400 animate-pulse"
                                    : "bg-blue-500/10 text-blue-400"
                                }`}
                              >
                                {getBnFriendlyMatchStatus(m.status)}
                              </span>
                            </div>
                          </div>

                          {/* Teams & Score */}
                          <div className="grid grid-cols-7 items-center gap-2 py-1">
                            <div className="col-span-3 text-right">
                              <span className="font-bold text-white text-sm block truncate">
                                {home?.name || "হোম দল"}
                              </span>
                              {home?.shortCode && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  {home.shortCode}
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 text-center">
                              {isCompleted && m.result ? (
                                <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sm text-white">
                                  {toBnNum(m.result.homeScore)} - {toBnNum(m.result.awayScore)}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 font-bold">VS</span>
                              )}
                            </div>

                            <div className="col-span-3 text-left">
                              <span className="font-bold text-white text-sm block truncate">
                                {away?.name || "অ্যাওয়ে দল"}
                              </span>
                              {away?.shortCode && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  {away.shortCode}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Date, Time & Venue */}
                          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-850">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>
                                {m.matchDate ? formatBnDate(m.matchDate) : "তারিখ নির্ধারিত নয়"}
                                {m.kickOffTime && ` • ${formatBnKickOffTime(m.kickOffTime)}`}
                              </span>
                            </div>

                            {m.venue && (
                              <span className="truncate max-w-[120px] text-slate-500">
                                {m.venue}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-850">
                            <button
                              onClick={() => {
                                setMatchToSchedule(m);
                                setIsScheduleModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
                            >
                              সময়সূচি ও ভেন্যু
                            </button>

                            <button
                              onClick={() => {
                                setMatchToEnterResult(m);
                                setIsResultModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {isCompleted ? "ফলাফল পরিবর্তন" : "ফলাফল এন্ট্রি"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODALS */}
        {/* ======================================================== */}
        {/* Create / Edit Series Modal */}
        <CreateFriendlySeriesModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          seriesToEdit={seriesToEdit}
          availableTeams={availableTeams}
          onSuccess={(saved, msg) => {
            setNotification({ type: "success", message: msg });
            loadSeriesList();
          }}
        />

        {/* Delete Series Modal */}
        <DeleteFriendlySeriesModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          series={seriesToDelete}
          onSuccess={(msg) => {
            setNotification({ type: "success", message: msg });
            setSelectedSeriesData(null);
            loadSeriesList();
          }}
        />

        {/* Schedule Match Modal */}
        {selectedSeriesData && (
          <ScheduleFriendlyMatchModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setMatchToSchedule(null);
            }}
            series={selectedSeriesData.series}
            teamA={selectedSeriesData.teamA}
            teamB={selectedSeriesData.teamB}
            existingMatches={matches}
            matchToEdit={matchToSchedule}
            onSuccess={(_saved, msg) => {
              setNotification({ type: "success", message: msg });
              loadSeriesList();
              loadMatches(selectedSeriesData.series._id);
            }}
          />
        )}

        {/* Submit / Correct Match Result Modal */}
        {selectedSeriesData && matchToEnterResult && (
          <SubmitFriendlyMatchResultModal
            isOpen={isResultModalOpen}
            onClose={() => {
              setIsResultModalOpen(false);
              setMatchToEnterResult(null);
            }}
            series={selectedSeriesData.series}
            match={matchToEnterResult}
            homeTeam={
              matchToEnterResult.homeTeamId === selectedSeriesData.teamA?._id
                ? selectedSeriesData.teamA
                : selectedSeriesData.teamB
            }
            awayTeam={
              matchToEnterResult.awayTeamId === selectedSeriesData.teamA?._id
                ? selectedSeriesData.teamA
                : selectedSeriesData.teamB
            }
            onSuccess={(_saved, msg) => {
              setNotification({ type: "success", message: msg });
              loadSeriesList();
              loadMatches(selectedSeriesData.series._id);
            }}
          />
        )}
      </AdminDashboardShell>
    </AdminGuard>
  );
}