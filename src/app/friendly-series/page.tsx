"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Swords,
  Search,
  RefreshCw,
  AlertCircle,
  Inbox,
} from "lucide-react";
import {
  apiClient,
  FriendlySeriesDetailResponse,
  FriendlySeriesFormat,
  FriendlySeriesStatus,
  FriendlyTeamSummary,
  PaginationMeta,
} from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";
import PublicFriendlySeriesCard from "../../components/friendly-series/PublicFriendlySeriesCard";

type StatusTab = "ALL" | "ongoing" | "completed" | "upcoming";

const STATUS_TABS: { label: string; value: StatusTab }[] = [
  { label: "সকল সিরিজ", value: "ALL" },
  { label: "চলমান", value: "ongoing" },
  { label: "সমাপ্ত", value: "completed" },
  { label: "আসন্ন", value: "upcoming" },
];

export default function FriendlySeriesPage() {
  const [seriesList, setSeriesList] = useState<FriendlySeriesDetailResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [availableTeams, setAvailableTeams] = useState<FriendlyTeamSummary[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<StatusTab>("ALL");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("ALL");

  // Load available teams for team filter dropdown
  useEffect(() => {
    apiClient.friendlySeries
      .getAvailableAcademyTeams()
      .then((teams) => setAvailableTeams(teams))
      .catch((err) => console.error("Failed to load teams for filter:", err));
  }, []);

  // Fetch friendly series from backend API
  const loadSeries = useCallback(
    async (pageToLoad = 1, isRefresh = false) => {
      if (isRefresh) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const queryParams: {
          page: number;
          limit: number;
          status?: FriendlySeriesStatus;
          format?: FriendlySeriesFormat;
          teamId?: string;
        } = {
          page: pageToLoad,
          limit: 12,
        };

        if (selectedStatusTab !== "ALL") {
          queryParams.status = selectedStatusTab as FriendlySeriesStatus;
        }
        if (selectedFormat !== "ALL") {
          queryParams.format = selectedFormat as FriendlySeriesFormat;
        }
        if (selectedTeamId !== "ALL") {
          queryParams.teamId = selectedTeamId;
        }

        const res = await apiClient.friendlySeries.getAll(queryParams);
        setSeriesList(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "ফ্রেন্ডলি সিরিজের তথ্য লোড করতে ব্যর্থ হয়েছে";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedStatusTab, selectedFormat, selectedTeamId]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSeries(currentPage);
  }, [loadSeries, currentPage]);

  // Client-side search filtering across series name, season, venue, and team names
  const filteredSeries = useMemo(() => {
    if (!searchTerm.trim()) return seriesList;
    const q = searchTerm.toLowerCase().trim();
    return seriesList.filter((item) => {
      const matchName = item.series?.name?.toLowerCase().includes(q) ?? false;
      const matchSeason = item.series?.season?.toLowerCase().includes(q) ?? false;
      const matchVenue = item.series?.venue?.toLowerCase().includes(q) ?? false;
      const matchTeamA = item.teamA?.name?.toLowerCase().includes(q) ?? false;
      const matchTeamB = item.teamB?.name?.toLowerCase().includes(q) ?? false;
      return matchName || matchSeason || matchVenue || matchTeamA || matchTeamB;
    });
  }, [seriesList, searchTerm]);

  const ongoingCount = useMemo(() => {
    return seriesList.filter((s) => s.series?.status === "ongoing").length;
  }, [seriesList]);

  return (
    <div className="min-h-screen bg-[#101A17] text-white">
      {/* 1. Hero Header */}
      <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#18251F] via-[#101A17] to-[#101A17]">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B9F66B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18251F] border border-[#B9F66B]/30 shadow-inner">
            <Swords className="w-4 h-4 text-[#B9F66B]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
              একাডেমি ফ্রেন্ডলি সিরিজ
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            ফ্রেন্ডলি ফুটবল সিরিজ
          </h1>

          <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl mx-auto leading-relaxed">
            মর্নিং ফুটবল একাডেমির দলগুলোর মধ্যকার উত্তেজনাপূর্ণ দ্বিপাক্ষিক সিরিজ। বেস্ট অব ৩ এবং বেস্ট অব ৫ ফরম্যাটে চ্যাম্পিয়ন নির্ধারণী হাই-ভোল্টেজ ম্যাচ।
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-[#202E27] border border-white/10 text-white">
              মোট সিরিজ: <strong className="text-[#B9F66B]">{toBnNum(pagination?.total ?? seriesList.length)}</strong>
            </span>
            {ongoingCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                চলমান সিরিজ: {toBnNum(ongoingCount)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedStatusTab(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatusTab === tab.value
                    ? "bg-[#B9F66B] text-[#101A17] font-black shadow-md"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Format & Team Selectors + Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#B9F66B] cursor-pointer"
            >
              <option value="ALL">সকল ফরম্যাট</option>
              <option value="best_of_3">বেস্ট অব ৩</option>
              <option value="best_of_5">বেস্ট অব ৫</option>
            </select>

            {/* Team Filter */}
            {availableTeams.length > 0 && (
              <select
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#B9F66B] cursor-pointer max-w-[150px]"
              >
                <option value="ALL">সকল দল</option>
                {availableTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সিরিজ বা দল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs text-white placeholder-[#A4B0A8] focus:outline-none focus:border-[#B9F66B] transition-colors"
              />
            </div>

            {/* Manual Refresh */}
            <button
              onClick={() => loadSeries(currentPage, true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-[#B9F66B] transition-colors cursor-pointer disabled:opacity-50"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3. Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadSeries(currentPage, true)}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* 4. Series Grid / Loading Skeletons / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-[#18251F]/60 border border-white/5 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-6 bg-white/10 rounded w-3/4" />
                  <div className="h-20 bg-white/5 rounded-xl" />
                </div>
                <div className="h-10 bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#18251F]/40 p-12 sm:p-16 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#202E27] border border-white/10 flex items-center justify-center text-[#A4B0A8] mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">কোনো ফ্রেন্ডলি সিরিজ পাওয়া যায়নি</h3>
              <p className="text-xs sm:text-sm text-[#A4B0A8]">
                {searchTerm
                  ? `"${searchTerm}" এর সাথে মিলিয়ে কোনো সিরিজ খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করে দেখুন।`
                  : "বর্তমানে কোনো ফ্রেন্ডলি সিরিজ তালিকাভুক্ত নেই। নতুন সিরিজ শুরু হলে এখানে প্রদর্শিত হবে।"}
              </p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-xl bg-[#202E27] border border-white/10 text-xs font-bold text-white hover:border-[#B9F66B] transition-colors"
              >
                সার্চ মুছুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((seriesData) => (
              <PublicFriendlySeriesCard
                key={seriesData.series._id}
                seriesData={seriesData}
              />
            ))}
          </div>
        )}

        {/* 5. Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A4B0A8]">
            <span>
              পৃষ্ঠা {toBnNum(pagination.page)} / {toBnNum(pagination.totalPages)} (মোট {toBnNum(pagination.total)}টি সিরিজ)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3.5 py-1.5 rounded-xl bg-[#202E27] border border-white/10 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#283830] transition-colors"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="px-3.5 py-1.5 rounded-xl bg-[#202E27] border border-white/10 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#283830] transition-colors"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}