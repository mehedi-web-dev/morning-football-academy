import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

export default function TournamentNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#101A17] text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#18251F] border border-white/10 flex items-center justify-center text-[#B9F66B] mb-5 shadow-lg">
        <Trophy className="w-8 h-8 opacity-60" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
        টুর্নামেন্ট পাওয়া যায়নি
      </h1>

      <p className="text-sm text-[#A4B0A8] max-w-md mb-6 leading-relaxed">
        অনুরোধকৃত টুর্নামেন্টটি মুছে ফেলা হয়েছে অথবা ভুল লিঙ্ক দিয়ে প্রবেশ করা হয়েছে।
      </p>

      <Link
        href="/tournaments"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider hover:bg-[#a8ec56] transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>সকল টুর্নামেন্টে ফিরে যান</span>
      </Link>
    </div>
  );
}
