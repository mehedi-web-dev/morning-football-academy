/**
 * Players Data Model & Demonstration Squad Records
 *
 * DEMO DATA NOTICE:
 * All player names, squad numbers, and biographical details in this file are
 * temporary demonstration values for platform showcase and UI evaluation.
 * They do not represent real individuals, verified roster contracts, or
 * official competition statistics.
 */

export type PlayerPosition =
  | "Forward"
  | "Midfielder"
  | "Defender"
  | "Goalkeeper";

export type PositionCode = "FWD" | "MID" | "DEF" | "GK";

export interface Player {
  id: string;
  name: string;
  number: string;
  position: PlayerPosition;
  shortPosition: PositionCode;
  image: string;
  profileHref: string;
  roleDescription?: string;
  biography?: string;
  seasonStats?: {
    appearances: string;
    goals: string;
    assists: string;
  };
  statsPreview?: {
    label: string;
    value: string;
  }[];
}

/**
 * Demonstration Squad Roster
 */
export const DEMO_SQUAD_PLAYERS: Player[] = [
  {
    id: "player-one",
    name: "Player One",
    number: "10",
    position: "Forward",
    shortPosition: "FWD",
    image: "/images/players/mehedi.jpeg",
    profileHref: "/players/player-one",
    roleDescription: "Clinical finisher leading the attacking frontline",
    biography:
      "A composed forward with a clinical edge, Player One leads the line with intelligent movement, relentless pressing, and the ability to turn half-chances into match-winning moments.",
    // Demonstration values only. These are surfaced as demo data in the UI.
    seasonStats: {
      appearances: "24",
      goals: "18",
      assists: "07",
    },
    statsPreview: [
      { label: "Pace", value: "88" },
      { label: "Shooting", value: "85" },
    ],
  },
  {
    id: "player-two",
    name: "Player Two",
    number: "07",
    position: "Midfielder",
    shortPosition: "MID",
    image: "/images/players/player-2.jpg",
    profileHref: "/players/player-two",
    roleDescription: "Creative playmaker orchestrating tempo and transitions",
    statsPreview: [
      { label: "Passing", value: "89" },
      { label: "Vision", value: "86" },
    ],
  },
  {
    id: "player-three",
    name: "Player Three",
    number: "04",
    position: "Defender",
    shortPosition: "DEF",
    image: "/images/players/player-3.jpg",
    profileHref: "/players/player-three",
    roleDescription: "Solid defensive anchor with disciplined tactical positioning",
    statsPreview: [
      { label: "Defending", value: "87" },
      { label: "Physical", value: "84" },
    ],
  },
  {
    id: "player-four",
    name: "Player Four",
    number: "01",
    position: "Goalkeeper",
    shortPosition: "GK",
    image: "/images/players/player-4.jpg",
    profileHref: "/players/player-four",
    roleDescription: "Decisive shot-stopper commanding the penalty area",
    statsPreview: [
      { label: "Reflexes", value: "90" },
      { label: "Handling", value: "85" },
    ],
  },
];
