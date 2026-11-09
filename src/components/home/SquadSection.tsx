"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEMO_SQUAD_PLAYERS, Player } from "../../data/players";

/**
 * Reusable Player Card Component
 * Sports editorial portrait card with jersey number watermark and position badges
 */
function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={player.profileHref}
      className="group relative flex flex-col rounded-2xl bg-[#18181B] border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#B9F66B]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
      aria-label={`View profile for ${player.name}, #${player.number} ${player.position}`}
    >
      {/* 1. Portrait Container with 3:4 Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#111111]">
        {/* Real Player Image */}
        <Image
          src={player.image}
          alt={`${player.name} - ${player.position} #${player.number} of Morning Football Academy`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Multi-Stop Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/65 to-transparent" />

        {/* Subtle Lime Atmospheric Tint on Hover */}
        <div className="absolute inset-0 bg-[#B9F66B]/0 group-hover:bg-[#B9F66B]/5 transition-colors duration-300 pointer-events-none" />

        {/* Top-Left: Position Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-wider text-[#B9F66B] uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            {player.shortPosition}
          </span>
        </div>

        {/* Top-Right: Prominent Jersey Number Watermark */}
        <div className="absolute top-2 right-3 z-10 select-none pointer-events-none">
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white/20 group-hover:text-[#B9F66B] group-hover:drop-shadow-[0_0_15px_rgba(185,246,107,0.4)] transition-all duration-300">
            {player.number}
          </span>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
          {/* Position & Name */}
          <div className="space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#A4B0A8] uppercase block">
              {player.position}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors duration-200">
              {player.name}
            </h3>
          </div>

          {/* Action Row */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[#B9F66B] uppercase flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>

            <span className="text-[11px] font-mono font-bold text-white/40 group-hover:text-white/70 transition-colors">
              #{player.number}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SquadSection() {
  return (
    <section
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]"
      aria-labelledby="squad-section-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
                OUR SQUAD
              </div>

              {/* Squad Count Label */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <strong className="text-[#B9F66B] font-bold">25+</strong> SQUAD
                MEMBERS
              </span>
            </div>

            <h2
              id="squad-section-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              MEET THE SQUAD.
            </h2>

            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-xl leading-relaxed">
              Talent, discipline, and teamwork make us stronger. Meet the players
              representing Morning Football Academy.
            </p>
          </div>

          {/* View Full Squad Button */}
          <div>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(185,246,107,0.25)] hover:shadow-[0_0_24px_rgba(185,246,107,0.45)] group shrink-0"
            >
              <span>VIEW FULL SQUAD</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. Player Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {DEMO_SQUAD_PLAYERS.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {/* 3. Demonstration Disclaimer Footer */}
        <div className="pt-2 text-center border-t border-white/[0.06]">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * Demonstration player profiles for platform showcase. Official squad
            registrations will appear here upon completion of academy enrollments.
          </p>
        </div>
      </div>
    </section>
  );
}
