"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  PlayerDocument,
  PaginationMeta,
  ApiError,
} from "../../../lib/api-client";
import { toBnNum, formatBnDate, getBnPosition } from "../../../lib/bn-utils";
import PlayerFormModal from "../../../components/admin/PlayerFormModal";
import DeletePlayerModal from "../../../components/admin/DeletePlayerModal";

const POSITION_OPTIONS = [
  { label: "সকল পজিশন", value: "ALL" },
  { label: "ফরোয়ার্ড", value: "Forward" },
  { label: "মিডফিল্ডার", value: "Midfielder" },
  { label: "ডিফেন্ডার", value: "Defender" },
  { label: "গোলরক্ষক", value: "Goalkeeper" },
] as const;

const STATUS_OPTIONS = [
  { label: "সকল স্ট্যাটাস", value: "ALL" },
  { label: "সক্রিয় স্কোয়াড", value: "ACTIVE" },
  { label: "নিষ্ক্রিয়", value: "INACTIVE" },
] as const;

/**
 * Format DOB and calculate player age
 */
function formatPlayerBirth(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const ageDiff = Date.now() - date.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const formatted = formatBnDate(dateStr);
    return `${formatted} (${toBnNum(age)} বছর)`;
  } catch {
    return dateStr;
  }
}

/**
 * Position badge styling
 */
function getPositionBadgeStyle(pos: string) {
  switch (pos) {
    case "Forward":
      return "bg-[#B9F66B]/15 text-[#B9F66B] border-[#B9F66B]/30";
    case "Midfielder":
      return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "Defender":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "Goalkeeper":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    default:
      return "bg-white/10 text-white border-white/20";
  }
}

/**
 * Admin Players Management Page (CRUD)
 * Fully connected to MongoDB through the Express backend REST API
 */
export default function AdminPlayersPage() {
  // Query Filters & Pagination State
  const [search, setSearch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Data & Async State
  const [players, setPlayers] = useState<PlayerDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Modals & Active Actions State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<PlayerDocument | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerDocument | null>(null);
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

  // Fetch players from backend API
  const loadPlayers = useCallback(
    (abortSignal?: { aborted: boolean }) => {
      const activeParam =
        selectedStatus === "ALL"
          ? undefined
          : selectedStatus === "ACTIVE";

      apiClient.players
        .getAllAdmin({
          page,
          limit,
          search: search.trim() || undefined,
          position: selectedPosition === "ALL" ? undefined : selectedPosition,
          isActive: activeParam,
        })
        .then((response) => {
          if (!abortSignal?.aborted) {
            setPlayers(response.data || []);
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
              setError("ডাটাবেস থেকে খেলোয়াড় তালিকা লোড করতে ব্যর্থ হয়েছে।");
            }
            setIsLoading(false);
          }
        });
    },
    [page, limit, search, selectedPosition, selectedStatus]
  );

  // Trigger query on parameter change
  useEffect(() => {
    const signal = { aborted: false };
    loadPlayers(signal);
    return () => {
      signal.aborted = true;
    };
  }, [loadPlayers]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    loadPlayers();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setPlayerToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (player: PlayerDocument) => {
    setPlayerToEdit(player);
    setIsFormOpen(true);
  };

  // Form Success Callback
  const handleFormSuccess = (savedPlayer: PlayerDocument, isEdit: boolean) => {
    setNotification({
      type: "success",
      message: isEdit
        ? `খেলোয়াড় ${savedPlayer.fullName}-এর তথ্য সফলভাবে আপডেট করা হয়েছে।`
        : `খেলোয়াড় ${savedPlayer.fullName}-কে একাডেমি স্কোয়াডে যুক্ত করা হয়েছে।`,
    });
    handleRefresh();
  };

  // Open Delete Modal
  const handleOpenDelete = (player: PlayerDocument) => {
    setPlayerToDelete(player);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.players.delete(playerToDelete._id);
      setNotification({
        type: "success",
        message: `খেলোয়াড় ${playerToDelete.fullName}-কে সফলভাবে মুছে ফেলা হয়েছে।`,
      });
      setPlayerToDelete(null);
      // If deleting the last item on a page > 1, decrement page
      if (players.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        handleRefresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "খেলোয়াড়ের রেকর্ড মুছে ফেলতে ব্যর্থ হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

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
              স্কোয়াড রোস্টার
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              {toBnNum(totalCount)} জন খেলোয়াড় ডাটাবেসে নিবন্ধিত
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            খেলোয়াড় তালিকা।
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            একাডেমি প্রতিভা, স্কোয়াড বণ্টন, খেলোয়াড় প্রোফাইল এবং তথ্য পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onPress={handleOpenCreate}
            className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন খেলোয়াড় যুক্ত করুন</span>
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

      {/* 2. Search & Filter Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-4">
        {/* Row 1: Search & View Mode Toggles */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="খেলোয়াড়ের পুরো নাম দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on new search
              }}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
            />
          </div>

          {/* Right Action Tools: Refresh, Limit, View Mode */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Page Limit Selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#101A17] border border-white/10 text-xs text-[#A4B0A8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B9F66B]/50 font-mono"
              aria-label="Items per page"
            >
              <option value={8}>প্রতি পৃষ্ঠায় {toBnNum(8)} জন</option>
              <option value={12}>প্রতি পৃষ্ঠায় {toBnNum(12)} জন</option>
              <option value={24}>প্রতি পৃষ্ঠায় {toBnNum(24)} জন</option>
            </select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onPress={handleRefresh}
              className="p-2.5 rounded-xl bg-[#101A17] border border-white/10 text-[#A4B0A8] hover:text-[#B9F66B] hover:border-[#B9F66B]/40 transition-colors cursor-pointer"
              aria-label="খেলোয়াড় তালিকা রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-[#101A17] border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#B9F66B] text-[#101A17]"
                    : "text-[#A4B0A8] hover:text-white"
                }`}
                aria-label="গ্রিড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-[#B9F66B] text-[#101A17]"
                    : "text-[#A4B0A8] hover:text-white"
                }`}
                aria-label="টেবিল ভিউ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Filter Pills (Position & Status) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          {/* Position Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden md:block" />
            {POSITION_OPTIONS.map((pos) => {
              const isSelected = selectedPosition === pos.value;
              return (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => {
                    setSelectedPosition(pos.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                    isSelected
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>

          {/* Active Status Chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                    isSelected
                      ? "bg-white text-[#101A17] font-black"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Roster Content View */}
      {isLoading ? (
        // Loading Skeleton State
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#202E27] border border-white/10 overflow-hidden space-y-3 p-4 animate-pulse"
            >
              <div className="h-44 bg-white/5 rounded-xl" />
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-3 w-48 bg-white/5 rounded" />
              <div className="pt-3 border-t border-white/5 flex justify-between">
                <div className="h-4 w-16 bg-white/5 rounded" />
                <div className="h-4 w-16 bg-white/5 rounded" />
              </div>
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
              খেলোয়াড় তালিকা লোড করা সম্ভব হয়নি
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
                <span>আবার সাইন ইন করুন</span>
              </Link>
            ) : (
              <Button
                variant="outline"
                onPress={handleRefresh}
                className="bg-white/[0.04] border border-white/10 hover:border-[#B9F66B]/50 text-white hover:text-[#B9F66B] font-mono text-xs uppercase px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় চেষ্টা করুন</span>
              </Button>
            )}
          </div>
        </div>
      ) : players.length === 0 ? (
        // Empty State
        <div className="py-16 px-4 rounded-2xl bg-[#202E27] border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#18251F] border border-white/10 text-[#A4B0A8] flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              {search || selectedPosition !== "ALL" || selectedStatus !== "ALL"
                ? "ফিল্টারের সাথে কোনো খেলোয়াড় মেলেনি"
                : "ডাটাবেসে কোনো খেলোয়াড় নিবন্ধিত নেই"}
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              {search || selectedPosition !== "ALL" || selectedStatus !== "ALL"
                ? "আপনার অনুসন্ধান পরিবর্তন করুন বা পজিশন ও স্ট্যাটাস ফিল্টার সমন্বয় করুন।"
                : "একাডেমি ডাটাবেসে বর্তমানে কোনো খেলোয়াড়ের রেকর্ড নেই। আপনার প্রথম স্কোয়াড সদস্য যুক্ত করতে 'নতুন খেলোয়াড় যুক্ত করুন' বাটনে ক্লিক করুন।"}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {search || selectedPosition !== "ALL" || selectedStatus !== "ALL" ? (
              <Button
                variant="outline"
                onPress={() => {
                  setSearch("");
                  setSelectedPosition("ALL");
                  setSelectedStatus("ALL");
                  setPage(1);
                }}
                className="bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:text-[#B9F66B] px-4 py-2 rounded-xl"
              >
                সকল ফিল্টার সাফ করুন
              </Button>
            ) : (
              <Button
                onPress={handleOpenCreate}
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>প্রথম খেলোয়াড় নিবন্ধন করুন</span>
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        // 4A. Grid Cards View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {players.map((player) => (
            <div
              key={player._id}
              className="group rounded-2xl bg-[#202E27] border border-white/10 overflow-hidden hover:border-[#B9F66B]/50 transition-all flex flex-col justify-between shadow-sm"
            >
              {/* Photo & Header Badges */}
              <div>
                <div className="relative h-48 bg-[#101A17] overflow-hidden">
                  <Image
                    src={player.photo || "/images/players/mehedi.jpeg"}
                    alt={player.fullName}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202E27] via-transparent to-transparent opacity-85" />

                  {/* Jersey Number Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#101A17]/90 backdrop-blur-md border border-[#B9F66B]/40 text-[#B9F66B] font-mono font-black text-sm shadow-md">
                    #{toBnNum(player.jerseyNumber)}
                  </div>

                  {/* Position Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold tracking-widest uppercase shadow-sm ${getPositionBadgeStyle(
                        player.position
                      )}`}
                    >
                      {getBnPosition(player.position)}
                    </span>
                  </div>

                  {/* Active / Inactive Status Beacon */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md ${
                        player.isActive
                          ? "bg-[#18251F]/90 text-[#B9F66B] border border-[#B9F66B]/40"
                          : "bg-red-500/20 text-red-300 border border-red-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          player.isActive ? "bg-[#B9F66B]" : "bg-red-400"
                        }`}
                      />
                      {player.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </div>
                </div>

                {/* Player Info Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-black text-white text-base uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors truncate">
                    {player.fullName}
                  </h3>

                  <div className="space-y-1 text-xs text-[#A4B0A8]">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>জাতীয়তা:</span>
                      <span className="text-white font-bold">{player.nationality}</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span>জন্মতারিখ:</span>
                      <span className="text-white/80">
                        {formatPlayerBirth(player.dateOfBirth)}
                      </span>
                    </div>

                    {player.height && (
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span>শারীরিক গঠন:</span>
                        <span className="text-white/80">
                          {toBnNum(player.height)} {player.weight ? `• ${toBnNum(player.weight)}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Career Stats Preview */}
                  <div className="pt-2 grid grid-cols-3 gap-1 border-t border-white/5 text-center font-mono">
                    <div className="p-1 rounded bg-[#18251F]">
                      <span className="text-[9px] text-[#A4B0A8] block">ম্যাচ</span>
                      <span className="text-xs font-bold text-white">
                        {toBnNum(player.statistics?.appearances ?? 0)}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-[#18251F]">
                      <span className="text-[9px] text-[#B9F66B] block">গোল</span>
                      <span className="text-xs font-bold text-[#B9F66B]">
                        {toBnNum(player.statistics?.goals ?? 0)}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-[#18251F]">
                      <span className="text-[9px] text-sky-400 block">অ্যাসিস্ট</span>
                      <span className="text-xs font-bold text-sky-400">
                        {toBnNum(player.statistics?.assists ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 border-t border-white/5 bg-[#18251F]/40 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onPress={() => handleOpenEdit(player)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-[#B9F66B] hover:border-[#B9F66B]/50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>সম্পাদনা</span>
                </Button>

                <Button
                  variant="outline"
                  onPress={() => handleOpenDelete(player)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছুন</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 4B. Table List View
        <div className="rounded-2xl bg-[#202E27] border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18251F] text-[#A4B0A8] font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">খেলোয়াড়</th>
                  <th className="py-3 px-3">জার্সি</th>
                  <th className="py-3 px-3">পজিশন</th>
                  <th className="py-3 px-3">জাতীয়তা</th>
                  <th className="py-3 px-3">জন্মতারিখ</th>
                  <th className="py-3 px-3">পরিসংখ্যান</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#A4B0A8]">
                {players.map((player) => (
                  <tr key={player._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#101A17] border border-white/10 shrink-0">
                          <Image
                            src={player.photo || "/images/players/mehedi.jpeg"}
                            alt={player.fullName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-bold text-white uppercase block leading-tight">
                            {player.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-[#A4B0A8] block">
                            /{player.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#B9F66B]">
                      #{toBnNum(player.jerseyNumber)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${getPositionBadgeStyle(
                          player.position
                        )}`}
                      >
                        {getBnPosition(player.position)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {player.nationality}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {formatPlayerBirth(player.dateOfBirth)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-white">
                      {toBnNum(player.statistics?.appearances ?? 0)} ম্যাচ •{" "}
                      <span className="text-[#B9F66B]">
                        {toBnNum(player.statistics?.goals ?? 0)} গোল
                      </span>{" "}
                      •{" "}
                      <span className="text-sky-400">
                        {toBnNum(player.statistics?.assists ?? 0)} অ্যাসিস্ট
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          player.isActive
                            ? "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30"
                            : "bg-red-500/15 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {player.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(player)}
                          className="p-1.5 rounded-lg bg-white/[0.04] text-[#A4B0A8] hover:text-[#B9F66B] hover:bg-white/[0.08] transition-colors"
                          aria-label={`সম্পাদনা ${player.fullName}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(player)}
                          className="p-1.5 rounded-lg bg-white/[0.04] text-[#A4B0A8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`মুছুন ${player.fullName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-[#A4B0A8]">
            প্রদর্শিত হচ্ছে{" "}
            <span className="text-white font-bold">
              {toBnNum(Math.min((page - 1) * limit + 1, totalCount))}
            </span>{" "}
            থেকে{" "}
            <span className="text-white font-bold">
              {toBnNum(Math.min(page * limit, totalCount))}
            </span>
            , সর্বমোট{" "}
            <span className="text-[#B9F66B] font-bold">{toBnNum(totalCount)}</span>{" "}
            জন খেলোয়াড়
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              isDisabled={page <= 1 || isLoading}
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl bg-[#101A17] border border-white/10 text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>পূর্ববর্তী</span>
            </Button>

            <span className="px-3 py-1 rounded-xl bg-[#202E27] border border-white/10 text-white font-bold">
              {toBnNum(page)} / {toBnNum(totalPages)}
            </span>

            <Button
              variant="outline"
              isDisabled={page >= totalPages || isLoading}
              onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl bg-[#101A17] border border-white/10 text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals: Create/Edit & Delete */}
      <PlayerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        playerToEdit={playerToEdit}
        onSuccess={handleFormSuccess}
      />

      <DeletePlayerModal
        isOpen={Boolean(playerToDelete)}
        onClose={() => setPlayerToDelete(null)}
        player={playerToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
