
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
  Clock,
  Square,
  Star,
  Hand,
  Award,
  Footprints,
  Ruler,
  Weight,
  Building2,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { apiClient, PlayerDocument } from "../../../lib/api-client";
import { getShortPosition, calculateAge } from "../../../lib/player-utils";
import { toBnNum, getBnPosition, formatBnDate } from "../../../lib/bn-utils";

const DOMINANT_FOOT_LABELS: Record<string, string> = {
  right: "ডান পা",
  left: "বাম পা",
  both: "দুই পা-ই",
};

const PLAYER_STATUS_LABELS: Record<string, string> = {
  active: "সক্রিয়",
  injured: "আহত",
  inactive: "নিষ্ক্রিয়",
};

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNumber(value?: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

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
        title: "খেলোয়াড় পাওয়া যায়নি | Morning Football Academy",
      };
    }

    return {
      title: `${player.fullName} (জার্সি #${toBnNum(player.jerseyNumber)}) | Morning Football Academy`,
      description:
        player.bio ||
        `মর্নিং ফুটবল একাডেমির অফিসিয়াল খেলোয়াড় ${player.fullName}-এর প্রোফাইল। জার্সি #${toBnNum(player.jerseyNumber)}, পজিশন: ${getBnPosition(player.position)}।`,
    };
  } catch {
    return {
      title: "খেলোয়াড় পাওয়া যায়নি | Morning Football Academy",
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

  const infoItems = [
    {
      label: "জন্মতারিখ / বয়স",
      value: hasText(player.dateOfBirth)
        ? `${formatBnDate(player.dateOfBirth)}${
            age !== null ? ` (${toBnNum(age)} বছর)` : ""
          }`
        : null,
      icon: Calendar,
    },
    {
      label: "জাতীয়তা",
      value: hasText(player.nationality)
        ? player.nationality === "Bangladesh"
          ? "বাংলাদেশ"
          : player.nationality
        : null,
      icon: Globe,
    },
    {
      label: "উচ্চতা",
      value: hasText(player.height) ? toBnNum(player.height) : null,
      icon: Ruler,
    },
    {
      label: "ওজন",
      value: hasText(player.weight) ? toBnNum(player.weight) : null,
      icon: Weight,
    },
    {
      label: "শক্তিশালী পা",
      value: player.dominantFoot
        ? DOMINANT_FOOT_LABELS[player.dominantFoot] ?? player.dominantFoot
        : null,
      icon: Footprints,
    },
    {
      label: "খেলার অভিজ্ঞতা",
      value: hasNumber(player.playingExperienceYears)
        ? `${toBnNum(player.playingExperienceYears)} বছর`
        : null,
      icon: Clock,
    },
  ].filter((item) => item.value !== null);

  const statItems = [
    {
      label: "ম্যাচ খেলা",
      value: player.statistics?.appearances,
      icon: Activity,
      accent: "text-white",
      sublabel: "অফিসিয়াল ম্যাচ",
    },
    {
      label: "গোল",
      value: player.statistics?.goals,
      icon: Target,
      accent: "text-[#B9F66B]",
      sublabel: "মোট গোল",
    },
    {
      label: "অ্যাসিস্ট",
      value: player.statistics?.assists,
      icon: Trophy,
      accent: "text-cyan-300",
      sublabel: "গোল করানো",
    },
    {
      label: "খেলার মিনিট",
      value: player.statistics?.minutesPlayed,
      icon: Clock,
      accent: "text-sky-300",
      sublabel: "মাঠে ব্যয়িত সময়",
    },
    {
      label: "হলুদ কার্ড",
      value: player.statistics?.yellowCards,
      icon: Square,
      accent: "text-yellow-300",
      sublabel: "সতর্কতা",
    },
    {
      label: "লাল কার্ড",
      value: player.statistics?.redCards,
      icon: Square,
      accent: "text-red-300",
      sublabel: "বহিষ্কার",
    },
    {
      label: "খেলোয়াড় রেটিং",
      value: player.statistics?.rating,
      icon: Star,
      accent: "text-[#B9F66B]",
      sublabel: "গড় রেটিং (১০-এ)",
    },
    {
      label: "ক্লিন শিট",
      value: player.statistics?.cleanSheets,
      icon: Shield,
      accent: "text-amber-300",
      sublabel: "গোলহীন ম্যাচ",
    },
    ...(player.position === "Goalkeeper"
      ? [
          {
            label: "মোট সেভ",
            value: player.statistics?.saves,
            icon: Hand,
            accent: "text-sky-300",
            sublabel: "গোলরক্ষক সেভ",
          },
        ]
      : []),
    {
      label: "ম্যান অফ দ্য ম্যাচ",
      value: player.statistics?.manOfTheMatch,
      icon: Award,
      accent: "text-[#B9F66B]",
      sublabel: "সেরা খেলোয়াড়",
    },
  ].filter((item) => hasNumber(item.value));

  const hasJourney =
    hasText(player.previousClub) ||
    hasText(player.previousTournaments) ||
    hasText(player.achievements);

  const hasAcademyInfo =
    hasText(player.joiningDate) || hasText(player.trainingGroup);

  const statusLabel =
    player.playerStatus === "active" || player.playerStatus === "injured"
      ? PLAYER_STATUS_LABELS[player.playerStatus]
      : null;

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
            <span>সম্পূর্ণ স্কোয়াডে ফিরে যান</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#A4B0A8]">
            <span>স্কোয়াড</span>
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
                    alt={`${player.fullName} - #${toBnNum(player.jerseyNumber)}, Morning Football Academy`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] p-8 text-center">
                    <User className="w-24 h-24 text-[#B9F66B]/60 mb-4" />
                    <span className="text-4xl font-black font-mono text-white/30">
                      #{toBnNum(player.jerseyNumber)}
                    </span>
                  </div>
                )}

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/40 to-transparent" />

                {/* Jersey Number Watermark on Image */}
                <div className="absolute top-4 right-4 z-10 select-none pointer-events-none">
                  <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white/20">
                    {toBnNum(player.jerseyNumber)}
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-5 inset-x-5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#101A17]/90 backdrop-blur-md border border-white/15 text-[11px] font-mono font-black text-[#B9F66B] uppercase">
                      {shortPos} • #{toBnNum(player.jerseyNumber)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#B9F66B]/20 text-[#B9F66B] border border-[#B9F66B]/40 text-[11px] font-mono font-black uppercase">
                      মূল দল
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
                    অফিসিয়াল স্কোয়াড সদস্য
                  </Chip>
                  <span className="text-xs font-mono text-[#A4B0A8]">
                    জার্সি #{toBnNum(player.jerseyNumber)}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.05]">
                  {player.fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#A4B0A8]">
                  <span className="text-[#B9F66B] font-bold text-base sm:text-lg uppercase">
                    {getBnPosition(player.position)}
                  </span>
                  {hasText(player.secondaryPosition) && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="font-mono text-xs">
                        দ্বিতীয় পজিশন: {getBnPosition(player.secondaryPosition)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Position */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    পজিশন
                  </span>
                  <span className="text-base font-black text-white uppercase block">
                    {getBnPosition(player.position)}
                  </span>
                </div>

                {/* Jersey */}
                <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    জার্সি নম্বর
                  </span>
                  <span className="text-base font-black text-[#B9F66B] font-mono block">
                    #{toBnNum(player.jerseyNumber)}
                  </span>
                </div>

                {/* Player Status */}
                {statusLabel && (
                  <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                      স্ট্যাটাস
                    </span>
                    <span
                      className={`text-base font-black block ${
                        player.playerStatus === "injured"
                          ? "text-amber-300"
                          : "text-[#B9F66B]"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Biography Section */}
              {hasText(player.bio) && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2">
                  <h3 className="text-xs font-mono font-black text-[#B9F66B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>খেলোয়াড়ের জীবনবৃত্তান্ত ও স্কাউটিং রিপোর্ট</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {player.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Player Information */}
      {infoItems.length > 0 && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="text-xs font-mono text-[#B9F66B] uppercase tracking-wider block font-bold">
              প্লেয়ার ইনফরমেশন
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              খেলোয়াড়ের তথ্য।
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-5 rounded-2xl bg-[#18251F] border border-white/10 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#B9F66B]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-white block break-words">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Official Season Statistics */}
      {statItems.length > 0 && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
          <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#B9F66B] uppercase tracking-wider block font-bold">
                অফিসিয়াল পারফরম্যান্স মেট্রিক্স
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                মৌসুমের পরিসংখ্যান।
              </h2>
            </div>
            <span className="text-xs font-mono text-[#A4B0A8]">
              প্রতিযোগিতামূলক মৌসুম ২০২৬/২০২৭
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mt-8">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-5 sm:p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-2 relative overflow-hidden group hover:border-[#B9F66B]/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-[#A4B0A8]">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider">
                      {item.label}
                    </span>
                    <Icon className={`w-4 h-4 shrink-0 ${item.accent}`} />
                  </div>
                  <span
                    className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono block ${item.accent}`}
                  >
                    {toBnNum(item.value)}
                  </span>
                  <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
                    {item.sublabel}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Football Journey */}
      {hasJourney && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="text-xs font-mono text-[#B9F66B] uppercase tracking-wider block font-bold">
              ক্যারিয়ার ও অর্জন
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              ফুটবল জার্নি।
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
            {hasText(player.previousClub) && (
              <div className="p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#B9F66B]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    পূর্ববর্তী ক্লাব / একাডেমি
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed break-words">
                    {player.previousClub}
                  </p>
                </div>
              </div>
            )}

            {hasText(player.previousTournaments) && (
              <div className="p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#B9F66B]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    টুর্নামেন্ট অংশগ্রহণ
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                    {player.previousTournaments}
                  </p>
                </div>
              </div>
            )}

            {hasText(player.achievements) && (
              <div className="p-5 rounded-2xl bg-[#18251F] border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#B9F66B]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    অর্জন ও পুরস্কার
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                    {player.achievements}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Academy Information */}
      {hasAcademyInfo && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="text-xs font-mono text-[#B9F66B] uppercase tracking-wider block font-bold">
              একাডেমি প্রোফাইল
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              একাডেমি তথ্য।
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {hasText(player.joiningDate) && (
              <div className="p-5 rounded-2xl bg-[#18251F] border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#B9F66B]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    যোগদানের তারিখ
                  </span>
                  <span className="text-sm font-bold text-white block break-words">
                    {formatBnDate(player.joiningDate)}
                  </span>
                </div>
              </div>
            )}

            {hasText(player.trainingGroup) && (
              <div className="p-5 rounded-2xl bg-[#18251F] border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#B9F66B]/10 border border-[#B9F66B]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#B9F66B]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                    ট্রেনিং / বয়স গ্রুপ
                  </span>
                  <span className="text-sm font-bold text-white block break-words">
                    {player.trainingGroup}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA to explore other squad members */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
          <Link href="/squad">
            <Button
              variant="outline"
              className="bg-transparent border border-white/20 text-white hover:border-[#B9F66B]/50 hover:text-[#B9F66B] font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
            >
              ← স্কোয়াড তালিকায় ফিরে যান
            </Button>
          </Link>

          <Link href="/join">
            <Button className="bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#a8ec56] transition-all cursor-pointer">
              একাডেমি ট্রায়ালে আবেদন করুন
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
