import { MatchStatus } from "./api-client";
import { formatBnDate, formatBnKickOffTime } from "./bn-utils";

/**
 * Format match date cleanly in Bengali
 */
export function formatMatchDate(
  dateStr?: string,
  options: { includeDayOfWeek?: boolean; short?: boolean } = {}
): string {
  if (!dateStr) return "তারিখ নির্ধারিত হয়নি";
  return formatBnDate(dateStr, options);
}

/**
 * Format kickoff time cleanly in Bengali (e.g., "15:30" -> "বিকাল ৩:৩০")
 */
export function formatKickOffTime(timeStr?: string): string {
  if (!timeStr) return "সময় নির্ধারিত হয়নি";
  return formatBnKickOffTime(timeStr);
}

/**
 * Derive team abbreviation from full name
 */
export function deriveTeamShortName(name?: string): string {
  if (!name) return "দল";
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  const initials = words.map((w) => w[0]).join("");
  return initials.slice(0, 4).toUpperCase();
}

/**
 * Get display metadata for match status in Bengali
 */
export function getMatchStatusMeta(status: MatchStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
  isPulse: boolean;
} {
  switch (status) {
    case "live":
      return {
        label: "লাইভ",
        badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
        dotClass: "bg-red-500",
        isPulse: true,
      };
    case "upcoming":
      return {
        label: "আসন্ন",
        badgeClass: "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30",
        dotClass: "bg-[#B9F66B]",
        isPulse: false,
      };
    case "completed":
      return {
        label: "সমাপ্ত",
        badgeClass: "bg-white/[0.06] text-[#A4B0A8] border border-white/10",
        dotClass: "bg-[#A4B0A8]",
        isPulse: false,
      };
    case "postponed":
      return {
        label: "স্থগিত",
        badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        dotClass: "bg-amber-400",
        isPulse: false,
      };
    case "cancelled":
      return {
        label: "বাতিল",
        badgeClass: "bg-zinc-800 text-zinc-400 border border-zinc-700",
        dotClass: "bg-zinc-500",
        isPulse: false,
      };
    default:
      return {
        label: (status as string).toUpperCase(),
        badgeClass: "bg-white/[0.04] text-white border border-white/10",
        dotClass: "bg-white",
        isPulse: false,
      };
  }
}
