
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Calendar,
  Globe,
  Activity,
  Trophy,
  Target,
  Sparkles,
  User,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { apiClient, PlayerDocument } from "../../../lib/api-client";
import {
  getShortPosition,
  calculateAge,
  formatDate,
} from "../../../lib/player-utils";

interface PlayerDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

/**
 * Generate SEO Metadata for player profile
 */
export async function generateMetadata({
  params,
}: PlayerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient.players.getBySlug(slug);
    const player = res.data;

    if (!player || !player.isActive) {
      return {
        title: "Player Not Found | Morning Football Academy",
      };
    }

    return {
      title: `${player.fullName} (#${player.jerseyNumber}) | Morning Football Academy`,
      description:
        player.bio ||
        `Official player profile for ${player.fullName}, #${player.jerseyNumber} ${player.position} at Morning Football Academy.`,
    };
  } catch {
    return {
      title: "Player Not Found | Morning Football Academy",
    };
  }
}

/**
 * Dynamic Player Detail Page (/squad/[slug])
 */
export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { slug } = await params;

  let player: PlayerDocument | null = null;

  try {
    const res = await apiClient.players.getBySlug(slug);
    player = res.data;
  } catch {
    notFound();
  }

  // Handle non-existent or inactive players
  if (!player || !player.isActive) {
    notFound();
  }

  const age = calculateAge(player.dateOfBirth);
  const shortPos = getShortPosition(player.position);
  const stats = player.statistics || {
    appearances: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
  };

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen">
      {/* 1. Breadcrumbs & Top Bar */}
      <div className="border-b border-white/[0.08] bg-[#0A0A0A]/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/squad"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A4B0A8] hover:text-[#B9F66B] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>BACK TO FULL SQUAD</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#A4B0A8]">
            <span>ROSTER</span>
            <span className="text-white/20">/</span>
            <span className="text-white font-bold uppercase">{player.fullName}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Billboard Section */}
      <section className="relative w-full py-12 sm:py-20 overflow-hidden border-b border-white/[0.08]">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-[#101A17]/95 to-[#101A17]" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/15 via-[#0d281a]/30 to-transparent blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Player Portrait */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[3/4] w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden bg-[#18181B] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {player.photo ? (
                  <Image
                    src={player.photo}
                    alt={`${player.fullName} - #${player.jerseyNumber} of Morning Football Academy`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] p-8 text-center">
                    <User className="w-24 h-24 text-[#B9F66B]/60 mb-4" />
                    <span className="text-4xl font-black font-mono text-white/30">
                      #{player.jerseyNumber}
                    </span>
                  </div>
                )}

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/40 to-transparent" />

                {/* Jersey Number Watermark on Image */}
                <div className="absolute top-4 right-4 z-10 select-none pointer-events-none">
                  <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white/20">
                    {player.jerseyNumber}
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-5 inset-x-5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#101A17]/90 backdrop-blur-md border border-white/15 text-[11px] font-mono font-black text-[#B9F66B] uppercase">
                      {shortPos} • #{player.jerseyNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#B9F66B]/20 text-[#B9F66B] border border-[#B9F66B]/40 text-[11px] font-mono font-black uppercase">
                      FIRST TEAM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Player Vitals & Headlines */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-3 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block" />
                    OFFICIAL SQUAD MEMBER
                  </Chip>
                  <span className="text-xs font-mono text-[#A4B0A8]">
                    JERSEY #{player.jerseyNumber}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.05]">
                  {player.fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#A4B0A8]">
                  <span className="text-[#B9F66B] font-bold text-base sm:text-lg uppercase">
                    {player.position}
                  </span>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Globe className="w-4 h-4 text-[#B9F66B]" />
                    <span>{player.nationality}</span>
                  </div>
                  {age !== null && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="font-mono">{age} Years Old</span>
                    </>
                  )}
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Position */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    POSITION
                  </span>
                  <span className="text-base font-black text-white uppercase block">
                    {player.position}
                  </span>
                </div>

                {/* Jersey */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    SQUAD NUMBER
                  </span>
                  <span className="text-base font-black text-[#B9F66B] font-mono block">
                    #{player.jerseyNumber}
                  </span>
                </div>

                {/* Height */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    HEIGHT
                  </span>
                  <span className="text-base font-black text-white block">
                    {player.height || "N/A"}
                  </span>
                </div>

                {/* Weight */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    WEIGHT
                  </span>
                  <span className="text-base font-black text-white block">
                    {player.weight || "N/A"}
                  </span>
                </div>
              </div>

              {/* Biography Section */}
              {player.bio && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2">
                  <h3 className="text-xs font-mono font-black text-[#B9F66B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PLAYER BIOGRAPHY & SCOUTING REPORT</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {player.bio}
                  </p>
                </div>
              )}

              {/* Date of Birth info */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#A4B0A8]">
                <Calendar className="w-4 h-4 text-[#B9F66B]" />
                <span>Born: {formatDate(player.dateOfBirth)}</span>
                {age !== null && <span>({age} years old)</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Official Season Statistics Section */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#B9F66B] uppercase tracking-wider block font-bold">
              OFFICIAL PERFORMANCE METRICS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              SEASON STATISTICS.
            </h2>
          </div>
          <span className="text-xs font-mono text-[#A4B0A8]">
            COMPETITIVE CAMPAIGN 2026/2027
          </span>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Appearances */}
          <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2 relative overflow-hidden group hover:border-[#B9F66B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#A4B0A8]">
              <span className="text-xs font-mono uppercase tracking-wider">
                APPEARANCES
              </span>
              <Activity className="w-4 h-4 text-[#B9F66B]" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-white font-mono block">
              {stats.appearances}
            </span>
            <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
              Official match fixtures
            </span>
          </div>

          {/* Goals */}
          <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2 relative overflow-hidden group hover:border-[#B9F66B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#A4B0A8]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#B9F66B]">
                GOALS SCORED
              </span>
              <Target className="w-4 h-4 text-[#B9F66B]" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-[#B9F66B] font-mono block">
              {stats.goals}
            </span>
            <span className="text-[10px] text-[#B9F66B]/70 block font-mono">
              Official season goals
            </span>
          </div>

          {/* Assists */}
          <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2 relative overflow-hidden group hover:border-cyan-400/40 transition-colors">
            <div className="flex items-center justify-between text-[#A4B0A8]">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                ASSISTS
              </span>
              <Trophy className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-cyan-300 font-mono block">
              {stats.assists}
            </span>
            <span className="text-[10px] text-cyan-300/70 block font-mono">
              Key goal contributions
            </span>
          </div>

          {/* Clean Sheets */}
          <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2 relative overflow-hidden group hover:border-amber-400/40 transition-colors">
            <div className="flex items-center justify-between text-[#A4B0A8]">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300">
                CLEAN SHEETS
              </span>
              <Shield className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono block">
              {stats.cleanSheets}
            </span>
            <span className="text-[10px] text-amber-300/70 block font-mono">
              Defensive shutouts
            </span>
          </div>
        </div>

        {/* Bottom CTA to explore other squad members */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
          <Link href="/squad">
            <Button
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:border-[#B9F66B]/50 hover:text-[#B9F66B] font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
            >
              ← RETURN TO SQUAD ROSTER
            </Button>
          </Link>

          <Link href="/join">
            <Button className="bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#a8ec56] transition-all cursor-pointer">
              APPLY FOR ACADEMY TRIALS
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
