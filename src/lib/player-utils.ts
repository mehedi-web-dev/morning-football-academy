/**
 * Pure utility functions for player data handling (isomorphic, safe for Server & Client)
 */

export type ShortPosition = "GK" | "DEF" | "MID" | "FWD";

/**
 * Maps player position string to standardized short code
 */
export function getShortPosition(position?: string): ShortPosition {
  switch (position) {
    case "Goalkeeper":
      return "GK";
    case "Defender":
      return "DEF";
    case "Midfielder":
      return "MID";
    case "Forward":
      return "FWD";
    default:
      return "FWD";
  }
}

/**
 * Calculate age accurately from date of birth
 */
export function calculateAge(dobStr?: string): number | null {
  if (!dobStr) return null;
  try {
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Format date for display
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
