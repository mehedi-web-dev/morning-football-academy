import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { Button } from "@heroui/react";

export default function PlayerNotFound() {
  return (
    <div className="w-full bg-[#101A17] text-white min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-[#18251F] border border-white/10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            খেলোয়াড় পাওয়া যায়নি
          </h1>
          <p className="text-xs sm:text-sm text-[#A4B0A8] leading-relaxed">
            অনুরোধকৃত খেলোয়াড়ের প্রোফাইলটি পাওয়া যায়নি বা স্কোয়াড তালিকা থেকে সাময়িকভাবে নিষ্ক্রিয় করা হয়েছে।
          </p>
        </div>

        <div>
          <Link href="/squad">
            <Button
              className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-[#cbfd82] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পূর্ণাঙ্গ স্কোয়াডে ফিরে যান</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
