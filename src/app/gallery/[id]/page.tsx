import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Camera,
  Video,
} from "lucide-react";
import { Button } from "@heroui/react";
import { apiClient, GalleryDocument } from "../../../lib/api-client";

export const instant = false;

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GalleryDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await apiClient.gallery.getById(id);
    const item = res.data;

    if (!item || !item.isPublished) {
      return {
        title: "Gallery Moment Not Found | Morning Football Academy",
      };
    }

    return {
      title: `${item.title} | Morning Football Academy Gallery`,
      description:
        item.description ||
        `Official academy photography for ${item.title} (${item.category}) at Morning Football Academy.`,
      openGraph: {
        title: `${item.title} | Morning Football Academy`,
        description: item.description,
        images: [
          {
            url: item.thumbnailUrl || item.mediaUrl,
            alt: item.title,
          },
        ],
      },
    };
  } catch {
    return {
      title: "Gallery Moment Not Found | Morning Football Academy",
    };
  }
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;

  let item: GalleryDocument | null = null;
  try {
    const res = await apiClient.gallery.getById(id);
    item = res.data;
  } catch {
    notFound();
  }

  // Ensure item exists and is strictly published
  if (!item || !item.isPublished) {
    notFound();
  }

  const isVideo = item.mediaType === "video";

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#A4B0A8] hover:text-[#B9F66B] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>BACK TO GALLERY</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-white/10 text-[11px] font-mono text-[#A4B0A8] uppercase">
            <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Media Showcase Card */}
        <div className="relative rounded-3xl bg-[#18251F] border border-white/10 overflow-hidden shadow-2xl">
          {/* Subtle top edge accent glow */}
          <div
            className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#B9F66B]/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Media Player / Image Stage */}
          <div className="relative w-full aspect-video bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
            {isVideo ? (
              item.mediaUrl.endsWith(".mp4") || item.mediaUrl.endsWith(".webm") ? (
                <video
                  src={item.mediaUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={item.mediaUrl}
                  title={item.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <Image
                src={item.mediaUrl}
                alt={item.title || "Morning Football Academy photograph"}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-contain object-center"
              />
            )}
          </div>

          {/* Media Info Section */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-xs font-mono font-bold tracking-wider uppercase">
                    {isVideo ? <Video className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>{item.category}</span>
                  </span>

                  <span className="text-xs font-mono text-[#A4B0A8]">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
                  {item.title}
                </h1>
              </div>

              <div>
                <Link href="/gallery">
                  <Button
                    className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
                  >
                    View More Moments
                  </Button>
                </Link>
              </div>
            </div>

            {item.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-[#B9F66B] uppercase tracking-wider">
                  MOMENT CAPTION &amp; CONTEXT
                </h3>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {/* Audit details */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#A4B0A8]">
              <span>Media ID: {item._id}</span>
              <span>Published to Official Archive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
