"use client";

import { Chip } from "@heroui/react";
import { Activity, Radio } from "lucide-react";
import { useAdminAuth } from "../../lib/use-admin-auth";
import AdminStats from "../../components/admin/AdminStats";
import RecentRegistrations from "../../components/admin/RecentRegistrations";
import RecentUpcomingMatches from "../../components/admin/RecentUpcomingMatches";
import RecentResults from "../../components/admin/RecentResults";

/**
 * Admin Dashboard Overview Page
 * Connected to live Express REST APIs with real database statistics and recent activities
 */
export default function AdminDashboardPage() {
  const { user } = useAdminAuth(null);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Chip
              className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              OPERATIONAL OVERVIEW
            </Chip>

            <span className="text-[11px] font-mono text-[#A4B0A8]">
              LIVE DATABASE CONNECTED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            WELCOME BACK, {user?.name?.toUpperCase() || "ADMIN"}.
          </h2>

          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            Here is what is happening across Morning Football Academy squads today.
          </p>
        </div>

        {/* Quick Date Display */}
        <div className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#18251F] border border-white/10 text-xs font-mono text-[#A4B0A8]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span className="text-white font-bold uppercase tracking-wider">
              SEASON 2026/27
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Statistic Cards (Connected to REST API) */}
      <section aria-labelledby="metrics-heading">
        <h3 id="metrics-heading" className="sr-only">
          Academy Key Performance Statistics
        </h3>
        <AdminStats />
      </section>

      {/* 3. Operational Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Registrations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <RecentRegistrations />
        </div>

        {/* Right Column: Upcoming Matches (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <RecentUpcomingMatches />
        </div>
      </div>

      {/* 4. Match Results Full Width Section */}
      <section aria-labelledby="results-section-heading">
        <h3 id="results-section-heading" className="sr-only">
          Recent Match Results Overview
        </h3>
        <RecentResults />
      </section>

      {/* 5. Live Gateway Status Indicator */}
      <div className="p-4 rounded-xl bg-[#18251F]/60 border border-white/5 text-center">
        <p className="text-[11px] font-mono text-[#A4B0A8]/80 uppercase tracking-widest flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#B9F66B] animate-pulse" />
          <span>
            Connected to Morning Football Academy REST API Gateway (port 5000) • Real-time operational data
          </span>
        </p>
      </div>
    </div>
  );
}
