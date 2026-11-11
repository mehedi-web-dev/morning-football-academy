"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Calendar,
  AlertCircle,
  RefreshCw,
  Play,
  Shield,
} from "lucide-react";
import { apiClient, GalleryDocument } from "../../lib/api-client";

export default function GallerySection() {
  const [items, setItems] = useState<GalleryDocument[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const fetchGalleryItems = useCallback((abortSignal?: { aborted: boolean }) => {
    apiClient.gallery
      .getAll({
        isPublished: true,
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
      .then((res) => {
        if (!abortSignal?.aborted) {
          setItems(res.data || []);
          setTotalCount(res.pagination?.total ?? res.data?.length ?? 0);
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
  }, []);

  useEffect(() => {
    const signal = { aborted: false };
    fetchGalleryItems(signal);
    return () => {
      signal.aborted = true;
    };
  }, [fetchGalleryItems]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchGalleryItems();
  };

  // Derive unique categories from fetched items
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [items]);

  // Filter items based on active category tab
  const filteredItems = useMemo(() => {
    if (selectedCategory === "ALL") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const activeItem: GalleryDocument | null =
    activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] ?? null : null;

  const handleOpenLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? filteredItems.length - 1 : prev - 1;
    });
  }, [filteredItems.length]);

  const handleNext = useCallback(() => {
    setActiveLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === filteredItems.length - 1 ? 0 : prev + 1;
    });
  }, [filteredItems.length]);

  // Keyboard navigation & scroll locking for accessible lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  return (
    <section
      id="gallery"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="gallery-section-heading"
    >
      {/* Dark green & athletic lime ambient glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/5 via-[#18251F]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-[450px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d2a17]/40 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* 1. Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase text-[#B9F66B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
                OUR MOMENTS
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <Camera className="w-3.5 h-3.5 text-[#B9F66B]" />
                <strong className="text-[#B9F66B] font-bold">
                  {totalCount > 0 ? totalCount : "OFFICIAL"}
                </strong>{" "}
                ARCHIVED MOMENTS
              </span>
            </div>

            <h2
              id="gallery-section-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              CAPTURE THE MOMENT.
            </h2>

            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl leading-relaxed">
              Every match. Every training drill. Every triumph. Explore the official media gallery of Morning Football Academy.
            </p>
          </div>

          {/* Header Link to Full Gallery */}
          <div>
            <Link href="/gallery" className="group shrink-0 inline-block">
              <Button
                className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-6 py-3.5 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_18px_rgba(185,246,107,0.25)] hover:shadow-[0_0_28px_rgba(185,246,107,0.45)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>VIEW ALL GALLERY</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Category Filter Navigation Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_15px_rgba(185,246,107,0.35)]"
                      : "bg-[#18251F] text-[#A4B0A8] border border-white/10 hover:text-white hover:border-[#B9F66B]/30"
                  }`}
                  aria-pressed={isActive}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. States & Media Grid */}
        {error ? (
          <div className="p-8 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-[#A4B0A8]">{error}</p>
            <Button
              onPress={handleRetry}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : isLoading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 animate-pulse">
            <div className="sm:col-span-2 lg:col-span-7 lg:row-span-2 h-96 rounded-2xl bg-[#18251F]/60 border border-white/5" />
            <div className="sm:col-span-1 lg:col-span-5 h-48 rounded-2xl bg-[#18251F]/40 border border-white/5" />
            <div className="sm:col-span-1 lg:col-span-5 h-48 rounded-2xl bg-[#18251F]/40 border border-white/5" />
            <div className="sm:col-span-1 lg:col-span-4 h-56 rounded-2xl bg-[#18251F]/40 border border-white/5" />
            <div className="sm:col-span-1 lg:col-span-4 h-56 rounded-2xl bg-[#18251F]/40 border border-white/5" />
            <div className="sm:col-span-1 lg:col-span-4 h-56 rounded-2xl bg-[#18251F]/40 border border-white/5" />
          </div>
        ) : filteredItems.length > 0 ? (
          /* Asymmetric Editorial Masonry Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {filteredItems.map((item, index) => {
              let spanClass = "col-span-1";
              if (selectedCategory === "ALL") {
                if (index === 0) {
                  spanClass =
                    "sm:col-span-2 lg:col-span-7 lg:row-span-2 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px]";
                } else if (index === 1 || index === 2) {
                  spanClass = "sm:col-span-1 lg:col-span-5 min-h-[240px] sm:min-h-[250px]";
                } else {
                  spanClass = "sm:col-span-1 lg:col-span-4 min-h-[260px] sm:min-h-[280px]";
                }
              } else {
                spanClass = "sm:col-span-1 lg:col-span-4 min-h-[280px]";
              }

              const displayUrl =
                item.mediaType === "video"
                  ? item.thumbnailUrl || item.mediaUrl
                  : item.mediaUrl;

              return (
                <div
                  key={item._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenLightbox(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenLightbox(index);
                    }
                  }}
                  className={`group relative rounded-2xl bg-[#18251F] border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#B9F66B]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] flex flex-col justify-end ${spanClass}`}
                  aria-label={`Open media: ${item.title}`}
                >
                  {displayUrl ? (
                    <Image
                      src={displayUrl}
                      alt={item.title || "Morning Football Academy photo"}
                      fill
                      sizes={
                        index === 0 && selectedCategory === "ALL"
                          ? "(max-width: 1024px) 100vw, 58vw"
                          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      }
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106 motion-reduce:transform-none"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#18251F] to-[#101A17] flex items-center justify-center">
                      <Camera className="w-12 h-12 text-[#B9F66B]/30" />
                    </div>
                  )}

                  {/* Multi-Stop Cinematic Vignette Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/60 to-transparent" />
                  <div className="absolute inset-0 bg-[#B9F66B]/0 group-hover:bg-[#B9F66B]/5 transition-colors duration-300 pointer-events-none" />

                  {/* Top Overlay Bar */}
                  <div className="absolute top-3.5 inset-x-3.5 z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101A17]/90 backdrop-blur-md border border-[#B9F66B]/40 text-[10px] font-black tracking-wider text-[#B9F66B] uppercase shadow-sm">
                      <Shield className="w-3 h-3 text-[#B9F66B]" />
                      {item.category}
                    </span>

                    <span className="w-8 h-8 rounded-full bg-[#101A17]/80 backdrop-blur-md border border-white/15 text-white/80 group-hover:text-[#B9F66B] group-hover:border-[#B9F66B]/40 group-hover:scale-110 transition-all flex items-center justify-center shadow-md">
                      {item.mediaType === "video" ? (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>

                  {/* Bottom Overlay Bar */}
                  <div className="relative z-10 p-5 sm:p-6 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#B9F66B] uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B9F66B]" />
                      {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>

                    <h3 className="text-base sm:text-lg lg:text-xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors duration-200 line-clamp-2">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-[#A4B0A8] line-clamp-2 leading-relaxed opacity-90">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-10 sm:p-14 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.04] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              No Published Moments Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-md mx-auto leading-relaxed">
              Official photography and tournament footage will be uploaded and published here soon.
            </p>
          </div>
        )}

        {/* 4. Bottom Footer Link */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * Official Morning Football Academy media archive. Published photographs and tournament videos.
          </p>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-black tracking-[0.16em] uppercase text-[#B9F66B] hover:text-white transition-colors cursor-pointer"
          >
            <span>VIEW ALL GALLERY MOMENTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Accessible Lightbox Dialog Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Media preview: ${activeItem.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={handleCloseLightbox}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#141F1A] border border-white/15 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#101A17]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-[#B9F66B]/40 text-xs font-black tracking-wider text-[#B9F66B] uppercase">
                  <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
                  {activeItem.category}
                </span>

                <span className="text-xs font-mono text-[#A4B0A8]">
                  MOMENT {(activeLightboxIndex ?? 0) + 1} OF {filteredItems.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseLightbox}
                className="w-10 h-10 rounded-full bg-[#18251F] border border-white/15 text-white/80 hover:text-[#B9F66B] hover:border-[#B9F66B]/50 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Stage */}
            <div className="relative w-full h-[50vh] sm:h-[60vh] bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
              {activeItem.mediaType === "video" ? (
                activeItem.mediaUrl.endsWith(".mp4") || activeItem.mediaUrl.endsWith(".webm") ? (
                  <video
                    src={activeItem.mediaUrl}
                    controls
                    autoPlay
                    className="max-h-full max-w-full"
                  />
                ) : (
                  <iframe
                    src={activeItem.mediaUrl}
                    title={activeItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <Image
                  src={activeItem.mediaUrl}
                  alt={activeItem.title || "Morning Football Academy photograph"}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain object-center"
                />
              )}

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#101A17]/85 backdrop-blur-md border border-white/20 text-white hover:text-[#B9F66B] hover:border-[#B9F66B]/50 hover:scale-105 transition-all cursor-pointer flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
                aria-label="Previous photo (Left arrow key)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#101A17]/85 backdrop-blur-md border border-white/20 text-white hover:text-[#B9F66B] hover:border-[#B9F66B]/50 hover:scale-105 transition-all cursor-pointer flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
                aria-label="Next photo (Right arrow key)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 bg-[#101A17] border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  {activeItem.title}
                </h4>
                {activeItem.description && (
                  <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
                    {activeItem.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/gallery/${activeItem._id}`}>
                  <Button
                    className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>View Detail Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
