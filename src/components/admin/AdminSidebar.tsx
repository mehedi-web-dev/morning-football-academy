"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  Award,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "../../lib/use-admin-auth";
import { apiClient } from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { label: "খেলোয়াড়বৃন্দ", href: "/admin/players", icon: Users },
  { label: "টুর্নামেন্ট", href: "/admin/tournaments", icon: Trophy },
  { label: "ম্যাচ ফিক্সচার", href: "/admin/matches", icon: Calendar },
  { label: "খেলার ফলাফল", href: "/admin/results", icon: Award },
  { label: "ফটো গ্যালারি", href: "/admin/gallery", icon: ImageIcon },
  { label: "ভর্তি রেজিস্ট্রেশন", href: "/admin/registrations", icon: FileText },
  { label: "একাডেমি সেটিংস", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * AdminSidebar Component
 * Fixed/collapsible desktop sidebar and responsive mobile slide-over navigation
 */
export default function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  // Move focus into the drawer when it opens so keyboard users land inside it.
  useEffect(() => {
    if (isMobileOpen) {
      mobileCloseButtonRef.current?.focus();
    }
  }, [isMobileOpen]);

  useEffect(() => {
    let isMounted = true;
    apiClient.registrations
      .countPending()
      .then((count) => {
        if (isMounted) setPendingCount(count);
      })
      .catch(() => {
        // Silently swallow in sidebar if unauthorized or loading
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  /**
   * Shared sidebar content.
   * `collapsed` is explicit (never the shared desktop flag) so the mobile drawer
   * always shows full labels/icons even if the desktop sidebar is collapsed.
   */
  const renderNavContent = (collapsed: boolean, variant: "desktop" | "mobile") => {
    const isMobile = variant === "mobile";
    const linkPadding = isMobile ? "px-4 py-3" : "px-3.5 py-2.5";
    const iconSize = isMobile ? "w-5 h-5" : "w-4 h-4";

    return (
      <div className="flex flex-col min-h-full justify-between bg-[#18251F] text-white border-r border-white/10 select-none">
        {/* 1. Header: Logo & Branding */}
        <div>
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
            <Link
              href="/admin"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] rounded-xl"
              onClick={onCloseMobile}
            >
              {/* Official Academy Crest */}
              <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-[#101A17] border border-[#B9F66B]/30 p-1 flex items-center justify-center shadow-sm group-hover:border-[#B9F66B] transition-colors">
                <Image
                  src="/images/logo.jpeg"
                  alt="Morning Football Academy Crest"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>

              {!collapsed && (
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-xs font-black tracking-tight text-white uppercase block leading-none truncate">
                    MORNING FOOTBALL
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#B9F66B] uppercase block">
                    অ্যাডমিন কনসোল
                  </span>
                </div>
              )}
            </Link>

            {/* Close mobile sidebar */}
            {isMobile && (
              <button
                ref={mobileCloseButtonRef}
                type="button"
                onClick={onCloseMobile}
                className="p-2.5 -mr-1 rounded-xl text-[#A4B0A8] hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B]"
                aria-label="মোবাইল নেভিগেশন বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 2. Navigation List */}
          <nav className="p-3 space-y-1.5" aria-label="Admin Navigation">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const badge =
                item.href === "/admin/registrations" && pendingCount > 0
                  ? toBnNum(pendingCount)
                  : item.badge;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 ${linkPadding} rounded-xl text-xs font-bold tracking-wide transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] ${
                    active
                      ? "bg-[#B9F66B] text-[#0A0A0A] shadow-[0_0_15px_rgba(185,246,107,0.25)] font-black"
                      : "text-[#A4B0A8] hover:text-white hover:bg-white/[0.05]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={`${iconSize} shrink-0 transition-transform group-hover:scale-110 ${
                      active ? "text-[#0A0A0A]" : "text-[#B9F66B]"
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 uppercase tracking-wider">{item.label}</span>
                  )}

                  {!collapsed && badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        active
                          ? "bg-[#0A0A0A] text-[#B9F66B]"
                          : "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Footer: Profile Summary, Collapse Toggle & Logout */}
        <div className="p-3 border-t border-white/10 space-y-2 bg-[#141F1A]">
          {/* Admin Profile Details */}
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-[#18251F] border border-white/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#101A17] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden space-y-0.5 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.name || "অ্যাডমিনিস্ট্রেটর"}
                </span>
                <span className="text-[10px] font-mono text-[#B9F66B] block truncate">
                  {user?.email || "admin@morningfootball.com"}
                </span>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-1.5">
            {/* Logout Action */}
            <button
              type="button"
              onClick={logout}
              title="লগআউট"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span>লগআউট</span>}
            </button>

            {/* Desktop Collapse Toggle */}
            {!isMobile && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-[#A4B0A8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors focus:outline-none cursor-pointer"
                aria-label={collapsed ? "সাইডবার প্রসারিত করুন" : "সাইডবার সংকুচিত করুন"}
                title={collapsed ? "সাইডবার প্রসারিত করুন" : "সাইডবার সংকুচিত করুন"}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#B9F66B]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-[#B9F66B]" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar (unchanged) */}
      <aside
        className={`hidden lg:block h-full transition-all duration-300 shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        aria-label="Desktop Sidebar"
      >
        {renderNavContent(isCollapsed, "desktop")}
      </aside>

      {/* Mobile Slide-Over Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-[#0A0A0A]/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        id="admin-mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-72 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl overflow-y-auto overscroll-contain ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent(false, "mobile")}
      </aside>
    </>
  );
}
