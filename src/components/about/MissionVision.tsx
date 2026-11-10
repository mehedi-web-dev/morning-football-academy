"use client";

import { Chip } from "@heroui/react";
import { Target, Eye, CheckCircle2 } from "lucide-react";

/**
 * Mission & Vision Section
 * Two premium cards articulating the academy's foundational purpose and long-term aspirations
 */
export default function MissionVision() {
  return (
    <section
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#101A17] text-white border-t border-white/[0.08]"
      aria-labelledby="mission-vision-heading"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex justify-center">
            <Chip
              className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3.5 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block" />
              MISSION & VISION
            </Chip>
          </div>

          <h2
            id="mission-vision-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
          >
            OUR PURPOSE & DIRECTION.
          </h2>

          <p className="text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
            Guiding principles that define our coaching standards, academy culture, and long-term
            player development philosophy.
          </p>
        </div>

        {/* Two Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Card 1: OUR MISSION */}
          <div className="flex flex-col justify-between p-7 sm:p-9 rounded-3xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group">
            <div className="space-y-6">
              {/* Header: Icon & Eyebrow */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#18251F] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center shadow-[0_0_15px_rgba(185,246,107,0.15)] group-hover:scale-105 transition-transform duration-300">
                  <Target className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
                  PILLAR 01
                </span>
              </div>

              {/* Title & Official Description */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors">
                  OUR MISSION
                </h3>
                <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
                  To develop talented, disciplined, and confident football players through quality
                  training and teamwork.
                </p>
              </div>

              {/* Mission Pillars List */}
              <ul className="space-y-2.5 pt-2 border-t border-white/[0.08] text-xs sm:text-sm text-[#A4B0A8]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Structured training sessions elevating technical and tactical capabilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Nurturing athlete self-belief, mental strength, and sportsmanship.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Building unbreakable bonds of unity, collective responsibility, and trust.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: OUR VISION */}
          <div className="flex flex-col justify-between p-7 sm:p-9 rounded-3xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group">
            <div className="space-y-6">
              {/* Header: Icon & Eyebrow */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#18251F] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center shadow-[0_0_15px_rgba(185,246,107,0.15)] group-hover:scale-105 transition-transform duration-300">
                  <Eye className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
                  PILLAR 02
                </span>
              </div>

              {/* Title & Official Description */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors">
                  OUR VISION
                </h3>
                <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
                  To build a football community where players can grow, compete, and reach their full
                  potential.
                </p>
              </div>

              {/* Vision Pillars List */}
              <ul className="space-y-2.5 pt-2 border-t border-white/[0.08] text-xs sm:text-sm text-[#A4B0A8]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Cultivating an inspiring regional football culture rooted in shared values.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Preparing young footballers for higher levels of competitive play.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B9F66B] shrink-0 mt-0.5" />
                  <span>Empowering every enrolled player to realize their highest football ambitions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
