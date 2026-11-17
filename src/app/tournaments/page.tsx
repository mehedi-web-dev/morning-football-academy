"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, Search, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@heroui/react";
import { apiClient, TournamentDocument } from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";
import PublicTournamentCard from "../../components/tournaments/PublicTournamentCard";

type StatusFilterTab = "ALL" | "in_progress" | "completed" | "upcoming";

const STATUS_TABS: { label: string; value: StatusFilterTab }[] = [
  { label: "সকল টুর্নামেন্ট", value: "ALL" },
  { label: "চলমান", value: "in_progress" },
  { label: "সমাপ্ত", value: "completed" },
  { label: "আসন্ন ও প্রস্তুত", value: "upcoming" },
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<StatusFilterTab>("ALL");

  const loadTournaments = async (isRefresh = false) => {
    if (isRefresh) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const res = await apiClient.tournaments.getAll({ limit: 100 });
      setTournaments(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "টুর্নামেন্ট তথ্য লোড করতে ব্যর্থ হয়েছে";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournaments();
  }, []);

  // Filter tournaments by tab and search
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Status Filter Tab
      if (selectedTab === "in_progress" && t.status !== "in_progress") {
        return false;
      }
      if (selectedTab === "completed" && t.status !== "completed") {
        return false;
      }
      if (
        selectedTab === "upcoming" &&
        t.status !== "draft" &&
        t.status !== "teams_registered" &&
        t.status !== "fixtures_generated"
      ) {
        return false;
      }

      // 2. Search Term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesSeason = t.season.toLowerCase().includes(query);
        const matchesVenue = t.venue ? t.venue.toLowerCase().includes(query) : false;
        return matchesName || matchesSeason || matchesVenue;
      }

      return true;
    });
  }, [tournaments, selectedTab, searchTerm]);

  // Count active/in_progress tournaments
  const inProgressCount = useMemo(() => {
    return tournaments.filter((t) => t.status === "in_progress").length;
  }, [tournaments]);

  return (
    <div className="min-h-screen bg-[#101A17] text-white">
      {/* 1. Hero Header */}
      <section className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 border-b border-white/[0.08] overflow-hidden bg-gradient-to-b from-[#18251F] via-[#101A17] to-[#101A17]">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B9F66B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18251F] border border-[#B9F66B]/30 shadow-inner">
            <Trophy className="w-4 h-4 text-[#B9F66B]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase">
              একাডেমি টুর্নামেন্ট চ্যাম্পিয়নশিপ
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight">
            টুর্নামেন্ট ও লিগ প্রতিযোগিতা
          </h1>

          <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl mx-auto leading-relaxed">
            মর্নিং ফুটবল একাডেমির অভ্যন্তরীণ চ্যাম্পিয়নশিপ। উত্তেজনাপূর্ণ রাউন্ড-রবিন লিগ ম্যাচ, রুদ্ধশ্বাস গ্র্যান্ড ফাইনাল এবং গোল্ডেন বুটের লড়াই।
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-[#202E27] border border-white/10 text-white">
              মোট টুর্নামেন্ট: <strong className="text-[#B9F66B]">{toBnNum(tournaments.length)}</strong>
            </span>
            {inProgressCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                চলমান চ্যাম্পিয়নশিপ: {toBnNum(inProgressCount)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedTab === tab.value
                    ? "bg-[#B9F66B] text-[#101A17] font-black shadow-md"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="টুর্নামেন্টের নাম বা মৌসুম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
              />
            </div>

            <Button
              onPress={() => {
                loadTournaments(true);
              }}
              isDisabled={isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40 transition-colors cursor-pointer min-w-10"
              aria-label="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`} />
            </Button>
          </div>
        </div>

        {/* 3. Tournament Cards Grid / States */}
        {error ? (
          <div className="p-8 rounded-2xl bg-[#18251F] border border-rose-500/30 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">টুর্নামেন্ট ডেটা লোড করতে সমস্যা হয়েছে</h3>
              <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
            </div>
            <Button
              onPress={() => {
                loadTournaments(true);
              }}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-[#18251F] border border-white/5 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-white/5 rounded" />
                  <div className="h-6 w-3/4 bg-white/5 rounded" />
                  <div className="h-4 w-full bg-white/5 rounded" />
                </div>
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#A4B0A8]">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {searchTerm || selectedTab !== "ALL"
                  ? "কোনো মানানসই টুর্নামেন্ট পাওয়া যায়নি"
                  : "এখনও কোনো টুর্নামেন্ট যুক্ত করা হয়নি"}
              </h3>
              <p className="text-xs text-[#A4B0A8] max-w-sm mx-auto">
                {searchTerm || selectedTab !== "ALL"
                  ? "ফিল্টার পরিবর্তন করে অথবা অন্য কোনো নাম দিয়ে অনুসন্ধান করুন।"
                  : "মর্নিং ফুটবল একাডেমির নতুন টুর্নামেন্ট আয়োজন করা হলে এখানে প্রদর্শিত হবে।"}
              </p>
            </div>
            {(searchTerm || selectedTab !== "ALL") && (
              <Button
                onPress={() => {
                  setSearchTerm("");
                  setSelectedTab("ALL");
                }}
                className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <PublicTournamentCard key={tournament._id} tournament={tournament} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
