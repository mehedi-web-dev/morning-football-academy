import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Shield,
  Activity,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@heroui/react";
import { apiClient, ResultDocument } from "../../../lib/api-client";
import { formatMatchDate } from "../../../lib/match-utils";
import { calculateOutcome, getOutcomeMeta } from "../../../lib/result-utils";
import { toBnNum } from "../../../lib/bn-utils";
import { TeamEmblem } from "../../../components/matches/PublicMatchCard";

export const instant = false;

interface ResultDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ResultDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await apiClient.results.getById(id);
    const result = res.data;

    if (!result) {
      return {
        title: "খেলার ফলাফল পাওয়া যায়নি | Morning Football Academy",
      };
    }

    return {
      title: `Morning Football Academy ${toBnNum(result.homeScore)} - ${toBnNum(result.awayScore)} ${result.opponent} | ম্যাচ রিপোর্ট`,
      description: `অফিসিয়াল ম্যাচ রিপোর্ট: Morning Football Academy বনাম ${result.opponent} (${result.competition})। চূড়ান্ত স্কোর: ${toBnNum(result.homeScore)} - ${toBnNum(result.awayScore)}। ভেন্যু: ${result.venue}।`,
    };
  } catch {
    return {
      title: "খেলার ফলাফল পাওয়া যায়নি | Morning Football Academy",
    };
  }
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params;

  let result: ResultDocument | null = null;
  try {
    const res = await apiClient.results.getById(id);
    result = res.data;
  } catch {
    notFound();
  }

  if (!result) {
    notFound();
  }

  const outcome = calculateOutcome(result.homeScore, result.awayScore);
  const outcomeMeta = getOutcomeMeta(outcome);

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#A4B0A8] hover:text-[#B9F66B] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>সকল ফলাফলে ফিরে যান</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251F] border border-white/10 text-[11px] font-mono text-[#A4B0A8] uppercase">
            <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{result.competition}</span>
          </span>
        </div>

        {/* Hero Score Arena Card */}
        <div className="relative rounded-3xl bg-[#18251F] border border-white/10 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle top edge accent glow */}
          <div
            className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#B9F66B]/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between pb-8 border-b border-white/[0.08] gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-[0.24em] text-[#B9F66B] uppercase block">
                অফিসিয়াল ম্যাচ রিপোর্ট ও স্কোরলাইন
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                {result.competition}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${outcomeMeta.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${outcomeMeta.dotClass}`} />
                {outcomeMeta.label}
              </span>
            </div>
          </div>

          {/* Scoreboard Arena */}
          <div className="py-10 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4 text-center">
              {/* Morning Football Academy (Home) */}
              <div className="flex flex-col items-center space-y-4">
                <TeamEmblem
                  name="Morning Football Academy"
                  isMFA={true}
                  size="lg"
                />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-[#B9F66B]">
                    স্বাগতিক ক্লাব
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Morning Football Academy
                  </h1>
                </div>
              </div>

              {/* Center Score Display */}
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <div className="inline-flex items-center justify-center gap-4 px-6 sm:px-8 py-3 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
                  <span className="text-4xl sm:text-6xl font-black font-mono text-[#B9F66B]">
                    {toBnNum(result.homeScore)}
                  </span>
                  <span className="text-2xl sm:text-4xl font-bold text-white/30 font-mono">
                    -
                  </span>
                  <span className="text-4xl sm:text-6xl font-black font-mono text-white">
                    {toBnNum(result.awayScore)}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A4B0A8]">
                  পূর্ণ সময়ের ফলাফল
                </span>
              </div>

              {/* Opponent (Away) */}
              <div className="flex flex-col items-center space-y-4">
                <TeamEmblem name={result.opponent} size="lg" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold font-mono tracking-[0.2em] uppercase text-[#A4B0A8]">
                    প্রতিপক্ষ ক্লাব
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {result.opponent}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/[0.08]">
            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>ম্যাচের তারিখ</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white">
                {formatMatchDate(result.matchDate)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>মাঠের অবস্থান / ভেন্যু</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                {result.venue}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#202E27] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-[#B9F66B] text-xs font-mono uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>টুর্নামেন্ট / প্রতিযোগিতা</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white truncate">
                {result.competition}
              </p>
            </div>
          </div>
        </div>

        {/* Match Reference & Actions */}
        <div className="p-6 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase flex items-center justify-center sm:justify-start gap-2">
              <Activity className="w-4 h-4" />
              <span>রেকর্ড অডিট আইডি</span>
            </h3>
            <p className="text-xs font-mono text-[#A4B0A8]">
              ডাটাবেজ রেকর্ড: <strong className="text-white">{result._id}</strong>
              {result.matchId && ` • ম্যাচ রেফারেন্স: ${result.matchId}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {result.matchId && (
              <Link href={`/matches/${result.matchId}`} className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#B9F66B]" />
                  <span>ম্যাচ ফিক্সচার দেখুন</span>
                </Button>
              </Link>
            )}

            <Link href="/results" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer"
              >
                সকল ফলাফল
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
