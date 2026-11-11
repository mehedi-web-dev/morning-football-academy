export type ResultOutcome = "WIN" | "DRAW" | "LOSS";

/**
 * Calculates match result outcome based on scoreline
 * WIN: homeScore > awayScore
 * DRAW: homeScore === awayScore
 * LOSS: homeScore < awayScore
 */
export function calculateOutcome(homeScore: number, awayScore: number): ResultOutcome {
  if (homeScore > awayScore) return "WIN";
  if (homeScore === awayScore) return "DRAW";
  return "LOSS";
}

/**
 * Get outcome badge styling and metadata
 */
export function getOutcomeMeta(outcome: ResultOutcome): {
  label: string;
  badgeClass: string;
  pillClass: string;
  dotClass: string;
} {
  switch (outcome) {
    case "WIN":
      return {
        label: "WIN",
        badgeClass: "bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 shadow-[0_0_10px_rgba(185,246,107,0.15)]",
        pillClass: "bg-[#B9F66B] text-[#0A0A0A] font-black",
        dotClass: "bg-[#B9F66B]",
      };
    case "DRAW":
      return {
        label: "DRAW",
        badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        pillClass: "bg-amber-500 text-[#0A0A0A] font-black",
        dotClass: "bg-amber-400",
      };
    case "LOSS":
      return {
        label: "LOSS",
        badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
        pillClass: "bg-red-500 text-white font-black",
        dotClass: "bg-red-400",
      };
  }
}
