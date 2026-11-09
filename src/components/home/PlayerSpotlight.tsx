"use client";

import { useState } from "react";
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
import { DEMO_SQUAD_PLAYERS, Player } from "../../data/players";

/**
 * Extended spotlight attributes for high-fidelity academy scouting presentation
 */
interface ExtendedPlayerAttributes {
  formRating: string;
  seasonAppearances: number;
  seasonGoalsOrCleanSheets: string;
  seasonGoalsLabel: string;
  passAccuracy: string;
  coachNote: string;
  keyAttributes: {
    label: string;
    value: number;
  }[];
}

const SPOTLIGHT_METRICS: Record<string, ExtendedPlayerAttributes> = {
  "player-one": {
    formRating: "9.2",
    seasonAppearances: 14,
    seasonGoalsOrCleanSheets: "11",
    seasonGoalsLabel: "GOALS",
    passAccuracy: "88%",
    coachNote:
      "Explosive acceleration with ruthless finishing inside the box. Reads defensive transitions with mature tactical vision.",
    keyAttributes: [
      { label: "Pace & Acceleration", value: 91 },
      { label: "Clinical Finishing", value: 87 },
      { label: "Dribbling in Tight Spaces", value: 85 },
      { label: "Tactical Movement", value: 89 },
      { label: "Work Rate & Pressing", value: 84 },
    ],
  },
  "player-two": {
    formRating: "8.9",
    seasonAppearances: 15,
    seasonGoalsOrCleanSheets: "9",
    seasonGoalsLabel: "ASSISTS",
    passAccuracy: "92%",
    coachNote:
      "The academy tempo setter. Controls midfield rhythm effortlessly and delivers precision passes that break defensive lines.",
    keyAttributes: [
      { label: "Vision & Distribution", value: 92 },
      { label: "Short & Long Passing", value: 90 },
      { label: "Ball Control & Composure", value: 88 },
      { label: "Press Resistance", value: 86 },
      { label: "Stamina & Coverage", value: 87 },
    ],
  },
  "player-three": {
    formRating: "8.8",
    seasonAppearances: 16,
    seasonGoalsOrCleanSheets: "6",
    seasonGoalsLabel: "CLEAN SHEETS",
    passAccuracy: "84%",
    coachNote:
      "Commanding presence in the backline with unmatched aerial supremacy and disciplined man-marking execution.",
    keyAttributes: [
      { label: "Defensive Awareness", value: 89 },
      { label: "Physical Aerial Duels", value: 88 },
      { label: "Tackling Precision", value: 87 },
      { label: "Backline Leadership", value: 85 },
      { label: "Strength & Balance", value: 86 },
    ],
  },
  "player-four": {
    formRating: "9.0",
    seasonAppearances: 15,
    seasonGoalsOrCleanSheets: "8",
    seasonGoalsLabel: "CLEAN SHEETS",
    passAccuracy: "82%",
    coachNote:
      "Agile shot-stopper commanding the 18-yard box. Extraordinary instinct in one-on-one scenarios and calm distribution under pressure.",
    keyAttributes: [
      { label: "Reflexes & Shot-Stopping", value: 93 },
      { label: "1-on-1 Box Dominance", value: 89 },
      { label: "Distribution From Back", value: 84 },
      { label: "Cross Claiming & Reach", value: 86 },
      { label: "Command of the Area", value: 88 },
    ],
  },
};

export default function PlayerSpotlight() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const players = DEMO_SQUAD_PLAYERS;
  const currentPlayer: Player = players[selectedIndex] || players[0];
  const metrics: ExtendedPlayerAttributes =
    SPOTLIGHT_METRICS[currentPlayer.id] || SPOTLIGHT_METRICS["player-one"];

  // Fallback to verified existing local image asset if primary image fails
  const displayImage = imageErrorMap[currentPlayer.id]
    ? "/images/players/player-1.jpg"
    : currentPlayer.image;

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
                ACADEMY SPOTLIGHT
              </Chip>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 text-[#B9F66B] fill-[#B9F66B]" />
                STANDOUT TALENT OF THE MONTH
              </span>
            </div>

            <h2
              id="player-spotlight-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              PLAYER IN FOCUS.
            </h2>

            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl leading-relaxed">
              Showcasing rising athletes who embody the Morning Football Academy ethos—exceptional
              discipline, athletic intensity, and technical mastery on the pitch.
            </p>
          </div>

          {/* Quick Roster Selector Tabs & Carousel Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Player Switcher Tabs */}
            <div className="hidden sm:flex items-center bg-[#141417] p-1 rounded-full border border-white/10">
              {players.map((player, idx) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
                    selectedIndex === idx
                      ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_12px_rgba(185,246,107,0.35)]"
                      : "text-[#A4B0A8] hover:text-white"
                  }`}
                  aria-label={`Select ${player.name}`}
                >
                  #{player.number} {player.shortPosition}
                </button>
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onPress={handlePrev}
                className="min-w-10 w-10 h-10 p-0 rounded-full bg-[#18181B] border border-white/10 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] transition-all cursor-pointer flex items-center justify-center"
                aria-label="Previous spotlight player"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onPress={handleNext}
                className="min-w-10 w-10 h-10 p-0 rounded-full bg-[#18181B] border border-white/10 hover:border-[#B9F66B]/50 hover:bg-[#B9F66B]/10 text-white hover:text-[#B9F66B] transition-all cursor-pointer flex items-center justify-center"
                aria-label="Next spotlight player"
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
                  alt={`${currentPlayer.name} - Morning Football Academy Spotlight`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={() =>
                    setImageErrorMap((prev) => ({ ...prev, [currentPlayer.id]: true }))
                  }
                />

                {/* Cinematic Vignettes & Dark Gradients for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]/30" />

                {/* Top-Left: Position & Status Badge */}
                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-[#B9F66B]/40 text-xs font-black tracking-wider text-[#B9F66B] uppercase shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#B9F66B] animate-pulse" />
                    {currentPlayer.position}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white/80 uppercase">
                    FORM: {metrics.formRating} / 10
                  </span>
                </div>

                {/* Top-Right: Watermark Jersey Number */}
                <div className="absolute top-3 right-4 z-20 select-none pointer-events-none">
                  <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white/15 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    #{currentPlayer.number}
                  </span>
                </div>

                {/* Bottom Overlay: Identity Bar */}
                <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
                        SQUAD #{currentPlayer.number} • {currentPlayer.shortPosition}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                        {currentPlayer.name}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#18181B]/90 border border-white/15 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] font-mono text-[#A4B0A8] uppercase">FORM</span>
                      <span className="text-base font-black font-mono text-[#B9F66B] leading-none">
                        {metrics.formRating}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A4B0A8] line-clamp-2">
                    {currentPlayer.roleDescription}
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
                  MATCH FORM
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#B9F66B]">
                    {metrics.formRating}
                  </span>
                  <span className="text-xs text-[#A4B0A8] font-mono">/10</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Activity className="w-3 h-3 text-[#B9F66B]" />
                  <span>Elite Tier</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  APPEARANCES
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {metrics.seasonAppearances}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Shield className="w-3 h-3 text-[#B9F66B]" />
                  <span>Matches</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  {metrics.seasonGoalsLabel}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#B9F66B]">
                  {metrics.seasonGoalsOrCleanSheets}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Target className="w-3 h-3 text-[#B9F66B]" />
                  <span>Season Total</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141417] border border-white/10 hover:border-[#B9F66B]/30 transition-colors">
                <span className="text-[10px] font-bold text-[#A4B0A8] uppercase tracking-wider block mb-1">
                  PASS ACCURACY
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {metrics.passAccuracy}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-white/50">
                  <Zap className="w-3 h-3 text-[#B9F66B]" />
                  <span>Efficiency</span>
                </div>
              </div>
            </div>

            {/* 2.2 Technical Attribute Progress Bars */}
            <div className="p-6 rounded-3xl bg-[#141417] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B9F66B]" />
                  <h4 className="text-xs font-black tracking-[0.2em] uppercase text-white">
                    SCOUTING EVALUATION & ATTRIBUTES
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#B9F66B] font-bold uppercase tracking-wider">
                  MFA BENCHMARK 100
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {metrics.keyAttributes.map((attr) => (
                  <div key={attr.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white/85 tracking-wide uppercase">
                        {attr.label}
                      </span>
                      <span className="font-mono font-black text-[#B9F66B]">
                        {attr.value}
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
                  TECHNICAL DIRECTOR EVALUATION
                </span>
                <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed italic">
                  &ldquo;{metrics.coachNote}&rdquo;
                </p>
              </div>
            </div>

            {/* 2.4 Action CTA & Navigation Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={currentPlayer.profileHref} className="group">
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.16em] uppercase rounded-full px-6 py-3 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.25)] hover:shadow-[0_0_28px_rgba(185,246,107,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>VIEW {currentPlayer.name}&apos;S FULL PROFILE</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/players">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto bg-white/[0.03] border border-white/20 hover:border-white/50 text-white font-bold text-xs tracking-wider uppercase rounded-full px-5 py-3 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    EXPLORE ALL SQUAD
                  </Button>
                </Link>
              </div>

              {/* Roster index indicator */}
              <div className="text-right sm:text-right text-[11px] font-mono text-[#A4B0A8]">
                <span>PLAYER {selectedIndex + 1} OF {players.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Disclaimer Notice */}
        <div className="pt-2 text-center border-t border-white/[0.06]">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * Spotlight evaluations and attribute statistics reflect temporary demonstration
            metrics for player portfolio display. Official academy combine metrics are updated each
            tournament window.
          </p>
        </div>
      </div>
    </section>
  );
}
