import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@heroui/react";

export default function RootNotFound() {
  return (
    <div className="w-full bg-[#101A17] text-white min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#18251F] border border-white/10 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#B9F66B]/10 border border-[#B9F66B]/30 text-[#B9F66B] flex items-center justify-center shadow-[0_0_20px_rgba(185,246,107,0.15)]">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-[0.24em] text-[#B9F66B] uppercase block">
            ৪০৪ • পৃষ্ঠাটি পাওয়া যায়নি
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            মাঠের বাইরে চলে গেছেন?
          </h1>
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই, সরানো হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
