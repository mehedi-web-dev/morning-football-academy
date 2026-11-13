"use client";

import Image from "next/image";
import { Chip } from "@heroui/react";
import { Flame, ShieldCheck, Sparkles } from "lucide-react";

/**
 * Our Story Section
 * Two-column presentation featuring the official team logo badge and core academy commitments
 */
export default function OurStory() {
  return (
    <section
      id="story"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="our-story-heading"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Authentic Squad Photography & Official Academy Crest Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full rounded-3xl overflow-hidden bg-[#18251F] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
              <Image
                src="/images/team.jpeg"
                alt="Morning Football Academy squad gathered together on the pitch"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Multi-stop vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/40 to-transparent" />
              <div className="absolute inset-0 bg-[#B9F66B]/0 group-hover:bg-[#B9F66B]/5 transition-colors duration-300 pointer-events-none" />
            </div>

            {/* Official Morning Football Academy Team Logo Badge */}
            <div className="relative mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-right-6 z-20 flex items-center gap-4 p-4 rounded-2xl bg-[#18251F] border border-[#B9F66B]/40 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-[#101A17] border border-white/15 p-1 flex items-center justify-center">
                <Image
                  src="/images/logo.jpeg"
                  alt="Official Morning Football Academy Crest"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#B9F66B] block">
                  অফিসিয়াল ক্লাব ক্রেস্ট
                </span>
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-tight block">
                  MORNING FOOTBALL ACADEMY
                </span>
                <span className="text-[10px] text-[#A4B0A8] font-mono uppercase tracking-wider block">
                  RISE TOGETHER. PLAY TO WIN.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & 3 Core Highlights */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <Chip
                className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3.5 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block" />
                আমরা কারা
              </Chip>

              <h2
                id="our-story-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.12]"
              >
                গভীর ভালোবাসায় গড়া,{" "}
                <span className="text-[#B9F66B] drop-shadow-[0_0_24px_rgba(185,246,107,0.35)] block sm:inline">
                  ফুটবলের ঐক্যে অবিচল
                </span>
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-[#A4B0A8] leading-relaxed">
              <p>
                Morning Football Academy উন্নতমানের প্রশিক্ষণ, দলগত সমন্বয় এবং ক্রীড়াসুলভ শৃঙ্খলার মাধ্যমে প্রতিশ্রুতিশীল ফুটবলার তৈরিতে নিবেদিত। আমরা বিশ্বাস করি ফুটবল নিছক একটি খেলা নয়—এটি চরিত্র গঠন, মানসিক দৃঢ়তা এবং আজীবন ভ্রাতৃত্ববোধ তৈরির অন্যতম মাধ্যম।
              </p>
              <p>
                প্রতিটি অনুশীলন ড্রিল, ট্যাকটিক্যাল সেশন এবং প্রতিযোগিতামূলক ম্যাচকে আমরা খেলোয়াড়দের ক্রমাগত উন্নতির সুযোগ হিসেবে গ্রহণ করি। কঠোর অনুশীলন ও পারস্পরিক শ্রদ্ধার সমন্বয়ে একাডেমি এমন একটি পরিবেশ গড়ে তুলেছে যেখানে প্রতিটি খেলোয়াড় নিজেদের সামর্থ্যের সর্বোচ্চ বিকাশ ঘটাতে পারে।
              </p>
            </div>

            {/* Three Structured Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* 1. Passion for Football */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-2.5 hover:border-[#B9F66B]/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#101A17] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  ফুটবলের প্রতি অগাধ ভালোবাসা
                </h3>
                <p className="text-xs text-[#A4B0A8] leading-relaxed">
                  প্রতিটি সেশন ও ম্যাচে পূর্ণ একাগ্রতা এবং উৎসাহ নিয়ে মাঠে নামার অনুপ্রেরণা।
                </p>
              </div>

              {/* 2. Teamwork & Discipline */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-2.5 hover:border-[#B9F66B]/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#101A17] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  দলগত ঐক্য ও শৃঙ্খলা
                </h3>
                <p className="text-xs text-[#A4B0A8] leading-relaxed">
                  নিয়মানুবর্তিতা, পারস্পরিক শ্রদ্ধা এবং ট্যাকটিক্যাল সংহতির মাধ্যমে একে অপরের পাশে থাকা।
                </p>
              </div>

              {/* 3. Player Development */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-2.5 hover:border-[#B9F66B]/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#101A17] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  সার্বিক খেলোয়াড় বিকাশ
                </h3>
                <p className="text-xs text-[#A4B0A8] leading-relaxed">
                  টেকনিক্যাল দক্ষতা, শারীরিক ফিটনেস এবং সঠিক সিদ্ধান্ত গ্রহণের সুপরিকল্পিত বিকাশ ধারা।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
