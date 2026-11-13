import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Activity,
} from "lucide-react";
import { apiClient, MatchDocument } from "../../../lib/api-client";
import {
  formatMatchDate,
  formatKickOffTime,
  getMatchStatusMeta,
} from "../../../lib/match-utils";
import { TeamEmblem } from "../../../components/matches/PublicMatchCard";

export const instant = false;

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MatchDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await apiClient.matches.getById(id);
    const match = res.data;

    if (!match) {
      return {
        title: "ম্যাচ পাওয়া যায়নি | Morning Football Academy",
      };
    }

    const titleStr =
      match.homeAway === "home"
        ? `Morning Football Academy বনাম ${match.opponent}`
        : `${match.opponent} বনাম Morning Football Academy`;

    return {
      title: `${titleStr} | Morning Football Academy ফিক্সচার`,
      description: `মর্নিং ফুটবল একাডেমি বনাম ${match.opponent}-এর অফিসিয়াল ম্যাচ ফিক্সচার ও সময়সূচি (${match.competition})। ভেন্যু: ${match.venue}, তারিখ: ${formatMatchDate(match.matchDate)}।`,
    };
  } catch {
    return {
      title: "ম্যাচ পাওয়া যায়নি | Morning Football Academy",
    };
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;

  let match: MatchDocument | null = null;
  try {
    const res = await apiClient.matches.getById(id);
    match = res.data;
  } catch {
    notFound();
  }

  if (!match) {
    notFound();
  }

  const statusMeta = getMatchStatusMeta(match.status);
  const isHome = match.homeAway === "home";

  const homeTeam = {
    name: isHome ? "Morning Football Academy" : match.opponent,
    logo: isHome ? undefined : match.opponentLogo,
    isMFA: isHome,
  };

  const awayTeam = {
    name: isHome ? match.opponent : "Morning Football Academy",
    logo: isHome ? match.opponentLogo : undefined,
    isMFA: !isHome,
  };

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#A4B0A8] hover:text-[#B9F66B] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>সকল ফিক্সচারে ফিরে যান</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-white/10 text-[11px] font-mono text-[#A4B0A8] uppercase">
            <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{match.competition}</span>
          </span>
        </div>

        {/* Hero Match Showcase Arena Card */}
        <div className="relative rounded-3xl bg-[#18251F] border border-white/10 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle top edge accent glow */}
          <div
            className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#B9F66B]/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Status & Competition Bar */}
          <div className="flex flex-wrap items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.24em] text-[#B9F66B] uppercase block">
                অনুমোদিত ম্যাচ ফিক্সচার
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                {match.competition}
              </h2>
            </div>

            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${statusMeta.badgeClass}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${statusMeta.dotClass} ${
                  statusMeta.isPulse ? "animate-pulse" : ""
                }`}
              />
              {statusMeta.label}
            </span>
          </div>

          {/* Teams Matchup Visual Arena */}
          <div className="py-10 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4 text-center">
              {/* Home Team */}
              <div className="flex flex-col items-center space-y-4">
                <TeamEmblem
                  name={homeTeam.name}
                  logo={homeTeam.logo}
                  isMFA={homeTeam.isMFA}
                  size="lg"
                />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-[#B9F66B]">
                    স্বাগতিক দল
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {homeTeam.name}
                  </h1>
                </div>
              </div>

              {/* Center VS Callout */}
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <span className="text-4xl sm:text-6xl font-black font-mono tracking-widest text-[#B9F66B] select-none drop-shadow-[0_0_15px_rgba(185,246,107,0.3)]">
                  VS
                </span>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-white bg-white/[0.05] px-4 py-1.5 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-[#B9F66B]" />
                  <span>কিক-অফ {formatKickOffTime(match.kickOffTime)}</span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center space-y-4">
                <TeamEmblem
                  name={awayTeam.name}
                  logo={awayTeam.logo}
                  isMFA={awayTeam.isMFA}
                  size="lg"
                />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-[#A4B0A8]">
                    অতিথি দল
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {awayTeam.name}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/[0.08]">
            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>ম্যাচের তারিখ</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">
                {formatMatchDate(match.matchDate)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>কিক-অফের সময়</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">
                {formatKickOffTime(match.kickOffTime)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>মাঠের অবস্থান / ভেন্যু</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                {match.venue}
              </p>
            </div>
          </div>
        </div>

        {/* Stadium & Academy Operations Notice */}
        <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>ম্যাচ ডে সংক্রান্ত নির্দেশনা</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            সমর্থক ও অভিভাবকদের কিক-অফের অন্তত ৩০ মিনিট পূর্বে {match.venue}-এ উপস্থিত হওয়ার জন্য অনুরোধ জানানো যাচ্ছে। ম্যাচ শুরুর ১ ঘণ্টা আগে গেট উন্মুক্ত করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
