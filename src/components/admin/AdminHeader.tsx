"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Menu, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../../lib/use-admin-auth";

interface AdminHeaderProps {
  onOpenMobile: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * AdminHeader Component
 * Sticky top header for the admin portal with breadcrumb title, mobile toggle, live session badge, and quick actions
 */
export default function AdminHeader({
  onOpenMobile,
  title = "ড্যাশবোর্ড",
  subtitle = "সারসংক্ষেপ ও সিস্টেম অ্যানালিটিক্স",
}: AdminHeaderProps) {
  const { user, logout } = useAdminAuth(null);

  return (
    <header className="sticky top-0 z-30 w-full h-16 sm:h-20 bg-[#18251F]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger & Section Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[#A4B0A8] hover:text-white bg-white/[0.04] border border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] shrink-0"
          aria-label="নেভিগেশন মেনু খুলুন"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-mono text-[#A4B0A8] truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Public Site Link, Admin Profile & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-[#A4B0A8] hover:text-[#B9F66B] transition-colors"
        >
          <span>ওয়েবসাইট দেখুন</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Live Admin Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101A17] border border-[#B9F66B]/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#B9F66B] animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#B9F66B] uppercase">
            সুপার অ্যাডমিন
          </span>
        </div>

        {/* Admin Profile Details */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#101A17] border border-white/15 flex items-center justify-center text-[#B9F66B] shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div className="hidden xl:block text-left text-xs leading-tight">
            <span className="font-bold text-white block truncate max-w-[140px]">
              {user?.name || "অ্যাডমিনিস্ট্রেটর"}
            </span>
            <span className="text-[10px] text-[#A4B0A8] font-mono block truncate max-w-[140px]">
              {user?.email || "admin@morningfootball.com"}
            </span>
          </div>

          {/* Quick Logout Button */}
          <Button
            variant="outline"
            onPress={logout}
            className="p-2 min-w-9 w-9 h-9 sm:w-auto sm:px-3.5 sm:py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-[#A4B0A8] hover:text-red-300 font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
            aria-label="লগআউট"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">লগআউট</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
