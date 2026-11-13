"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react";
import { ArrowRight, Calendar } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="relative w-full min-h-[680px] lg:min-h-[780px] flex flex-col justify-between overflow-hidden bg-[#0A0A0A] text-white"
      aria-label="Welcome to Morning Football Academy"
    >
      {/* 1. Clear & Sharp Background Stadium Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Real Professional Stadium & Squad Photograph */}
        <Image
          src="/images/team.jpeg"
          alt="Morning Football Academy Stadium with players under bright floodlights at night"
          fill
          priority
          sizes="100vw"
          quality={95}
          className="object-cover object-[70%_center] md:object-[center_35%] animate-hero-zoom opacity-100"
        />

        {/* Focused Legibility Gradient Overlay:
            Concentrated behind the left text column; center and right areas remain clear, sharp, and natural */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/60 md:via-[#0A0A0A]/35 to-transparent" />

        {/* Subtle Top Gradient for Header Transition */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0A0A0A]/70 to-transparent" />

        {/* Subtle Bottom Gradient for Information Bar Transition */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent" />
      </div>

      {/* 2. Main Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center py-16 sm:py-20 lg:py-24">
        {/* Left-Aligned Content Box (Max width 750px preserves visual stadium action on the right) */}
        <div className="max-w-[750px] space-y-6 sm:space-y-8">
          {/* Eyebrow Badge */}
          <div className="animate-hero-fade-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181B]/90 border border-[#B9F66B]/30 backdrop-blur-md shadow-[0_0_15px_rgba(185,246,107,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#B9F66B] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-[#B9F66B] uppercase">
                অফিসিয়াল ফুটবল একাডেমি
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="animate-hero-fade-2 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            অনুপ্রেরণায়{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_30px_rgba(185,246,107,0.4)]">
              উদ্বুদ্ধ
            </span>
            .<br />
            বিজয়ের প্রত্যয়ে{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_30px_rgba(185,246,107,0.4)]">
              প্রতিজ্ঞাবদ্ধ
            </span>
            .
          </h1>

          {/* Description */}
          <p className="animate-hero-fade-3 text-base sm:text-lg text-white/90 max-w-[620px] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-medium">
            Morning Football Academy-তে স্বাগতম। আমরা উদীয়মান তরুণ প্রতিভা বিকাশ, চারিত্রিক দৃঢ়তা গঠন ও মাঠে সর্বোচ্চ আবেগে লড়াই করি। আমাদের শুরু ফুটবল মাঠ থেকে, আর স্বপ্ন দিগন্তছোঁয়া।
          </p>

          {/* CTA Buttons */}
          <div className="animate-hero-fade-4 pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link href="/squad" className="group">
              <Button
                variant="primary"
                className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-7 py-3.5 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.3)] hover:shadow-[0_0_30px_rgba(185,246,107,0.5)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>আমাদের দল দেখুন</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/matches" className="group">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white/[0.04] backdrop-blur-sm border border-white/25 hover:border-white/60 text-white font-black text-xs tracking-[0.16em] uppercase rounded-full px-7 py-3.5 hover:bg-white/10 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#B9F66B]" />
                <span>আসন্ন ম্যাচসমূহ</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bottom Information Bar */}
      <div className="relative z-10 w-full border-t border-white/10 bg-[#0A0A0A]/85 backdrop-blur-md animate-hero-fade-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 py-5 sm:py-6">
            {/* 01 - OUR CLUB */}
            <div className="py-3 md:py-0 md:pr-8 flex flex-col justify-center">
              <span className="text-[11px] font-black tracking-[0.22em] text-[#A4B0A8] uppercase flex items-center gap-1.5">
                <span className="text-[#B9F66B] font-mono">০১</span> — আমাদের ক্লাব
              </span>
              <span className="text-sm sm:text-base font-black tracking-wider text-white uppercase mt-1">
                MORNING FOOTBALL ACADEMY
              </span>
            </div>

            {/* 02 - OUR MISSION */}
            <div className="py-3 md:py-0 md:px-8 flex flex-col justify-center">
              <span className="text-[11px] font-black tracking-[0.22em] text-[#A4B0A8] uppercase flex items-center gap-1.5">
                <span className="text-[#B9F66B] font-mono">০২</span> — আমাদের লক্ষ্য
              </span>
              <span className="text-sm sm:text-base font-black tracking-wider text-white uppercase mt-1">
                প্রতিভা অন্বেষণ ও বিকাশ
              </span>
            </div>

            {/* 03 - OUR PHILOSOPHY */}
            <div className="py-3 md:py-0 md:pl-8 flex flex-col justify-center">
              <span className="text-[11px] font-black tracking-[0.22em] text-[#A4B0A8] uppercase flex items-center gap-1.5">
                <span className="text-[#B9F66B] font-mono">০৩</span> — আমাদের দর্শন
              </span>
              <span className="text-sm sm:text-base font-black tracking-wider text-[#B9F66B] uppercase mt-1">
                RISE TOGETHER. PLAY TO WIN.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
