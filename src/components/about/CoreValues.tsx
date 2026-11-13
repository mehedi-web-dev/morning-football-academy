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
    number: "০১",
    title: "দলগত ঐক্য",
    tagline: "একসাথে আমরা আরো শক্তিশালী।",
    description:
      "দলের চেয়ে কোনো একক খেলোয়াড় বড় নয়। আমরা সম্মিলিত বিজয়ের আনন্দ ভাগ করি এবং মাঠে যেকোনো প্রতিকূলতায় একে অপরের পাশে দাঁড়াই।",
    icon: Users,
  },
  {
    number: "০২",
    title: "শৃঙ্খলা",
    tagline: "ধারাবাহিকতাই সফলতার চাবিকাঠি।",
    description:
      "সময়ানুবর্তিতা, ট্যাকটিক্যাল মনোযোগ এবং মানসিক স্থিরতা। প্রতিদিনের কঠোর নিষ্ঠা ও প্রস্তুতিই তৈরি করে সত্যিকারের চ্যাম্পিয়ন।",
    icon: Shield,
  },
  {
    number: "০৩",
    title: "পারস্পরিক শ্রদ্ধা",
    tagline: "সতীর্থ, কোচ এবং প্রতিপক্ষকে সম্মান।",
    description:
      "আমরা সতীর্থ, কোচিং স্টাফ, ম্যাচ রেফারি এবং প্রতিপক্ষের প্রতি সর্বদা আন্তরিক ক্রীড়াসুলভ মনোভাব, বিনয় ও ফেয়ার প্লে বজায় রাখি।",
    icon: HeartHandshake,
  },
  {
    number: "০৪",
    title: "একাগ্র নিষ্ঠা",
    tagline: "হৃদয় ও প্রাণ ঢেলে খেলা।",
    description:
      "মাঠে তীব্র উদ্দীপনা, সাহস ও অবিচল জয়ের ক্ষুধা নিয়ে নামা। কিক-অফ থেকে শেষ বাঁশি পর্যন্ত আমরা নিজেদের শতভাগ উজাড় করে দিই।",
    icon: Flame,
  },
  {
    number: "০৫",
    title: "উৎকর্ষতা",
    tagline: "সবসময় নিজেকে ছাড়িয়ে যাওয়ার প্রত্যয়।",
    description:
      "আগের দিনের সাফল্যে আত্মতুষ্ট না হয়ে আমরা প্রতিনিয়ত আত্ম-উন্নয়ন, উচ্চতর মান অর্জন এবং দক্ষতা শাণিত করার সাধনায় নিমগ্ন থাকি।",
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
              আমাদের মূল নীতিমালা
            </Chip>
          </div>

          <h2
            id="core-values-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
          >
            আমাদের চালিকাশক্তি যে মূল্যবোধ
          </h2>

          <p className="text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
            Morning Football Academy-র প্রতিটি অনুশীলন সেশন, ট্যাকটিক্যাল ড্রিল এবং প্রতিযোগিতামূলক ম্যাচের পথপ্রদর্শক এই মূল্যবোধগুলো।
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
