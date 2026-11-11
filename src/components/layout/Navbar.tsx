"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Menu, X, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/#about" },
  { label: "PLAYERS", href: "/#players" },
  { label: "FIXTURES", href: "/#fixtures" },
  { label: "RESULTS", href: "/#results" },
  { label: "NEWS", href: "/#news" },
  { label: "GALLERY", href: "/gallery" },
];

/**
 * Football Emblem Component
 * Crafted custom club crest with shield & football geometry
 */
function ClubEmblem() {
  return (
    <div
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#18181B] to-[#050505] border border-[#B9F66B]/30 shadow-[0_0_14px_rgba(185,246,107,0.18)] group-hover:border-[#B9F66B] group-hover:shadow-[0_0_20px_rgba(185,246,107,0.35)] transition-all duration-300"
      aria-hidden="true"
    >
      {/* Background shield glow */}
      <div className="absolute inset-0 rounded-xl bg-[#B9F66B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Modern European Club Soccer Ball Vector */}
      <svg
        className="w-5 h-5 text-[#B9F66B] transition-transform duration-500 ease-out group-hover:rotate-45"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon
          points="12 7 8 10 9.5 15 14.5 15 16 10"
          fill="currentColor"
          fillOpacity="0.25"
        />
        <line x1="12" y1="2" x2="12" y2="7" />
        <line x1="2.5" y1="9" x2="8" y2="10" />
        <line x1="5" y1="19.5" x2="9.5" y2="15" />
        <line x1="19" y1="19.5" x2="14.5" y2="15" />
        <line x1="21.5" y1="9" x2="16" y2="10" />
      </svg>
    </div>
  );
}

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
          {/* Left: Custom Text-Based Club Logo */}
          <Link
            href="/"
            onClick={() => handleLinkClick("/")}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B9F66B] rounded-lg transition-transform active:scale-98"
            aria-label="Morning Football Academy - Home"
          >
            <ClubEmblem />

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-[0.2em] text-white leading-none group-hover:text-[#B9F66B] transition-colors duration-200">
                MORNING
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.26em] text-[#B9F66B] uppercase leading-tight mt-1">
                FOOTBALL ACADEMY
              </span>
            </div>
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
              JOIN OUR ACADEMY
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
                  ? "Close navigation menu"
                  : "Open navigation menu"
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
              JOIN OUR ACADEMY
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
