import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ChevronRight } from "lucide-react";

// Quick Links Data
const QUICK_LINKS = [
  { label: "হোম", href: "/" },
  { label: "আমাদের সম্পর্কে", href: "/#about" },
  { label: "খেলোয়াড়বৃন্দ", href: "/#players" },
  { label: "ফিক্সচার ও সূচি", href: "/#fixtures" },
  { label: "ম্যাচ ফলাফল", href: "/#results" },
];

// Club Resources Data
const CLUB_RESOURCES = [
  { label: "সর্বশেষ সংবাদ", href: "/#news" },
  { label: "ফটো গ্যালারি", href: "/gallery" },
  { label: "খেলোয়াড় পরিসংখ্যান", href: "/#players" },
  { label: "একাডেমিতে ভর্তি", href: "/#join", badge: "ভর্তি চলছে" },
];

// Social Links Data with Custom SVGs
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#0A0A0A] text-white border-t border-white/10 overflow-hidden">
      {/* Decorative top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B9F66B]/50 to-transparent" />

      {/* Subtle pitch pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#B9F66B_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Club Branding */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] rounded-lg"
              aria-label="Morning Football Academy - Home"
            >
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#050505] border border-[#B9F66B]/30 shadow-[0_0_14px_rgba(185,246,107,0.18)] group-hover:border-[#B9F66B] group-hover:shadow-[0_0_20px_rgba(185,246,107,0.35)] transition-all duration-300 shrink-0">
                <Image
                  src="/images/logo.jpeg"
                  alt="Morning Football Academy logo"
                  width={1254}
                  height={1254}
                  sizes="(max-width: 640px) 64px, 80px"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-[0.2em] text-white leading-none group-hover:text-[#B9F66B] transition-colors duration-200">
                  MORNING
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.26em] text-[#B9F66B] uppercase leading-tight mt-1">
                  FOOTBALL ACADEMY
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-xs font-black tracking-[0.2em] text-[#B9F66B] uppercase pt-2">
              RISE TOGETHER. PLAY TO WIN.
            </p>

            {/* Description */}
            <p className="text-sm text-[#A4B0A8] leading-relaxed">
              Morning Football Academy নতুন প্রজন্মের ফুটবল প্রতিভা বিকাশ, দলগত সংহতি তৈরি এবং পেশাদার খেলোয়াড় গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-xs font-bold tracking-[0.16em] uppercase text-white mb-3">
                আমাদের অনুসরণ করুন
              </span>
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Morning Football Academy on ${item.name}`}
                    className="w-10 h-10 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-[#A4B0A8] hover:text-[#0A0A0A] hover:bg-[#B9F66B] hover:border-[#B9F66B] hover:shadow-[0_0_16px_rgba(185,246,107,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.22em] text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              প্রয়োজনীয় লিংক
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-[#A4B0A8] hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#B9F66B]/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#B9F66B]" />
                    <span className="group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Club Resources */}
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.22em] text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              ক্লাব রিসোর্স
            </h3>
            <ul className="space-y-2.5">
              {CLUB_RESOURCES.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-[#A4B0A8] hover:text-white transition-colors duration-200"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#B9F66B]/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#B9F66B]" />
                    <span className="group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                    {link.badge && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div id="contact" className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.22em] text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]" />
              যোগাযোগ
            </h3>
            <div className="space-y-3.5 text-sm">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-[#B9F66B] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-wider text-[#A4B0A8]/80 uppercase">
                    ইমেইল
                  </span>
                  <a
                    href="mailto:info@morningfootballacademy.com"
                    className="text-[#A4B0A8] hover:text-[#B9F66B] transition-colors break-all"
                  >
                    info@morningfootballacademy.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-[#B9F66B] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-wider text-[#A4B0A8]/80 uppercase">
                    ফোন
                  </span>
                  <a
                    href="tel:0131835581"
                    className="text-[#A4B0A8] hover:text-[#B9F66B] transition-colors"
                  >
                    0131835581
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-[#B9F66B] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-wider text-[#A4B0A8]/80 uppercase">
                    অবস্থান
                  </span>
                  <span className="text-[#A4B0A8]">বাংলাদেশ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Divider & Legal Row */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-[#A4B0A8] sm:flex-row sm:flex-wrap sm:justify-center lg:flex-nowrap lg:justify-between">
            <p className="text-center sm:text-left">
              &copy; ২০২৬ Morning Football Academy. সর্বস্বত্ব সংরক্ষিত।
            </p>

            <p className="text-center">
              Developed by{" "}
              <a
                href="https://developerjoy.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#B9F66B] hover:text-white hover:underline underline-offset-2 transition-colors duration-200"
              >
                Mehedi Hasan
              </a>
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/#privacy"
                className="hover:text-[#B9F66B] transition-colors duration-200"
              >
                গোপনীয়তা নীতি
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <Link
                href="/#terms"
                className="hover:text-[#B9F66B] transition-colors duration-200"
              >
                শর্তাবলী
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
