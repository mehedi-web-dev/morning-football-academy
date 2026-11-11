"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Video, Play, Maximize2, Shield } from "lucide-react";
import { GalleryDocument } from "../../lib/api-client";

interface PublicGalleryCardProps {
  item: GalleryDocument;
  onClick?: () => void;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
}

/**
 * PublicGalleryCard Component
 * Athletic media tile supporting images and video thumbnails with fallback
 */
export default function PublicGalleryCard({
  item,
  onClick,
  aspectRatio = "video",
}: PublicGalleryCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayUrl =
    item.mediaType === "video"
      ? item.thumbnailUrl || item.mediaUrl
      : item.mediaUrl;

  const aspectClass = {
    video: "aspect-[16/10]",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: "h-64 sm:h-72",
  }[aspectRatio];

  const content = (
    <div
      className={`group relative rounded-2xl bg-[#18251F] border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#B9F66B]/50 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] flex flex-col justify-end ${aspectClass}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View ${item.mediaType}: ${item.title}`}
    >
      {/* 1. Media Image or Fallback */}
      {displayUrl && !imageError ? (
        <Image
          src={displayUrl}
          alt={item.title || "Morning Football Academy Gallery media"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] text-[#A4B0A8] p-4 text-center">
          <Camera className="w-10 h-10 text-[#B9F66B]/40 mb-2" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#A4B0A8]">
            {item.category || "Academy Moment"}
          </span>
        </div>
      )}

      {/* 2. Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />

      {/* 3. Top Badges: Category & Media Type */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101A17]/85 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest text-[#B9F66B] uppercase">
          <Shield className="w-3 h-3 text-[#B9F66B]" />
          <span>{item.category}</span>
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#101A17]/85 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
          {item.mediaType === "video" ? (
            <>
              <Video className="w-3 h-3 text-[#B9F66B]" />
              <span>VIDEO</span>
            </>
          ) : (
            <>
              <Camera className="w-3 h-3 text-[#B9F66B]" />
              <span>PHOTO</span>
            </>
          )}
        </span>
      </div>

      {/* 4. Center Play Button if Video */}
      {item.mediaType === "video" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-[#B9F66B]/90 text-[#0A0A0A] flex items-center justify-center shadow-[0_0_20px_rgba(185,246,107,0.4)] group-hover:scale-110 group-hover:bg-[#B9F66B] transition-transform duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* 5. Bottom Captions / Titles */}
      <div className="relative z-10 p-4 sm:p-5 space-y-1">
        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#B9F66B] transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-[#A4B0A8] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-[#A4B0A8]/80">
          <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1 text-[#B9F66B] font-bold group-hover:translate-x-1 transition-transform">
            <span>View</span>
            <Maximize2 className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );

  // If onClick is provided, render div directly; otherwise wrap in Link to detail page
  if (onClick) {
    return content;
  }

  return (
    <Link href={`/gallery/${item._id}`} className="block focus:outline-none">
      {content}
    </Link>
  );
}
