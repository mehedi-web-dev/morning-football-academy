"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Chip, Card } from "@heroui/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  Zap,
  Target,
  Activity,
  Flame,
  Star,
} from "lucide-react";
import { apiClient, PlayerDocument } from "../../lib/api-client";
import { toBnNum, getBnPosition } from "../../lib/bn-utils";

function getPositionAttributes(position: string) {
  switch (position) {
    case "Goalkeeper":
      return [
        { label: "রিফ্লেক্স ও শট সেভিং", value: 92 },
        { label: "ওয়ান-অন-ওয়ান বক্স নিয়ন্ত্রণ", value: 88 },
        { label: "নিচ থেকে বল বণ্টন", value: 85 },
        { label: "ক্রস প্রতিরোধ ও রিচ", value: 87 },
        { label: "গোলপোস্ট নিয়ন্ত্রণ", value: 89 },
      ];
    case "Defender":
      return [
        { label: "রক্ষণভাগের সতর্কতা", value: 90 },
        { label: "এরিয়াল ডুয়েল ও হেড", value: 88 },
        { label: "নির্ভুল ট্যাকলিং", value: 87 },
        { label: "ডিফেন্স লাইন লিডারশিপ", value: 86 },
        { label: "শারীরিক শক্তি ও ব্যালেন্স", value: 85 },
      ];
    case "Midfielder":
      return [
        { label: "দূরদর্শিতা ও বল বণ্টন", value: 91 },
        { label: "পাসিং নির্ভুলতা", value: 89 },
        { label: "বল নিয়ন্ত্রণ ও স্থিরতা", value: 88 },
        { label: "প্রেস প্রতিরোধ ক্ষমতা", value: 87 },
        { label: "স্ট্যামিনা ও কভারেজ", value: 88 },
      ];
    case "Forward":
    default:
      return [
        { label: "গতি ও অ্যাক্সিলারেশন", value: 91 },
        { label: "নিখুঁত ফিনিশিং", value: 88 },
        { label: "ড্রিবলিং দক্ষতা", value: 86 },
        { label: "ট্যাকটিক্যাল মুভমেন্ট", value: 89 },
        { label: "ওয়ার্ক রেট ও প্রেসিং", value: 85 },
      ];
  }
}

export default function PlayerSpotlight() {
  const [players, setPlayers] = useState<PlayerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchPlayers() {
      try {
        const res = await apiClient.players.getAll({ isActive: true, limit: 6 });
        if (isMounted && res.data && res.data.length > 0) {
          setPlayers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch spotlight players:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchPlayers();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#0A0A0A] text-white border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 rounded-3xl bg-[#141416]/50 animate-pulse border border-white/5" />
        </div>
      </section>
    );
  }

  if (players.length === 0) {
    return null;
  }

  const currentPlayer = players[selectedIndex] || players[0];
  const isGK = currentPlayer.position === "Goalkeeper";
  const isMID = currentPlayer.position === "Midfielder";

  const appearances = currentPlayer.statistics?.appearances ?? 0;
  const primaryStatValue = isGK
    ? (currentPlayer.statistics?.cleanSheets ?? 0)
    : isMID
    ? (currentPlayer.statistics?.assists ?? 0)
    : (currentPlayer.statistics?.goals ?? 0);
  const primaryStatLabel = isGK
    ? "ক্লিন শিট"
    : isMID
    ? "অ্যাসিস্ট"
    : "গোল";

  const formRating = "৯.১";
  const passAccuracy = isGK ? "৮২%" : isMID ? "৯১%" : "৮৭%";
  const coachNote =
    currentPlayer.bio ||
    "একাডেমি টুর্নামেন্ট ও অনুশীলনে কঠোর শৃঙ্খলা, টেকনিক্যাল দক্ষতা ও অসাধারণ দূরদর্শিতার পরিচয় বহন করে।";

  const attributes = getPositionAttributes(currentPlayer.position);

  const displayImage = imageErrorMap[currentPlayer._id]
    ? "/images/team.jpeg"
    : (currentPlayer.photo || "/images/team.jpeg");

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? players.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === players.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id="spotlight"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#0A0A0A] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="player-spotlight-heading"
    >
      {/* Dark green & athletic lime ambient atmospheric glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d3b1e]/40 via-[#062413]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-[450px] h-[450px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/10 via-[#062413]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Chip
                className="bg-[#142316] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
                একাডেমি স্পটলাইট
              </Chip>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 text-[#B9F66B] fill-[#B9F66B]" />
                মাসের সেরা উদীয়মান প্রতিভা
              </span>
            </div>

            <h2
              id="player-spotlight-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              বিশেষ নজরে খেলোয়াড়
            </h2>

            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl leading-relaxed">
              Morning Football Academy-র আদর্শে বেড়ে ওঠা তরুণ খেলোয়াড়দের প্রতিভার ঝলক—মাঠে অদম্য শৃঙ্খলা, তীব্রতা ও টেকনিক্যাল দক্ষতা।
            </p>
          </div>

          {/* Quick Roster Selector Tabs & Carousel Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Player Switcher Tabs */}
            <div className="hidden sm:flex items-center bg-[#141417] p-1 rounded-full border border-white/10">
              {players.map((player, idx) => (
                <button
                  key={player._id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
                    selectedIndex === idx
                      ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_12px_rgba(185,246,107,0.35)]"
                      : "text-[#A4B0A8] hover:text-white"
                  }`}
                  aria-label={`Select ${player.fullName}`}
                >
                  #{toBnNum(player.jerseyNumber)} {getBnPosition(player.position)}
                </button>
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onPress={handlePrev}
                className="min-w-10 w-10 h-10 p-0 rounded-full bg-[#18181B] border border-white/10 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] transition-all cursor-pointer flex items-center justify-center"
                aria-label="পূর্ববর্তী খেলোয়াড়"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onPress={handleNext}
                className="min-w-10 w-10 h-10 p-0 rounded-full bg-[#18181B] border border-white/10 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] transition-all cursor-pointer flex items-center justify-center"
                aria-label="পরবর্তী খেলোয়াড়"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Main Hero Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Cinematic Player Portrait Card (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="relative w-full h-full min-h-[460px] sm:min-h-[520px] rounded-3xl bg-[#141416] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
              {/* Dark Green Gradient Tint Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e2a17]/30 via-[#111113] to-[#0A0A0A]" />

              {/* Player Image */}
              <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px]">
                <Image
                  src={displayImage}
                  alt={`${currentPlayer.fullName} - Morning Football Academy Spotlight`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={() =>
                    setImageErrorMap((prev) => ({ ...prev, [currentPlayer._id]: true }))
                  }
                />

                {/* Cinematic Vignettes & Dark Gradients for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]/30" />

                {/* Top-Left: Position & Status Badge */}
                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-[#B9F66B]/40 text-xs font-black tracking-wider text-[#B9F66B] uppercase shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#B9F66B] animate-pulse" />
                    {getBnPosition(currentPlayer.position)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white/80 uppercase">
                    ম্যাচ ফর্ম: {formRating} / ১০
                  </span>
                </div>

                {/* Top-Right: Watermark Jersey Number */}
                <div className="absolute top-3 right-4 z-20 select-none pointer-events-none">
                  <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white/15 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    #{toBnNum(currentPlayer.jerseyNumber)}
                  </span>
                </div>

                {/* Bottom Overlay: Identity Bar */}
                <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
                        জার্সি #{toBnNum(currentPlayer.jerseyNumber)} • {getBnPosition(currentPlayer.position)}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                        {currentPlayer.fullName}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#18181B]/90 border border-white/15 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] font-mono text-[#A4B0A8] uppercase">ফর্ম</span>
                      <span className="text-base font-black font-mono text-[#B9F66B] leading-none">
                        {formRating}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A4B0A8] line-clamp-2">
                    {currentPlayer.bio || `${getBnPosition(currentPlayer.position)} • ${currentPlayer.nationality}`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Deep Scouting Dossier & Performance Metrics (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* 2.1 Season Performance Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  ম্যাচ ফর্ম
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#B9F66B]">
                    {formRating}
                  </span>
                  <span className="text-xs text-[#A4B0A8] font-mono">/১০</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Activity className="w-3 h-3 text-[#B9F66B]" />
                  <span>এলিট মান</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  ম্যাচ উপস্থিতি
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {toBnNum(appearances)}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Shield className="w-3 h-3 text-[#B9F66B]" />
                  <span>ম্যাচ</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  {primaryStatLabel}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#B9F66B]">
                  {toBnNum(primaryStatValue)}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Target className="w-3 h-3 text-[#B9F66B]" />
                  <span>মৌসুমে মোট</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  পাসিং নির্ভুলতা
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {passAccuracy}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Zap className="w-3 h-3 text-[#B9F66B]" />
                  <span>দক্ষতা</span>
                </div>
              </div>
            </div>

            {/* 2.2 Technical Attribute Progress Bars */}
            <div className="p-6 rounded-3xl bg-[#141417] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B9F66B]" />
                  <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white">
                    স্কাউটিং মূল্যায়ন ও দক্ষতা
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#B9F66B] font-bold uppercase tracking-wider">
                  একাডেমি বেঞ্চমার্ক ১০০
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {attributes.map((attr) => (
                  <div key={attr.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white/85 tracking-wide uppercase">
                        {attr.label}
                      </span>
                      <span className="font-mono font-black text-[#B9F66B]">
                        {toBnNum(attr.value)}
                      </span>
                    </div>
                    {/* Dark Green Track with Glowing Lime Progress */}
                    <div className="w-full h-2 rounded-full bg-[#0d2114] overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#1b5e20] to-[#B9F66B] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(185,246,107,0.4)]"
                        style={{ width: `${attr.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2.3 Head Coach Scouting Note */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d2a17]/50 via-[#18181B] to-[#141417] border border-[#B9F66B]/25 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#0d2a17] border border-[#B9F66B]/40 flex items-center justify-center shrink-0 text-[#B9F66B] shadow-[0_0_10px_rgba(185,246,107,0.2)]">
                <Flame className="w-4 h-4 text-[#B9F66B]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#B9F66B]">
                  টেকনিক্যাল ডিরেক্টরের মূল্যায়ন
                </span>
                <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed italic">
                  &ldquo;{coachNote}&rdquo;
                </p>
              </div>
            </div>

            {/* 2.4 Action CTA & Navigation Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/squad/${currentPlayer.slug}`} className="group">
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-6 py-3 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.25)] hover:shadow-[0_0_28px_rgba(185,246,107,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{currentPlayer.fullName}-এর সম্পূর্ণ প্রোফাইল দেখুন</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/squad">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-white/[0.03] border border-white/20 hover:border-white/50 text-white font-bold text-xs tracking-wider uppercase rounded-full px-5 py-3 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    সম্পূর্ণ স্কোয়াড দেখুন
                  </Button>
                </Link>
              </div>

              {/* Roster index indicator */}
              <div className="text-right sm:text-right text-[11px] font-mono text-[#A4B0A8]">
                <span>খেলোয়াড় {toBnNum(selectedIndex + 1)} / {toBnNum(players.length)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Disclaimer Notice */}
        <div className="pt-2 text-center border-t border-white/[0.06]">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * স্পটলাইট মূল্যায়ন ও দক্ষতার সূচকসমূহ খেলোয়াড় পোর্টফোলিও প্রদর্শনীর সাধারণ মানদণ্ড।
          </p>
        </div>
      </div>
    </section>
  );
}
