"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminSidebar, { ADMIN_NAV_ITEMS } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout Component
 * Reusable full-viewport dashboard shell for Morning Football Academy management
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const pageTitle = currentNav?.label || "Admin Console";

  return (
    <AdminGuard>
      {/* Full-viewport dashboard frame overlaying public wrapper */}
      <div className="fixed inset-0 z-40 bg-[#101A17] text-white flex overflow-hidden">
        {/* Left Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Sticky Header */}
          <AdminHeader
            onOpenMobile={() => setIsMobileOpen(true)}
            title={pageTitle}
            subtitle={
              pathname === "/admin"
                ? "Overview & System Analytics"
                : `Morning Football Academy ${pageTitle} Management`
            }
          />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
