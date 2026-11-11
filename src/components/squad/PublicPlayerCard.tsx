"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { PlayerDocument } from "../../lib/api-client";
import { getShortPosition } from "../../lib/player-utils";

export { getShortPosition };

/**
 * PublicPlayerCard Component
 * Sports editorial portrait card with image fallback, position badge, and jersey watermark
 */
export default function PublicPlayerCard({ player }: { player: PlayerDocument }) {
  const [imageError, setImageError] = useState(false);
  const shortPos = getShortPosition(player.position);
  const profileUrl = `/squad/${player.slug}`;

  return (
    <Link
      href={profileUrl}
      className="group relative flex flex-col rounded-2xl bg-[#18181B] border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#B9F66B]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
      aria-label={`View profile for ${player.fullName}, #${player.jerseyNumber} ${player.position}`}
    >
      {/* 1. Portrait Container with 3:4 Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#111111] flex items-center justify-center">
        {player.photo && !imageError ? (
          <Image
            src={player.photo}
            alt={`${player.fullName} - ${player.position} #${player.jerseyNumber} of Morning Football Academy`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Graceful Image Fallback Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] p-6 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-[#202E27] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B] mb-3 shadow-[0_0_20px_rgba(185,246,107,0.15)] group-hover:border-[#B9F66B] transition-colors">
              <User className="w-10 h-10 opacity-80" />
            </div>
            <span className="text-3xl font-black font-mono text-white/30 group-hover:text-[#B9F66B]/50 transition-colors">
              #{player.jerseyNumber}
            </span>
            <span className="text-[10px] font-mono text-[#A4B0A8]/60 uppercase tracking-widest mt-1">
              {player.position}
            </span>
          </div>
        )}

        {/* Multi-Stop Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent pointer-events-none" />

        {/* Subtle Lime Atmospheric Tint on Hover */}
        <div className="absolute inset-0 bg-[#B9F66B]/0 group-hover:bg-[#B9F66B]/5 transition-colors duration-300 pointer-events-none" />

        {/* Top-Left: Position Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-wider text-[#B9F66B] uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            {shortPos}
          </span>
        </div>

        {/* Top-Right: Jersey Number Watermark */}
        <div className="absolute top-2 right-3 z-10 select-none pointer-events-none">
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white/20 group-hover:text-[#B9F66B] group-hover:drop-shadow-[0_0_15px_rgba(185,246,107,0.4)] transition-all duration-300">
            {player.jerseyNumber}
          </span>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
          {/* Nationality & Position */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#A4B0A8] uppercase">
              <span>{player.position}</span>
              {player.nationality && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-[#B9F66B]">{player.nationality}</span>
                </>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors duration-200 truncate">
              {player.fullName}
            </h3>
          </div>

          {/* Action Row */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[#B9F66B] uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>

            <span className="text-[11px] font-mono font-bold text-white/40 group-hover:text-white/70 transition-colors">
              #{player.jerseyNumber}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
