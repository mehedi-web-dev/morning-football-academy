"use client";

import Image from "next/image";
import { Chip } from "@heroui/react";
import {
  Activity,
  Compass,
  Dumbbell,
  Users2,
  Medal,
  CheckCircle2,
} from "lucide-react";

interface PhilosophyPillar {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Activity;
}

const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    title: "টেকনিক্যাল দক্ষতা বিকাশ",
    subtitle: "বল নিয়ন্ত্রণ ও নির্ভুলতা",
    description:
      "উচ্চ চাপের মধ্যেও নিখুঁত ফার্স্ট টাচ, ক্লোজ কন্ট্রোল, যথাযথ পাসিং রেঞ্জ এবং নিখুঁত ফিনিশিং সক্ষমতা তৈরি করা।",
    icon: Activity,
  },
  {
    title: "ট্যাকটিক্যাল প্রজ্ঞা ও সচেতনতা",
    subtitle: "খেলার দূরদর্শিতা ও দ্রুত সিদ্ধান্ত",
    description:
      "মাঠে সঠিক স্পেস তৈরি, প্রেসিং ট্রিগার অনুধাবন, ট্রানজিশন ভিশন এবং ম্যাচের প্রতিটি মুহূর্তে সময়োপযোগী সিদ্ধান্ত গ্রহণ।",
    icon: Compass,
  },
  {
    title: "শারীরিক সক্ষমতা ও ফিটনেস",
    subtitle: "অ্যাথলেটিক কন্ডিশনিং ও গতিশীলতা",
    description:
      "ফুটবল উপযোগী শারীরিক কন্ডিশনিং, ক্ষিপ্র গতি, কোর স্ট্রেংথ, শরীরের ভারসাম্য এবং পুরো ৯০ মিনিট সমান শক্তিতে খেলার স্ট্যামিনা তৈরি।",
    icon: Dumbbell,
  },
  {
    title: "দলগত সমন্বয় ও সমঝোতা",
    subtitle: "সুসংহত সম্মিলিত মুভমেন্ট",
    description:
      "সুদৃঢ় ট্যাকটিক্যাল টিম শেপ, জমাট রক্ষণ ব্লক এবং পরিকল্পিত আক্রমণাত্মক কম্বিনেশন গড়ে তোলা।",
    icon: Users2,
  },
  {
    title: "ক্রীড়াসুলভ মনোভাব ও শৃঙ্খলা",
    subtitle: "চারিত্রিক দৃঢ়তা ও নেতৃত্ব",
    description:
      "মাঠে ও মাঠের বাইরে আবেগ নিয়ন্ত্রণ, প্রতিপক্ষ ও ম্যাচ রেফারির প্রতি সম্মান, দায়িত্ববোধ এবং নেতৃত্বের গুণাবলী বিকশিত করা।",
    icon: Medal,
  },
];

/**
 * Football Philosophy Section
 * In-depth technical breakdown of the 5 pillars governing Morning Football Academy coaching
 */
export default function FootballPhilosophy() {
  return (
    <section
      id="philosophy"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="philosophy-heading"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block" />
                আমাদের ফুটবল দর্শন
              </Chip>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                ৫টি মূল প্রশিক্ষণ স্তম্ভ
              </span>
            </div>

            <h2
              id="philosophy-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.1]"
            >
              খেলোয়াড় বিকাশ,{" "}
              <span className="text-[#B9F66B] drop-shadow-[0_0_24px_rgba(185,246,107,0.35)] block sm:inline">
                চারিত্রিক দৃঢ়তা গঠন
              </span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#A4B0A8] max-w-md leading-relaxed">
            আমাদের সমন্বিত প্রশিক্ষণ কার্যক্রম আধুনিক ফুটবল দর্শন ও গভীর
            মেন্টরশিপের সমন্বয়ে পূর্ণাঙ্গ ও বুদ্ধিদীপ্ত ক্রীড়াবিদ তৈরি করে।
          </p>
        </div>

        {/* Philosophy Main Layout (Two Column: 5 Pillars on Left, Cinematic Media on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: 5 Pillar Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            {PHILOSOPHY_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 transition-all duration-300 flex items-start gap-4 sm:gap-5 group"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#18251F] border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center shrink-0 group-hover:bg-[#B9F66B] group-hover:text-[#0A0A0A] transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors">
                        {pillar.title}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-[#B9F66B] uppercase tracking-wider">
                        স্তম্ভ ০{idx + 1}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#A4B0A8] block">
                      {pillar.subtitle}
                    </span>

                    <p className="text-xs sm:text-sm text-[#A4B0A8]/90 leading-relaxed pt-1">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: High-Impact Visual Editorial Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative w-full h-full min-h-[440px] sm:min-h-[500px] rounded-3xl overflow-hidden bg-[#18251F] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between p-6 sm:p-8 group">
              {/* Football Training Image */}
              <Image
                src="/images/players/meheDi (2).png"
                alt="Morning Football Academy player performing disciplined tactical training drills"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Cinematic Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-transparent to-transparent" />

              {/* Top Card Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101A17]/90 backdrop-blur-md border border-[#B9F66B]/40 text-[10px] font-mono font-black text-[#B9F66B] uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B9F66B]" />
                  সার্বিক পাঠ্যক্রম
                </span>

                <span className="text-xs font-mono font-bold text-white/40">
                  EST. ACADEMY
                </span>
              </div>

              {/* Bottom Quote Overlay */}
              <div className="relative z-10 space-y-3 p-5 rounded-2xl bg-[#101A17]/90 backdrop-blur-md border border-white/10">
                <p className="text-xs sm:text-sm text-white font-medium italic leading-relaxed">
                  &ldquo;প্রতিভা সুযোগ তৈরি করে দেয়, কিন্তু শৃঙ্খলা,
                  ট্যাকটিক্যাল বুদ্ধিমত্তা এবং নিঃস্বার্থ দলগত ঐক্যই একজন
                  খেলোয়াড়কে সত্যিকারের চ্যাম্পিয়নে রূপান্তরিত করে।&rdquo;
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
                  <span className="text-[#B9F66B] font-bold uppercase tracking-wider">
                    টেকনিক্যাল ডিরেক্টরেট
                  </span>
                  <span className="text-[#A4B0A8]">কোচিং দর্শন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
