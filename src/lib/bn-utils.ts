/**
 * Bengali Localization Utilities for Morning Football Academy
 * Handles Bengali numeral conversion, localized date/time formatting, and sports terminology.
 */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/**
 * Converts English digits (0-9) to Bengali digits (০-৯)
 */
export function toBnNum(input: number | string | undefined | null): string {
  if (input === undefined || input === null || input === "") return "";
  const str = String(input);
  return str.replace(/\d/g, (d) => BN_DIGITS[parseInt(d, 10)] || d);
}

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const BN_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const BN_DAYS_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

/**
 * Formats a date string or Date object into natural Bengali format
 * e.g., "১৫ নভেম্বর ২০২৬" or "শুক্র, ১৫ নভেম্বর ২০২৬"
 */
export function formatBnDate(
  dateInput?: string | Date | null,
  options: { includeDayOfWeek?: boolean; short?: boolean } = {}
): string {
  if (!dateInput) return "তারিখ নির্ধারিত হয়নি";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = toBnNum(d.getDate());
    const month = BN_MONTHS[d.getMonth()];
    const year = toBnNum(d.getFullYear());

    if (options.includeDayOfWeek) {
      const dayName = options.short
        ? BN_DAYS_SHORT[d.getDay()]
        : BN_DAYS[d.getDay()];
      return `${dayName}, ${day} ${month} ${year}`;
    }

    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a 24-hour kickoff time (e.g. "15:30") into natural Bengali time
 * e.g., "বিকাল ৩:৩০"
 */
export function formatBnKickOffTime(timeStr?: string): string {
  if (!timeStr) return "সময় নির্ধারিত হয়নি";

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeStr.trim().match(timeRegex);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2];

    let period = "সকাল";
    if (hours >= 12 && hours < 15) {
      period = "দুপুর";
    } else if (hours >= 15 && hours < 18) {
      period = "বিকাল";
    } else if (hours >= 18 && hours < 20) {
      period = "সন্ধ্যা";
    } else if (hours >= 20 || hours < 4) {
      period = "রাত";
    }

    const formattedHours = hours % 12 || 12;
    return `${period} ${toBnNum(formattedHours)}:${toBnNum(minutes)}`;
  }

  return toBnNum(timeStr);
}

/**
 * Translate standard football positions to Bengali
 */
export function getBnPosition(position?: string): string {
  switch (position) {
    case "Goalkeeper":
      return "গোলরক্ষক";
    case "Defender":
      return "ডিফেন্ডার";
    case "Midfielder":
      return "মিডফিল্ডার";
    case "Forward":
      return "ফরোয়ার্ড";
    case "Centre Back":
      return "সেন্টার ব্যাক";
    case "Full Back / Wing Back":
      return "ফুল ব্যাক / উইং ব্যাক";
    case "Defensive Midfielder":
      return "ডিফেন্সিভ মিডফিল্ডার";
    case "Central Midfielder":
      return "সেন্ট্রাল মিডফিল্ডার";
    case "Attacking Midfielder":
      return "অ্যাটাকিং মিডফিল্ডার";
    case "Winger":
      return "উইঙ্গার";
    case "Striker / Centre Forward":
      return "স্ট্রাইকার";
    default:
      return position || "খেলোয়াড়";
  }
}

/**
 * Translate match status to Bengali
 */
export function getBnMatchStatus(status?: string): string {
  switch (status) {
    case "upcoming":
      return "আসন্ন";
    case "live":
      return "সরাসরি / লাইভ";
    case "completed":
      return "সমাপ্ত";
    case "postponed":
      return "স্থগিত";
    case "cancelled":
      return "বাতিল";
    default:
      return status ? String(status).toUpperCase() : "";
  }
}

/**
 * Translate result outcome to Bengali
 */
export function getBnOutcome(outcome?: string): string {
  switch (outcome) {
    case "WIN":
      return "জয়";
    case "DRAW":
      return "ড্র";
    case "LOSS":
      return "পরাজয়";
    default:
      return outcome || "";
  }
}

/**
 * Translate registration candidate status to Bengali
 */
export function getBnRegistrationStatus(status?: string): string {
  switch (status) {
    case "pending":
      return "অপেক্ষমাণ";
    case "reviewing":
      return "পর্যালোচনাধীন";
    case "approved":
      return "অনুমোদিত";
    case "rejected":
      return "প্রত্যাখ্যাত";
    default:
      return status || "";
  }
}

/**
 * Translate tournament status to Bengali
 */
export function getBnTournamentStatus(status?: string): string {
  switch (status) {
    case "draft":
      return "খসড়া";
    case "teams_registered":
      return "দলসমূহ নিবন্ধিত";
    case "fixtures_generated":
      return "ফিক্সচার তৈরি সম্পন্ন";
    case "in_progress":
      return "চলমান";
    case "completed":
      return "সমাপ্ত";
    case "cancelled":
      return "বাতিল";
    default:
      return status || "";
  }
}

/**
 * Translate tournament stage to Bengali
 */
export function getBnTournamentStage(stage?: string): string {
  switch (stage) {
    case "league":
      return "লিগ পর্ব";
    case "final":
      return "ফাইনাল";
    default:
      return stage || "";
  }
}

/**
 * Translate tournament round to Bengali
 */
export function getBnRound(round?: number | null): string {
  if (!round) return "ফাইনাল";
  return `রাউন্ড ${toBnNum(round)}`;
}

/**
 * Translate tournament match status to Bengali
 */
export function getBnTournamentMatchStatus(status?: string): string {
  switch (status) {
    case "scheduled":
      return "নির্ধারিত";
    case "live":
      return "লাইভ";
    case "completed":
      return "সমাপ্ত";
    case "postponed":
      return "স্থগিত";
    case "cancelled":
      return "বাতিল";
    default:
      return status || "";
  }
}

/**
 * Translate goal type to Bengali
 */
export function getBnGoalType(type?: string): string {
  switch (type) {
    case "regular":
      return "নিয়মিত গোল";
    case "extra_time":
      return "অতিরিক্ত সময়ের গোল";
    case "own_goal":
      return "আত্মঘাতী গোল";
    default:
      return type || "";
  }
}
