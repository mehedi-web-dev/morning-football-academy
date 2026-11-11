"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@heroui/react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors safely without exposing secrets
    console.error("[Application Error Boundary]:", error.message);
  }, [error]);

  return (
    <div className="w-full bg-[#101A17] text-white min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#18251F] border border-red-500/30 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-[0.24em] text-red-400 uppercase block">
            TEMPORARY SYSTEM INTERRUPTION
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been notified.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onPress={reset}
            className="w-full sm:w-auto bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/">
            <Button
              className="w-full sm:w-auto bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 border border-white/15"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
