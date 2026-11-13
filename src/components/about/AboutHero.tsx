"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { ArrowDown, ChevronRight } from "lucide-react";

/**
 * About Hero Section
 * Cinematic opening hero for Morning Football Academy with breadcrumbs, official crest, and stadium backdrop
 */
export default function AboutHero() {
  return (
    <section
      className="relative w-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-center overflow-hidden bg-[#101A17] text-white"
      aria-label="About Morning Football Academy"
    >
      {/* 1. Cinematic Stadium Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <Image
          src="/images/stadium-hero.jpg"
          alt="Morning Football Academy Stadium under floodlights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35 saturate-[1.1] brightness-90 animate-hero-zoom motion-reduce:animate-none"
        />

        {/* Multi-stop dark green vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/90 via-[#101A17]/80 to-[#101A17]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101A17] via-[#101A17]/70 to-[#101A17]" />

        {/* Atmospheric Lime Floodlight Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/10 via-[#0d281a]/25 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* 2. Main Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20 lg:py-24 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
          <Link
            href="/"
            className="text-[#A4B0A8] hover:text-[#B9F66B] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B9F66B]"
          >
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[#B9F66B] font-bold" aria-current="page">
            আমাদের সম্পর্কে
          </span>
        </nav>

        {/* Eyebrow & Official Club Badge Row */}
        <div className="flex flex-wrap items-center gap-3.5">
          <Chip
            className="bg-[#18251F]/90 backdrop-blur-md text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.24em] text-[11px] uppercase px-3.5 py-1 shadow-[0_0_15px_rgba(185,246,107,0.15)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block animate-pulse" />
            আমাদের গল্প
          </Chip>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
            <span className="text-[#B9F66B] font-bold">MFA</span>
            <span>অফিসিয়াল একাডেমি প্রোফাইল</span>
          </div>
        </div>

        {/* Heading */}
        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.08]">
            কেবল একটি ক্লাব নয়।{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_30px_rgba(185,246,107,0.4)] block sm:inline">
              একটি পরিবার।
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#A4B0A8] max-w-2xl leading-relaxed">
            Morning Football Academy-র মূল চালিকাশক্তি হলো গভীর ভালোবাসা, নিরন্তর অঙ্গীকার এবং পারস্পরিক দলগত সংহতি।
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link href="#story">
            <Button
              variant="primary"
              className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs sm:text-sm tracking-[0.16em] uppercase rounded-full px-7 py-3.5 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.3)] hover:shadow-[0_0_30px_rgba(185,246,107,0.5)] cursor-pointer flex items-center gap-2"
            >
              <span>আমাদের ইতিহাস ও গল্প</span>
              <ArrowDown className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="#values">
            <Button
              variant="outline"
              className="bg-white/[0.04] border border-white/20 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] font-black text-xs sm:text-sm tracking-[0.16em] uppercase rounded-full px-7 py-3.5 active:scale-95 transition-all cursor-pointer"
            >
              মূল মূল্যবোধ
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
