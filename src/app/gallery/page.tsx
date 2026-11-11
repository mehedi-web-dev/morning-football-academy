"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Camera,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  GalleryDocument,
  GalleryMediaType,
  PaginationMeta,
} from "../../lib/api-client";
import PublicGalleryCard from "../../components/gallery/PublicGalleryCard";

const CATEGORY_PRESETS = [
  "ALL",
  "MATCH DAY",
  "TRAINING",
  "TEAM MOMENTS",
  "STADIUM",
  "CELEBRATIONS",
  "ACADEMY LIFE",
];

const MEDIA_TYPE_TABS: { label: string; value: "ALL" | GalleryMediaType }[] = [
  { label: "ALL MEDIA", value: "ALL" },
  { label: "PHOTOS", value: "image" },
  { label: "VIDEOS", value: "video" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMediaType, setSelectedMediaType] = useState<"ALL" | GalleryMediaType>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  const [items, setItems] = useState<GalleryDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback((abortSignal?: { aborted: boolean }) => {
    const catParam = selectedCategory === "ALL" ? undefined : selectedCategory;
    const typeParam = selectedMediaType === "ALL" ? undefined : selectedMediaType;

    apiClient.gallery
      .getAll({
        page,
        limit,
        category: catParam,
        mediaType: typeParam,
        isPublished: true, // Only show published items publicly
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      .then((res) => {
        if (!abortSignal?.aborted) {
          setItems(res.data || []);
          setPagination(res.pagination || null);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!abortSignal?.aborted) {
          setError("Failed to load gallery items from database.");
          setIsLoading(false);
        }
      });
  }, [page, limit, selectedCategory, selectedMediaType]);

  useEffect(() => {
    const signal = { aborted: false };
    fetchGallery(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchGallery]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchGallery();
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleMediaTypeChange = (type: "ALL" | GalleryMediaType) => {
    setSelectedMediaType(type);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedMediaType("ALL");
    setSearchQuery("");
    setPage(1);
  };

  // Client-side text search over fetched page items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Aggregate available categories by merging presets with any custom ones returned by API
  const availableCategories = useMemo(() => {
    const set = new Set(CATEGORY_PRESETS);
    items.forEach((item) => {
      if (item.category) set.add(item.category.toUpperCase());
    });
    return Array.from(set);
  }, [items]);

  const totalCount = pagination?.total ?? items.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen">
      {/* 1. Cinematic Hero Header */}
      <section className="relative w-full py-16 sm:py-24 bg-[#101A17] border-b border-white/[0.08] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-40">
          <Image
            src="/images/team.jpeg"
            alt="Morning Football Academy Gallery"
            fill
            priority
            className="object-cover object-center filter blur-sm brightness-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-[#101A17]/95 to-[#101A17]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-[#B9F66B]/30 text-xs font-mono font-bold tracking-[0.24em] text-[#B9F66B] uppercase shadow-[0_0_15px_rgba(185,246,107,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
            ACADEMY MEDIA ARCHIVE
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
              OFFICIAL <span className="text-[#B9F66B]">GALLERY.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
              Experience the energy, discipline, and triumph of Morning Football Academy. Browse high-resolution match photography, training sessions, and tournament highlights.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-[#A4B0A8]">
              <Layers className="w-4 h-4 text-[#B9F66B]" />
              <span>
                Published Media:{" "}
                <strong className="text-white font-bold">{totalCount}</strong>
              </span>
            </div>

            <Button
              onPress={handleRefresh}
              isDisabled={isLoading}
              className="bg-[#18251F] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`} />
              <span>Refresh Gallery</span>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Filter Controls Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-5">
          {/* Top row: Media Type Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#B9F66B]" />
                TYPE:
              </span>

              {MEDIA_TYPE_TABS.map((tab) => {
                const isActive = selectedMediaType === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleMediaTypeChange(tab.value)}
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

            {/* Title / Caption Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search captions or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#202E27] border border-white/10 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
              />
            </div>
          </div>

          {/* Bottom row: Category Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {availableCategories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#B9F66B] text-[#0A0A0A]"
                        : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-mono text-[#A4B0A8] hover:text-white underline underline-offset-4 cursor-pointer shrink-0 ml-auto"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* 3. Media Grid / States */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] rounded-2xl bg-[#18251F]/60 border border-white/5 flex flex-col justify-end p-5"
              >
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-6 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          /* Gallery Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <PublicGalleryCard key={item._id} item={item} aspectRatio="video" />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                <p className="text-xs font-mono text-[#A4B0A8]">
                  Showing page <strong className="text-white">{page}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong> ({totalCount} total media items)
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
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              No Gallery Items Found
            </h3>
            <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-md mx-auto">
              No published media moments match your current filter settings. Try resetting your search or category filters.
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
