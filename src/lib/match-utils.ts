import { MatchStatus } from "./api-client";

/**
 * Format match date cleanly
 */
export function formatMatchDate(
  dateStr?: string,
  options: { includeDayOfWeek?: boolean; short?: boolean } = {}
): string {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    if (options.short) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return d.toLocaleDateString("en-US", {
      weekday: options.includeDayOfWeek !== false ? "short" : undefined,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format kickoff time cleanly (e.g., "15:30" -> "3:30 PM")
 */
export function formatKickOffTime(timeStr?: string): string {
  if (!timeStr) return "TBA";

  // Check if string matches HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeStr.trim().match(timeRegex);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  return timeStr;
}

/**
 * Derive team abbreviation from full name
 */
export function deriveTeamShortName(name?: string): string {
  if (!name) return "OPP";
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  const initials = words.map((w) => w[0]).join("");
  return initials.slice(0, 4).toUpperCase();
}

/**
 * Get display metadata for match status
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
        label: "LIVE",
        badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
        dotClass: "bg-red-500",
        isPulse: true,
      };
    case "upcoming":
      return {
        label: "UPCOMING",
        badgeClass: "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30",
        dotClass: "bg-[#B9F66B]",
        isPulse: false,
      };
    case "completed":
      return {
        label: "FULL TIME",
        badgeClass: "bg-white/[0.06] text-[#A4B0A8] border border-white/10",
        dotClass: "bg-[#A4B0A8]",
        isPulse: false,
      };
    case "postponed":
      return {
        label: "POSTPONED",
        badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        dotClass: "bg-amber-400",
        isPulse: false,
      };
    case "cancelled":
      return {
        label: "CANCELLED",
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
