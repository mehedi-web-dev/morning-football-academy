"use client";

import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
  ShieldCheck,
  Server,
  Save,
  Sparkles,
  Globe,
} from "lucide-react";
import { useAdminAuth } from "../../../lib/use-admin-auth";

/**
 * Admin Settings Foundation Page
 * Configuration for academy branding, credentials, session management, and server connection
 */
export default function AdminSettingsPage() {
  const { user } = useAdminAuth(null);
  const [academyName, setAcademyName] = useState("Morning Football Academy");
  const [contactEmail, setContactEmail] = useState("info@morningfootball.com");
  const [tagline, setTagline] = useState("RISE TOGETHER. PLAY TO WIN.");

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              সিস্টেম কনফিগারেশন
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              নিরাপত্তা অডিট: যাচাইকৃত
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            অ্যাডমিন সেটিংস.
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            একাডেমি কনফিগারেশন, প্রশাসনিক নিরাপত্তা, এপিআই এন্ডপয়েন্ট এবং সিস্টেম সতর্কতা পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </Button>
        </div>
      </div>

      {/* 2. Academy Profile Settings */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Globe className="w-5 h-5 text-[#B9F66B]" />
          <div>
            <h3 className="font-black text-white uppercase tracking-tight text-base">
              একাডেমি প্রোফাইল ও পরিচিতি
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              পাবলিক পেজ ও আবেদনকারী ইমেইলে প্রদর্শিত ক্লাবের অফিসিয়াল পরিচিতি।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
              ক্লাবের অফিসিয়াল নাম
            </label>
            <input
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
              ক্লাবের পাবলিক ট্যাগলাইন
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
              অফিসিয়াল প্রশাসনিক যোগাযোগের ইমেইল
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. Security & Better Auth Integration */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-[#B9F66B]" />
          <div>
            <h3 className="font-black text-white uppercase tracking-tight text-base">
              নিরাপত্তা ও অথেনটিকেশন গেটওয়ে
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              Express সার্ভার ব্যাকএন্ড এবং Better Auth সেশন কুকির মাধ্যমে পরিচালিত প্রমাণীকরণ ব্যবস্থা।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#18251F] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              লগইনকৃত সুপার অ্যাডমিন
            </span>
            <span className="text-sm font-bold text-white block">
              {user?.email || "admin@morningfootball.com"}
            </span>
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase">
              স্ট্যাটাস: সক্রিয় নিরাপদ সেশন
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#18251F] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              অথেনটিকেশন ব্যাকএন্ড প্রক্সি গন্তব্য
            </span>
            <span className="text-sm font-mono text-white block">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
            </span>
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase">
              সেইম-অরিজিন প্রক্সি (/api/*) সক্রিয়
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-[#A4B0A8]">
            অ্যাডমিন পাসওয়ার্ড পরিবর্তন বা সেশন পলিসি আপডেট করতে চান?
          </span>
          <Button
            variant="outline"
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:text-[#B9F66B] transition-colors cursor-pointer"
          >
            পাসওয়ার্ড পরিবর্তন
          </Button>
        </div>
      </div>

      {/* 4. System Diagnostics */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#202E27] border border-white/10 space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Server className="w-5 h-5 text-[#B9F66B]" />
          <div>
            <h3 className="font-black text-white uppercase tracking-tight text-base">
              সিস্টেম পরিবেশ ও ডিপেন্ডেন্সি
            </h3>
            <p className="text-xs text-[#A4B0A8]">
              ফ্রন্টএন্ড রানটাইম ও ফ্রেমওয়ার্ক সংস্করণ।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#101A17] border border-white/5">
            <span className="text-[10px] text-[#A4B0A8] block">ফ্রেমওয়ার্ক</span>
            <span className="font-bold text-white">Next.js 16 (App Router)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101A17] border border-white/5">
            <span className="text-[10px] text-[#A4B0A8] block">কম্পোনেন্ট স্যুট</span>
            <span className="font-bold text-white">HeroUI v3</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101A17] border border-white/5">
            <span className="text-[10px] text-[#A4B0A8] block">স্টাইলিং ইঞ্জিন</span>
            <span className="font-bold text-white">Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101A17] border border-white/5">
            <span className="text-[10px] text-[#A4B0A8] block">অথ অ্যাডাপ্টার</span>
            <span className="font-bold text-white">Better Auth React</span>
          </div>
        </div>
      </div>

      {/* 5. Foundation Notice */}
      <div className="p-4 rounded-xl bg-[#18251F]/60 border border-white/5 text-center">
        <p className="text-[11px] font-mono text-[#A4B0A8]/70 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
          <span>
            অ্যাডমিন সেটিংস ডেমোনস্ট্রেশন ইন্টারফেস। পরবর্তী ধাপে ডেটাবেজ পারসিসট্যান্স এবং ওয়েবহুক সংযুক্ত করা হবে।
          </span>
        </p>
      </div>
    </div>
  );
}
