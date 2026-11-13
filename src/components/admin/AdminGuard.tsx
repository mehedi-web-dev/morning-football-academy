"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "../../lib/use-admin-auth";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * AdminGuard Component
 * Reusable route protection container ensuring only authenticated Admin users access protected areas
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isPending, error } = useAdminAuth("/admin/login");

  if (isPending) {
    return (
      <div
        className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-[#101A17] text-white"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center space-y-5 text-center max-w-sm">
          {/* Logo badge with pulse animation */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#18251F] border border-[#B9F66B]/30 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(185,246,107,0.2)] animate-pulse">
            <Image
              src="/images/logo.jpeg"
              alt="Morning Football Academy Crest"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#B9F66B]">
              <Loader2 className="w-4 h-4 animate-spin text-[#B9F66B]" />
              <span>অ্যাডমিন অনুমতি যাচাই করা হচ্ছে...</span>
            </div>
            <p className="text-xs text-[#A4B0A8]">
              অথেন্টিকেশন সার্ভারের সাথে সংযোগ স্থাপন করা হচ্ছে...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-[#101A17] text-white">
        <div className="flex flex-col items-center space-y-4 text-center max-w-sm p-6 rounded-3xl bg-[#18251F] border border-red-500/30">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              প্রবেশাধিকার সংরক্ষিত
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              অননুমোদিত প্রবেশাধিকার। লগইন পোর্টালে পাঠানো হচ্ছে...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
