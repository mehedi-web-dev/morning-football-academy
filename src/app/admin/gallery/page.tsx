"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  GalleryDocument,
  GalleryMediaType,
  PaginationMeta,
  ApiError,
} from "../../../lib/api-client";
import { toBnNum, formatBnDate } from "../../../lib/bn-utils";
import GalleryFormModal from "../../../components/admin/GalleryFormModal";
import DeleteGalleryModal from "../../../components/admin/DeleteGalleryModal";

const CATEGORY_FILTERS: { label: string; value: string }[] = [
  { label: "সকল অ্যালবাম", value: "ALL" },
  { label: "ম্যাচ ডে", value: "MATCH DAY" },
  { label: "অনুশীলন", value: "TRAINING" },
  { label: "দলের মুহূর্ত", value: "TEAM MOMENTS" },
  { label: "স্টেডিয়াম", value: "STADIUM" },
  { label: "উদযাপন", value: "CELEBRATIONS" },
  { label: "একাডেমি জীবন", value: "ACADEMY LIFE" },
];

const MEDIA_TYPE_FILTERS: { label: string; value: "ALL" | GalleryMediaType }[] = [
  { label: "সকল মিডিয়া", value: "ALL" },
  { label: "ছবি", value: "image" },
  { label: "ভিডিও", value: "video" },
];

const PUBLISHED_FILTERS: { label: string; value: "ALL" | "published" | "unpublished" }[] = [
  { label: "সকল স্ট্যাটাস", value: "ALL" },
  { label: "প্রকাশিত", value: "published" },
  { label: "খসড়া / অপ্রকাশিত", value: "unpublished" },
];

/**
 * Format asset timestamp
 */
function formatAssetDate(dateStr?: string): string {
  if (!dateStr) return "সাম্প্রতিক";
  try {
    return formatBnDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Admin Gallery Management Page (CRUD)
 * Fully connected to MongoDB through the Express backend Gallery REST APIs
 */
export default function AdminGalleryPage() {
  // Query Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMediaType, setSelectedMediaType] = useState<"ALL" | GalleryMediaType>("ALL");
  const [selectedPublished, setSelectedPublished] = useState<"ALL" | "published" | "unpublished">("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Data & Async State
  const [items, setItems] = useState<GalleryDocument[]>([]);
  const [allMetricsItems, setAllMetricsItems] = useState<GalleryDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Modals & Action State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GalleryDocument | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  // Load all items (both published and drafts) to calculate top metrics banner
  const loadMetricsData = useCallback(() => {
    Promise.all([
      apiClient.gallery.getAll({ limit: 100, isPublished: true, sortBy: "createdAt", sortOrder: "desc" }),
      apiClient.gallery.getAll({ limit: 100, isPublished: false, sortBy: "createdAt", sortOrder: "desc" }),
    ])
      .then(([pubRes, unpubRes]) => {
        const combined = [...(pubRes.data || []), ...(unpubRes.data || [])];
        setAllMetricsItems(combined);
      })
      .catch(() => {
        // Fallback to empty if metrics query encounters issue
        setAllMetricsItems([]);
      });
  }, []);

  // Fetch paginated gallery items from backend API
  const loadGallery = useCallback(
    (abortSignal?: { aborted: boolean }) => {
      const catParam = selectedCategory === "ALL" ? undefined : selectedCategory;
      const mediaParam = selectedMediaType === "ALL" ? undefined : selectedMediaType;

      // When "ALL" published status is selected, fetch both published and drafts in parallel
      // because backend defaults to isPublished: true when isPublished parameter is omitted.
      if (selectedPublished === "ALL") {
        Promise.all([
          apiClient.gallery.getAll({
            page: 1,
            limit: 50,
            category: catParam,
            mediaType: mediaParam,
            isPublished: true,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          apiClient.gallery.getAll({
            page: 1,
            limit: 50,
            category: catParam,
            mediaType: mediaParam,
            isPublished: false,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ])
          .then(([pubRes, unpubRes]) => {
            if (!abortSignal?.aborted) {
              const combined = [
                ...(pubRes.data || []),
                ...(unpubRes.data || []),
              ].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              const total = (pubRes.pagination?.total ?? 0) + (unpubRes.pagination?.total ?? 0);
              const totalPages = Math.ceil(total / limit) || 1;
              const startIndex = (page - 1) * limit;
              const paginatedSlice = combined.slice(startIndex, startIndex + limit);

              setItems(paginatedSlice);
              setPagination({
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
              });
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
                setError("ডাটাবেস থেকে গ্যালারি মিডিয়া লোড করতে ব্যর্থ হয়েছে।");
              }
              setIsLoading(false);
            }
          });
      } else {
        // Query specific published or unpublished status
        const isPubBool = selectedPublished === "published";

        apiClient.gallery
          .getAll({
            page,
            limit,
            category: catParam,
            mediaType: mediaParam,
            isPublished: isPubBool,
            sortBy: "createdAt",
            sortOrder: "desc",
          })
          .then((response) => {
            if (!abortSignal?.aborted) {
              setItems(response.data || []);
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
                setError("ডাটাবেস থেকে গ্যালারি মিডিয়া লোড করতে ব্যর্থ হয়েছে।");
              }
              setIsLoading(false);
            }
          });
      }
    },
    [page, limit, selectedCategory, selectedMediaType, selectedPublished]
  );

  // Initial load and parameter updates
  useEffect(() => {
    const signal = { aborted: false };
    loadGallery(signal);
    loadMetricsData();
    return () => {
      signal.aborted = true;
    };
  }, [loadGallery, loadMetricsData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    loadGallery();
    loadMetricsData();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: GalleryDocument) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  // Form Success Callback
  const handleFormSuccess = (savedItem: GalleryDocument, isEdit: boolean) => {
    setNotification({
      type: "success",
      message: isEdit
        ? `মিডিয়া "${savedItem.title}" সফলভাবে আপডেট করা হয়েছে।`
        : `মিডিয়া "${savedItem.title}" সফলভাবে গ্যালারিতে যোগ করা হয়েছে।`,
    });
    handleRefresh();
  };

  // Quick Toggle Publish / Unpublish Status
  const handleTogglePublish = async (item: GalleryDocument) => {
    setTogglingId(item._id);
    const newStatus = !item.isPublished;

    try {
      await apiClient.gallery.togglePublish(item._id, newStatus);
      setNotification({
        type: "success",
        message: newStatus
          ? `"${item.title}" এখন পাবলিক গ্যালারিতে প্রকাশিত।`
          : `"${item.title}" এখন খসড়া হিসেবে সংরক্ষিত (অপ্রকাশিত)।`,
      });
      handleRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "মিডিয়ার প্রকাশের স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setTogglingId(null);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item: GalleryDocument) => {
    setItemToDelete(item);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.gallery.delete(itemToDelete._id);
      setNotification({
        type: "success",
        message: `মিডিয়া "${itemToDelete.title}" সফলভাবে মুছে ফেলা হয়েছে।`,
      });
      setItemToDelete(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        handleRefresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "মিডিয়া মুছে ফেলতে ব্যর্থ হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search filtering (title, category, description, mediaUrl)
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();

    return items.filter((item) => {
      const matchesTitle = item.title.toLowerCase().includes(term);
      const matchesCategory = item.category.toLowerCase().includes(term);
      const matchesDesc = item.description?.toLowerCase().includes(term) ?? false;
      const matchesUrl = item.mediaUrl.toLowerCase().includes(term);

      return matchesTitle || matchesCategory || matchesDesc || matchesUrl;
    });
  }, [items, searchTerm]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    const source = allMetricsItems.length > 0 ? allMetricsItems : items;
    let images = 0;
    let videos = 0;
    let published = 0;
    let drafts = 0;

    source.forEach((item) => {
      if (item.mediaType === "image") images++;
      else videos++;

      if (item.isPublished) published++;
      else drafts++;
    });

    const total = source.length;

    return { total, images, videos, published, drafts };
  }, [allMetricsItems, items]);

  const totalCount = pagination?.total ?? items.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              গ্যালারি রিপোজিটরি
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              {toBnNum(totalCount)}টি মিডিয়া সংরক্ষিত
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            ফটো ও ভিডিও গ্যালারি।
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            ম্যাচ ডে ফটোগ্রাফি, ভিডিও হাইলাইটস, স্কোয়াড পোর্ট্রেট এবং অনুশীলনের মিডিয়া পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onPress={handleOpenCreate}
            className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মিডিয়া যুক্ত করুন</span>
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

      {/* 2. Media Metrics Highlights Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Assets */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              মোট মিডিয়া
            </span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A4B0A8]/40" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {toBnNum(metrics.total)}
          </span>
          <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
            ডাটাবেসে সংরক্ষিত
          </span>
        </div>

        {/* Photographs */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase tracking-wider block">
              আলোকচিত্র
            </span>
            <ImageIcon className="w-3.5 h-3.5 text-[#B9F66B]/70" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#B9F66B] block">
            {toBnNum(metrics.images)}
          </span>
          <span className="text-[10px] text-[#B9F66B]/70 block font-mono">
            হাই-রেজোলিউশন ছবি
          </span>
        </div>

        {/* Video Clips */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block">
              ভিডিও রিলস
            </span>
            <Video className="w-3.5 h-3.5 text-cyan-300/70" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-cyan-300 block">
            {toBnNum(metrics.videos)}
          </span>
          <span className="text-[10px] text-cyan-300/70 block font-mono">
            হাইলাইটস ও ড্রিলস
          </span>
        </div>

        {/* Published Assets */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-[#B9F66B]/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase tracking-wider block">
              প্রকাশিত
            </span>
            <Globe className="w-3.5 h-3.5 text-[#B9F66B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#B9F66B] block">
            {toBnNum(metrics.published)}
          </span>
          <span className="text-[10px] text-[#B9F66B]/70 block font-mono">
            পাবলিক গ্যালারিতে দৃশ্যমান
          </span>
        </div>

        {/* Drafts */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-amber-400/20 space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
              খসড়া / অপ্রকাশিত
            </span>
            <EyeOff className="w-3.5 h-3.5 text-amber-300/70" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
            {toBnNum(metrics.drafts)}
          </span>
          <span className="text-[10px] text-amber-300/70 block font-mono">
            পাবলিকের নিকট লুকানো
          </span>
        </div>
      </div>

      {/* 3. Search & Comprehensive Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-3">
        {/* Row 1: Search & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শিরোনাম, বিবরণ, ক্যাটাগরি বা ইউআরএল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Media Type Filter Segment */}
            <div className="flex items-center gap-1 bg-[#101A17] p-1 rounded-xl border border-white/10">
              {MEDIA_TYPE_FILTERS.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => {
                    setSelectedMediaType(mt.value);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedMediaType === mt.value
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "text-[#A4B0A8] hover:text-white"
                  }`}
                >
                  {mt.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="গ্যালারি রিফ্রেশ করুন"
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Row 2: Category Chips & Published Status Filter */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden sm:block" />
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-[#B9F66B] text-[#101A17] font-black"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Published Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase mr-1 hidden sm:inline">
              স্ট্যাটাস:
            </span>
            {PUBLISHED_FILTERS.map((pub) => (
              <button
                key={pub.value}
                type="button"
                onClick={() => {
                  setSelectedPublished(pub.value);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedPublished === pub.value
                    ? "bg-[#B9F66B] text-[#101A17] font-bold"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {pub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Gallery Grid */}
      {error ? (
        /* Error State */
        <div className="p-8 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              গ্যালারি ডেটা লোড করতে ব্যর্থ হয়েছে
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
          </div>
          {isAuthError ? (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider hover:bg-[#a8ec56] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>অ্যাডমিন লগইন করুন</span>
            </Link>
          ) : (
            <Button
              onPress={handleRefresh}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              পুনরায় চেষ্টা করুন
            </Button>
          )}
        </div>
      ) : isLoading && items.length === 0 ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#202E27] border border-white/5 overflow-hidden animate-pulse flex flex-col justify-between"
            >
              <div className="h-48 bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
              <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-6 w-16 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#A4B0A8]">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {searchTerm || selectedCategory !== "ALL" || selectedMediaType !== "ALL" || selectedPublished !== "ALL"
                ? "কোনো মানানসই মিডিয়া পাওয়া যায়নি"
                : "গ্যালারিতে কোনো মিডিয়া সংরক্ষিত নেই"}
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-sm mx-auto">
              {searchTerm || selectedCategory !== "ALL" || selectedMediaType !== "ALL" || selectedPublished !== "ALL"
                ? "ফিল্টার পরিবর্তন করে অথবা অন্য কোনো কিওয়ার্ড দিয়ে অনুসন্ধান করুন।"
                : "একাডেমি গ্যালারিতে প্রদর্শনের জন্য প্রথম ম্যাচ ডে ছবি বা অনুশীলনের ভিডিও যুক্ত করুন।"}
            </p>
          </div>
          {searchTerm || selectedCategory !== "ALL" || selectedMediaType !== "ALL" || selectedPublished !== "ALL" ? (
            <Button
              onPress={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedMediaType("ALL");
                setSelectedPublished("ALL");
              }}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              ফিল্টার রিসেট করুন
            </Button>
          ) : (
            <Button
              onPress={handleOpenCreate}
              className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম মিডিয়া যুক্ত করুন</span>
            </Button>
          )}
        </div>
      ) : (
        /* Gallery Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group rounded-2xl bg-[#202E27] border border-white/10 overflow-hidden hover:border-[#B9F66B]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Media Container */}
                <div className="relative h-48 bg-[#101A17] overflow-hidden flex items-center justify-center">
                  {item.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#B9F66B]/20 border border-[#B9F66B]/40 flex items-center justify-center text-[#B9F66B] shadow-md mb-2">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-white/80 uppercase">
                        ভিডিও রিল
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#202E27] via-transparent to-transparent opacity-80" />

                  {/* Category Chip (Top Left) */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#18251F]/90 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold tracking-wider text-[#B9F66B] uppercase">
                      {item.category}
                    </span>
                  </div>

                  {/* Media Type & Publish Status (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {/* Media Type Badge */}
                    <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-white uppercase flex items-center gap-1">
                      {item.mediaType === "image" ? (
                        <ImageIcon className="w-3 h-3 text-[#B9F66B]" />
                      ) : (
                        <Video className="w-3 h-3 text-cyan-300" />
                      )}
                      <span>{item.mediaType === "image" ? "ছবি" : "ভিডিও"}</span>
                    </span>

                    {/* Publish Status Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        item.isPublished
                          ? "bg-[#B9F66B]/20 text-[#B9F66B] border border-[#B9F66B]/30"
                          : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      }`}
                    >
                      {item.isPublished ? "প্রকাশিত" : "খসড়া"}
                    </span>
                  </div>
                </div>

                {/* Media Details */}
                <div className="p-4 space-y-1.5">
                  <h3 className="font-black text-white text-sm uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A4B0A8] line-clamp-2 leading-relaxed">
                    {item.description || "কোনো বিবরণ প্রদান করা হয়নি।"}
                  </p>
                </div>
              </div>

              {/* Card Footer & Actions */}
              <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#A4B0A8]/80">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{formatAssetDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quick Publish / Unpublish Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    disabled={togglingId === item._id}
                    title={item.isPublished ? "খসড়া হিসেবে সংরক্ষণ করুন" : "গ্যালারিতে প্রকাশ করুন"}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      item.isPublished
                        ? "bg-amber-400/10 border-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black"
                        : "bg-[#B9F66B]/10 border-[#B9F66B]/20 text-[#B9F66B] hover:bg-[#B9F66B] hover:text-[#101A17]"
                    } disabled:opacity-50`}
                  >
                    {togglingId === item._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : item.isPublished ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    title="মিডিয়া সম্পাদনা করুন"
                    className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[#A4B0A8] hover:text-[#B9F66B] hover:border-[#B9F66B]/40 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(item)}
                    title="মিডিয়া মুছে ফেলুন"
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Pagination & Page Size */}
      {totalCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A4B0A8] font-mono">
              প্রদর্শিত হচ্ছে{" "}
              <strong className="text-white">
                {toBnNum(Math.min((page - 1) * limit + 1, totalCount))}
              </strong>{" "}
              থেকে{" "}
              <strong className="text-white">
                {toBnNum(Math.min(page * limit, totalCount))}
              </strong>{" "}
              (মোট <strong className="text-white">{toBnNum(totalCount)}</strong> টি মিডিয়া)
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span className="text-[11px] text-[#A4B0A8] font-mono uppercase">
                প্রতি পৃষ্ঠায়:
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
                  {toBnNum(sz)}
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

      {/* 6. Live Database Integration Notice */}
      <div className="p-4 rounded-xl bg-[#18251F]/60 border border-white/5 text-center">
        <p className="text-[11px] font-mono text-[#A4B0A8]/70 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
          <span>
            Express REST API-এর মাধ্যমে লাইভ ডেটাবেজের সাথে সংযুক্ত। ছবি ও ভিডিও মিডিয়ার তাৎক্ষণিক প্রকাশনা নিয়ন্ত্রণ সমর্থিত।
          </span>
        </p>
      </div>

      {/* Add / Edit Gallery Modal */}
      <GalleryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        galleryItemToEdit={itemToEdit}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteGalleryModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        item={itemToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
