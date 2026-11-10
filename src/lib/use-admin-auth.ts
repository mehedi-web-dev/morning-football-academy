"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "./auth-client";

/**
 * Reusable Admin Authentication Hook
 * Wraps Better Auth's useSession hook with single Admin role and expiration checks
 */
export function useAdminAuth(redirectTo: string | null = "/admin/login") {
  const router = useRouter();
  const sessionResult = useSession();

  const session = sessionResult?.data;
  const isPending = sessionResult?.isPending ?? false;
  const error = sessionResult?.error ?? null;

  // Check if session has expired based on expiresAt timestamp
  const isExpired = session?.session?.expiresAt
    ? new Date(session.session.expiresAt) < new Date()
    : false;

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user && !isExpired && !error);

  useEffect(() => {
    if (redirectTo && !isPending && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isPending, isAuthenticated, redirectTo, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("[Auth] Logout error:", err);
    } finally {
      router.replace("/admin/login");
    }
  };

  return {
    session,
    user,
    isAuthenticated,
    isPending,
    error,
    refetch: sessionResult?.refetch,
    logout: handleLogout,
  };
}
