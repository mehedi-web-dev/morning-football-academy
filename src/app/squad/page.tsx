"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  RefreshCw,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  PlayerDocument,
  PaginationMeta,
} from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";
import PublicPlayerCard from "../../components/squad/PublicPlayerCard";

const POSITION_FILTERS: { label: string; value: string }[] = [
  { label: "সকল পজিশন", value: "ALL" },
  { label: "গোলরক্ষক", value: "Goalkeeper" },
  { label: "ডিফেন্ডার", value: "Defender" },
  { label: "মিডফিল্ডার", value: "Midfielder" },
  { label: "ফরোয়ার্ড", value: "Forward" },
];

/**
 * Public Squad Page (/squad)
 * Complete roster of active academy players with search and position filtering
 */
export default function SquadPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  const [players, setPlayers] = useState<PlayerDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active players from backend
  const fetchPlayers = useCallback((abortSignal?: { aborted: boolean }) => {
    const posParam = selectedPosition === "ALL" ? undefined : selectedPosition;
    const searchParam = searchTerm.trim() || undefined;

    apiClient.players
      .getAll({
        page,
        limit,
        isActive: true, // Only show active players on public website
        position: posParam,
        search: searchParam,
      })
      .then((res) => {
        if (!abortSignal?.aborted) {
          setPlayers(res.data || []);
          setPagination(res.pagination || null);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortSignal?.aborted) {
          setError("ডাটাবেজ থেকে একাডেমি স্কোয়াড তালিকা লোড করতে ব্যর্থ হয়েছে।");
          setIsLoading(false);
        }
      });
  }, [page, limit, selectedPosition, searchTerm]);

  useEffect(() => {
    const signal = { aborted: false };
    fetchPlayers(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchPlayers]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchPlayers();
  };

  const totalCount = pagination?.total ?? players.length;
  const totalPages = pagination?.totalPages ?? 1;


  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen">
      {/* 1. Cinematic Hero Header */}
      <section className="relative w-full py-16 sm:py-24 bg-[#101A17] border-b border-white/[0.08] overflow-hidden">
        {/* Background Image & Forest-Green Atmospheric Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/images/team.jpeg"
            alt="Morning Football Academy complete squad"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] opacity-25 saturate-[1.1] brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-[#101A17]/95 to-[#101A17]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/15 via-[#0d281a]/30 to-transparent blur-3xl opacity-60 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F]/90 backdrop-blur-md text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.22em] text-[10px] sm:text-[11px] uppercase px-3.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block animate-pulse" />
              অফিসিয়াল স্কোয়াড ২০২৬/২০২৭
            </Chip>
            <span className="text-xs font-mono text-[#A4B0A8]">
              {toBnNum(totalCount)} জন সক্রিয় খেলোয়াড়
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
            একাডেমি স্কোয়াড{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_25px_rgba(185,246,107,0.35)]">
              তালিকা।
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl leading-relaxed">
            মর্নিং ফুটবল একাডেমির অ্যাথলেটদের সাথে পরিচিত হোন। মাঠে কঠোর নিয়মানুবর্তিতা,
            কৌশলগত দূরদর্শিতা ও আপসহীন দলগত ঐক্যের প্রতিচ্ছবি।
          </p>
        </div>
      </section>

      {/* 2. Main Content: Search, Filter, & Player Grid */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Filter Controls */}
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Name Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম দিয়ে খেলোয়াড় খুঁজুন..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
            />
          </div>

          {/* Position Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden sm:block" />
              {POSITION_FILTERS.map((pf) => (
                <button
                  key={pf.value}
                  type="button"
                  onClick={() => {
                    setSelectedPosition(pf.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                    selectedPosition === pf.value
                      ? "bg-[#B9F66B] text-[#101A17] font-black shadow-sm"
                      : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="স্কোয়াড রিফ্রেশ করুন"
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Player Grid / States */}
        {error ? (
          /* Error State */
          <div className="p-12 rounded-3xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                একাডেমি স্কোয়াড লোড করা যায়নি
              </h3>
              <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
            </div>
            <Button
              onPress={handleRefresh}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#18181B] border border-white/5 aspect-[3/4] animate-pulse flex flex-col justify-end p-5 space-y-3"
              >
                <div className="h-4 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-36 bg-white/10 rounded" />
                <div className="h-4 w-28 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          /* Empty State */
          <div className="p-12 sm:p-16 rounded-3xl bg-[#18251F] border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#B9F66B]">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {searchTerm || selectedPosition !== "ALL"
                  ? "কোনো খেলোয়াড় খুঁজে পাওয়া যায়নি"
                  : "স্কোয়াড তালিকা হালনাগাদ হচ্ছে"}
              </h3>
              <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-sm mx-auto">
                {searchTerm || selectedPosition !== "ALL"
                  ? "আপনার অনুসন্ধানের শব্দ পরিবর্তন করুন অথবা অন্য কোনো পজিশন ফিল্টার নির্বাচন করে দেখুন।"
                  : "সক্রিয় স্কোয়াডের তালিকা শীঘ্রই এখানে দৃশ্যমান হবে। বর্তমানে একাডেমি ট্রায়াল আবেদন উন্মুক্ত রয়েছে।"}
              </p>
            </div>
            {searchTerm || selectedPosition !== "ALL" ? (
              <Button
                onPress={() => {
                  setSearchTerm("");
                  setSelectedPosition("ALL");
                  setPage(1);
                }}
                className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </Button>
            ) : (
              <Link href="/join">
                <Button className="bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#a8ec56] transition-all cursor-pointer">
                  একাডেমি ট্রায়ালে আবেদন করুন
                </Button>
              </Link>
            )}
          </div>
        ) : (
          /* Player Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <PublicPlayerCard key={player._id} player={player} />
            ))}
          </div>
        )}

        {/* 3. Pagination Controls */}
        {totalCount > limit && (
          <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs text-[#A4B0A8] font-mono">
              দেখানো হচ্ছে{" "}
              <strong className="text-white">
                {toBnNum(Math.min((page - 1) * limit + 1, totalCount))}
              </strong>{" "}
              থেকে{" "}
              <strong className="text-white">
                {toBnNum(Math.min(page * limit, totalCount))}
              </strong>{" "}
              (মোট <strong className="text-white">{toBnNum(totalCount)}</strong> জন)
            </span>

            <div className="flex items-center gap-2">
              <Button
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                isDisabled={page <= 1 || isLoading}
                className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-xs font-mono text-[#A4B0A8] px-2">
                পৃষ্ঠা <strong className="text-white">{toBnNum(page)}</strong> /{" "}
                <strong className="text-white">{toBnNum(totalPages)}</strong>
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

        {/* 4. Join Recruitment CTA Footer */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#18251F] border border-[#B9F66B]/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              মর্নিং ফুটবল একাডেমির ক্রেস্ট গায়ে জড়াতে চান?
            </h3>
            <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-lg">
              তরুণ ও মূল দলের প্রার্থীদের জন্য একাডেমি ট্রায়াল বর্তমানে উন্মুক্ত রয়েছে।
              আমাদের অভিজ্ঞ কোচিং প্যানেলে স্ক্রিনিংয়ের জন্য আজই আপনার আবেদন সম্পন্ন করুন।
            </p>
          </div>

          <Link href="/join" className="shrink-0">
            <Button className="bg-[#B9F66B] text-[#101A17] font-black text-xs tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-[#a8ec56] transition-all shadow-md cursor-pointer flex items-center gap-2">
              <span>স্কোয়াড ট্রায়ালে আবেদন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
