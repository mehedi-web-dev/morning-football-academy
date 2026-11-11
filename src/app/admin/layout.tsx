import type { ReactNode } from "react";
import AdminDashboardShell from "../../components/admin/AdminDashboardShell";

export const instant = false;

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout Component
 * Server wrapper configuring instant navigation validation exemption for authenticated admin console
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
