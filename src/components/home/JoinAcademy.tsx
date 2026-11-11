"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { ArrowRight, Mail, Trophy, Sparkles, ShieldCheck } from "lucide-react";

/**
 * Join Our Academy CTA Section
 * High-impact cinematic recruitment portal inspired by European football clubs
 */
export default function JoinAcademy() {
  return (
    <section
      id="join"
      className="relative w-full py-20 sm:py-28 lg:py-36 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="join-academy-heading"
    >
      {/* 1. Cinematic Background Stadium & Training Ground Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Real Local Football Squad & Pitch Photography */}
        <Image
          src="/images/team.jpeg"
          alt="Morning Football Academy players training together on the pitch under floodlights"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-[center_35%] md:object-center opacity-40 saturate-[1.15] brightness-90 animate-hero-zoom motion-reduce:animate-none"
        />

        {/* Multi-Stop Dark Forest-Green Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#101A17] via-[#0d281a]/85 to-[#101A17]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101A17] via-transparent to-[#101A17]" />

        {/* Center Atmospheric Floodlight & Stadium Lime Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] sm:h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/15 via-[#0d281a]/30 to-transparent blur-3xl opacity-70 pointer-events-none" />

        {/* Subtle Pitch Geometry Watermark Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#B9F66B_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
      </div>

      {/* 2. Main Center Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
        {/* Eyebrow Pill */}
        <div className="flex justify-center">
          <Chip
            className="bg-[#18251F]/90 backdrop-blur-md text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.26em] text-[11px] sm:text-xs uppercase px-4 py-1.5 shadow-[0_0_20px_rgba(185,246,107,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block animate-pulse" />
            JOIN THE MOVEMENT
          </Chip>
        </div>

        {/* Large Bold Heading */}
        <div className="space-y-3">
          <h2
            id="join-academy-heading"
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.06] drop-shadow-lg"
          >
            YOUR JOURNEY{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_35px_rgba(185,246,107,0.45)]">
              STARTS HERE.
            </span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-[#A4B0A8] max-w-2xl mx-auto leading-relaxed font-normal">
            Have the passion to play? Join Morning Football Academy and become part of our football
            journey. Develop your skills, build confidence, and grow together.
          </p>
        </div>

        {/* Quick Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs font-mono text-[#A4B0A8]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F]/80 backdrop-blur-sm border border-white/10">
            <Trophy className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>ELITE COACHING</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F]/80 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>MODERN FACILITIES</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F]/80 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>PLAYER PATHWAYS</span>
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          {/* Primary CTA: JOIN THE ACADEMY */}
          <Link href="/join" className="w-full sm:w-auto group">
            <Button
              variant="primary"
              className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs sm:text-sm tracking-[0.18em] uppercase rounded-full px-8 sm:px-10 py-4 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_24px_rgba(185,246,107,0.35)] hover:shadow-[0_0_36px_rgba(185,246,107,0.6)] cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>JOIN THE ACADEMY</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Button>
          </Link>

          {/* Secondary CTA: CONTACT US */}
          <Link href="/#contact" className="w-full sm:w-auto group">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-white/[0.04] backdrop-blur-md border border-white/20 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] font-black text-xs sm:text-sm tracking-[0.18em] uppercase rounded-full px-8 sm:px-10 py-4 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Mail className="w-4 h-4 text-[#B9F66B]" />
              <span>CONTACT US</span>
            </Button>
          </Link>
        </div>

        {/* Bottom Tagline with Athletic Accent Dividers */}
        <div className="pt-6 sm:pt-8 flex items-center justify-center gap-3 sm:gap-6">
          <span
            className="h-px w-10 sm:w-24 bg-gradient-to-r from-transparent to-[#B9F66B]/40"
            aria-hidden="true"
          />
          <span className="text-[11px] sm:text-xs font-mono font-black tracking-[0.28em] sm:tracking-[0.32em] uppercase text-[#B9F66B] drop-shadow-[0_0_12px_rgba(185,246,107,0.3)]">
            RISE TOGETHER. PLAY TO WIN.
          </span>
          <span
            className="h-px w-10 sm:w-24 bg-gradient-to-l from-transparent to-[#B9F66B]/40"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
