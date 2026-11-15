"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "./AdminGuard";
import AdminSidebar, { ADMIN_NAV_ITEMS } from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminDashboardShellProps {
  children: ReactNode;
}

/**
 * AdminDashboardShell Component
 * Client-side dashboard wrapper with sidebar, responsive drawer, header, and route protection
 */
export default function AdminDashboardShell({
  children,
}: AdminDashboardShellProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMobileNav = useCallback(() => {
    setIsMobileOpen(false);
    // Return focus to the hamburger before the drawer becomes inert/hidden.
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  // Lock background scrolling (document + console pane) while the drawer is open.
  useEffect(() => {
    if (!isMobileOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMobileOpen]);

  // Close the drawer with the Escape key.
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, closeMobileNav]);

  // Close the drawer whenever the route changes (e.g. browser back/forward).
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // /admin/login is the public entry point for admin credentials
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Derive dynamic page title from active route
  const currentNav = ADMIN_NAV_ITEMS.find((item) => {
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(item.href);
  });

  const pageTitle = currentNav?.label || "অ্যাডমিন কনসোল";

  return (
    <AdminGuard>
      {/* Full-viewport dashboard frame overlaying public wrapper */}
      <div className="fixed inset-0 z-40 bg-[#101A17] text-white flex overflow-hidden">
        {/* Left Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={closeMobileNav}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Sticky Header */}
          <AdminHeader
            onOpenMobile={() => setIsMobileOpen(true)}
            isMobileOpen={isMobileOpen}
            menuButtonRef={menuButtonRef}
            title={pageTitle}
            subtitle={
              pathname === "/admin"
                ? "সারসংক্ষেপ ও সিস্টেম অ্যানালিটিক্স"
                : `মর্নিং ফুটবল একাডেমি ${pageTitle} ব্যবস্থাপনা`
            }
          />

          {/* Scrollable Page Body (scroll-locked while the mobile drawer is open) */}
          <main
            className={`flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 ${
              isMobileOpen ? "overflow-hidden" : "overflow-y-auto"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
