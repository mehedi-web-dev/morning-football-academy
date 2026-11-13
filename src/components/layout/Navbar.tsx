"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Menu, X, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "হোম", href: "/" },
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "খেলোয়াড়বৃন্দ", href: "/#players" },
  { label: "ফিক্সচার", href: "/#fixtures" },
  { label: "ফলাফল", href: "/#results" },
  { label: "সংবাদ", href: "/#news" },
  { label: "গ্যালারি", href: "/gallery" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [, startTransition] = useTransition();

  // Handle sticky header background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active hash for in-page anchors
  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Determine active state for links
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" &&
        (!activeHash || activeHash === "#home" || activeHash === "#")
      );
    }
    const hashTarget = href.startsWith("/#") ? href.slice(1) : href;
    if (activeHash && activeHash === hashTarget) {
      return true;
    }
    if (
      !activeHash &&
      (pathname === href || pathname === href.replace("/#", "/"))
    ) {
      return true;
    }
    return false;
  };

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      startTransition(() => {
        setActiveHash(`#${id}`);
      });
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href === "/") {
      startTransition(() => {
        setActiveHash("");
      });
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleJoinClick = () => {
    setIsMobileMenuOpen(false);
    const joinEl = document.getElementById("join");
    if (joinEl) {
      joinEl.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#join");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.55)] py-3"
          : "bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.08] py-4 md:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Official Academy Logo */}
          <Link
            href="/"
            onClick={() => handleLinkClick("/")}
            className="flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] rounded-lg transition-transform active:scale-98"
            aria-label="Morning Football Academy - Home"
          >
            <Image
              src="/images/logo.jpeg"
              alt="Morning Football Academy Logo"
              width={112}
              height={112}
              priority
              sizes="(max-width: 639px) 48px, 56px"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={`group relative px-3 py-2 text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] ${
                    active ? "text-[#B9F66B]" : "text-[#A4B0A8] hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>

                  {/* Active navigation indicator */}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#B9F66B] rounded-full shadow-[0_0_8px_rgba(185,246,107,0.9)]"
                      aria-hidden="true"
                    />
                  )}

                  {/* Elegant hover effect */}
                  {!active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white/40 rounded-full transition-all duration-200 group-hover:w-3 group-hover:bg-[#B9F66B]/70"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Desktop CTA Button */}
          <div className="hidden lg:flex items-center">
            <Button
              onPress={handleJoinClick}
              className="bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.14em] uppercase rounded-full px-5 py-2.5 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(185,246,107,0.25)] hover:shadow-[0_0_24px_rgba(185,246,107,0.45)] cursor-pointer"
            >
              একাডেমিতে ভর্তি হন
            </Button>
          </div>

          {/* Mobile: Hamburger Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white hover:text-[#B9F66B] hover:border-[#B9F66B]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] transition-colors duration-200"
              aria-label={
                isMobileMenuOpen
                  ? "নেভিগেশন মেনু বন্ধ করুন"
                  : "নেভিগেশন মেনু খুলুন"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-200 rotate-90 animate-in" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      <div
        id="mobile-navigation-drawer"
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-[520px] opacity-100 border-t border-white/10 mt-3"
            : "max-h-0 opacity-0 border-t-0 mt-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="bg-[#0A0A0A]/98 backdrop-blur-2xl px-5 pt-4 pb-6 space-y-3">
          <nav
            className="flex flex-col space-y-1"
            aria-label="Mobile Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200 border-b border-white/[0.04] ${
                    active
                      ? "text-[#B9F66B] bg-white/[0.04] pl-5"
                      : "text-[#A4B0A8] hover:text-white hover:bg-white/[0.02]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex items-center gap-2">
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B]"
                        aria-hidden="true"
                      />
                    )}
                    {item.label}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      active
                        ? "text-[#B9F66B] translate-x-0.5"
                        : "text-[#A4B0A8]/50"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTA Button */}
          <div className="pt-3 border-t border-white/[0.08]">
            <Button
              fullWidth
              onPress={handleJoinClick}
              className="w-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs tracking-[0.14em] uppercase rounded-full py-3 hover:bg-[#cbfd82] active:scale-98 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.3)] cursor-pointer"
            >
              একাডেমিতে ভর্তি হন
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
