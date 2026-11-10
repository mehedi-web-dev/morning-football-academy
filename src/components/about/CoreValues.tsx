"use client";

import { Chip } from "@heroui/react";
import { Users, Shield, HeartHandshake, Flame, Trophy } from "lucide-react";

interface ValueItem {
  number: string;
  title: string;
  tagline: string;
  description: string;
  icon: typeof Users;
}

const CORE_VALUES: ValueItem[] = [
  {
    number: "01",
    title: "TEAMWORK",
    tagline: "Together we achieve more.",
    description:
      "No individual stands above the team. We celebrate collective triumphs and lift one another through every challenge on the pitch.",
    icon: Users,
  },
  {
    number: "02",
    title: "DISCIPLINE",
    tagline: "Consistency creates excellence.",
    description:
      "Punctuality, tactical focus, and mental composure. Consistent daily effort and preparation build true champions.",
    icon: Shield,
  },
  {
    number: "03",
    title: "RESPECT",
    tagline: "Respect every player, coach, and opponent.",
    description:
      "We honor teammates, coaches, match officials, and opponents with genuine sportsmanship, humility, and fair play.",
    icon: HeartHandshake,
  },
  {
    number: "04",
    title: "PASSION",
    tagline: "Play with heart and commitment.",
    description:
      "Playing with high energy, courage, and relentless desire. We give 100% of our heart and soul from kickoff to the final whistle.",
    icon: Flame,
  },
  {
    number: "05",
    title: "EXCELLENCE",
    tagline: "Always strive to improve.",
    description:
      "Never complacent with yesterday's performance. We continuously seek self-critique, higher standards, and athletic growth.",
    icon: Trophy,
  },
];

/**
 * Core Values Section
 * 5 responsive editorial cards showcasing the foundational ethos of Morning Football Academy
 */
export default function CoreValues() {
  return (
    <section
      id="values"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="core-values-heading"
    >
      {/* Background glow accents */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/5 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex justify-center">
            <Chip
              className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3.5 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block" />
              FOUNDATIONAL PRINCIPLES
            </Chip>
          </div>

          <h2
            id="core-values-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
          >
            THE VALUES THAT DRIVE US
          </h2>

          <p className="text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
            The core tenets that guide every training session, tactical drill, and competitive match
            at Morning Football Academy.
          </p>
        </div>

        {/* Five Responsive Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 items-stretch">
          {CORE_VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.number}
                className="flex flex-col justify-between p-6 rounded-3xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/50 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon & Number */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#18251F] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center group-hover:bg-[#B9F66B] group-hover:text-[#0A0A0A] transition-colors duration-300 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-2xl font-black font-mono tracking-tight text-white/20 group-hover:text-[#B9F66B] transition-colors">
                      {val.number}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors">
                      {val.title}
                    </h3>
                    <p className="text-xs font-bold text-[#B9F66B] tracking-wide">
                      {val.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#A4B0A8] leading-relaxed pt-1">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
