"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Activity, Target, Flame } from "lucide-react";
import { toBnNum } from "../../lib/bn-utils";

/**
 * DEMO DATA NOTICE:
 * The following values are temporary demonstration metrics for UI showcase
 * and do not represent officially verified historical academy records.
 */
export interface ClubStatItem {
  id: string;
  target: number;
  suffix: string;
  padZero?: boolean;
  label: string;
  sublabel: string;
  icon: typeof Users;
  description: string;
}

export const DEMO_CLUB_STATS: ClubStatItem[] = [
  {
    id: "squad-players",
    target: 25,
    suffix: "+",
    label: "স্কোয়াড খেলোয়াড়",
    sublabel: "সক্রিয় দল",
    icon: Users,
    description: "আমাদের যুব প্রশিক্ষণ কার্যক্রমে নিয়মিত অংশ নেওয়া প্রতিভাবান খেলোয়াড়",
  },
  {
    id: "matches-played",
    target: 10,
    suffix: "+",
    label: "ম্যাচ অনুষ্ঠিত",
    sublabel: "প্রতিযোগিতা",
    icon: Activity,
    description: "প্রতিযোগিতামূলক টুর্নামেন্ট ও প্রীতি ম্যাচে একাডেমি দলের অংশগ্রহণ",
  },
  {
    id: "total-goals",
    target: 15,
    suffix: "+",
    label: "মোট গোল",
    sublabel: "অর্জন",
    icon: Target,
    description: "লীগ ও বিভিন্ন টুর্নামেন্টে একাডেমি দলের করা মোট গোল",
  },
  {
    id: "years-passion",
    target: 1,
    suffix: "+",
    padZero: true,
    label: "ফুটবল সাধনার বছর",
    sublabel: "প্রতিষ্ঠা",
    icon: Flame,
    description: "তৃণমূল ফুটবলের উন্নয়নে অবিরাম একাডেমি কার্যক্রম",
  },
];

function StatCard({
  item,
  animate,
}: {
  item: ClubStatItem;
  animate: boolean;
}) {
  const [currentVal, setCurrentVal] = useState(0);
  const IconComponent = item.icon;

  useEffect(() => {
    if (!animate) return;

    const duration = 1400; // ms
    let startTime: number | null = null;
    let rafId: number;

    const updateCount = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(easeProgress * item.target);
      setCurrentVal(val);

      if (progress < 1) {
        rafId = requestAnimationFrame(updateCount);
      } else {
        setCurrentVal(item.target);
      }
    };

    rafId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(rafId);
  }, [animate, item.target]);

  const rawValue = animate ? currentVal : item.target;
  const displayValue = item.padZero
    ? String(rawValue).padStart(2, "0")
    : String(rawValue);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#18181B]/70 border border-white/10 p-4 sm:p-6 lg:p-7 hover:border-[#B9F66B]/40 hover:bg-[#18181B] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
      {/* Subtle top edge glow on hover */}
      <div
        className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#B9F66B]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top: Icon + Sublabel badge */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#B9F66B] group-hover:bg-[#B9F66B]/15 group-hover:border-[#B9F66B]/40 transition-colors duration-300 shrink-0">
          <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#A4B0A8]/80 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
          {item.sublabel}
        </span>
      </div>

      {/* Center: Numerical Display */}
      <div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-[#B9F66B] leading-none">
            {toBnNum(displayValue)}
          </span>
          <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#B9F66B]/80 font-mono">
            {item.suffix}
          </span>
        </div>

        {/* Label */}
        <h3 className="text-xs sm:text-sm font-black tracking-[0.14em] text-white uppercase mt-2 sm:mt-3 leading-snug">
          {item.label}
        </h3>
      </div>

      {/* Bottom: Context description (desktop/tablet) */}
      <p className="text-[11px] sm:text-xs text-[#A4B0A8] mt-3 leading-relaxed hidden sm:block border-t border-white/[0.06] pt-3">
        {item.description}
      </p>
    </div>
  );
}

export default function ClubStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    const currentEl = sectionRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]"
      aria-labelledby="club-stats-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-[11px] font-black tracking-[0.24em] text-[#B9F66B] uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
            আমাদের পরিসংখ্যান
          </div>

          <h2
            id="club-stats-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
          >
            কঠোর সাধনায় অর্জিত সাফল্য
          </h2>

          <p className="text-sm sm:text-base text-[#A4B0A8] mt-4 leading-relaxed">
            প্রতিটি সংখ্যা খেলোয়াড়দের অক্লান্ত পরিশ্রম, দলগত একতা ও ফুটবলের প্রতি নিবেদনের প্রমাণ।
          </p>
        </div>

        {/* 4 Statistics Grid: 4 cols on desktop, 2 cols on tablet & mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {DEMO_CLUB_STATS.map((stat) => (
            <StatCard key={stat.id} item={stat} animate={hasAnimated} />
          ))}
        </div>

        {/* Subtle Demonstration Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * একাডেমি প্রদর্শনীর সাধারণ তথ্য
          </p>
        </div>
      </div>
    </section>
  );
}
