/**
 * Matches Data Model & Demonstration Records
 *
 * DEMO DATA NOTICE:
 * All fixtures, schedules, and scores in this file are temporary demonstration
 * values for platform showcase and UI evaluation. They do not represent official,
 * verified academy competition results or audited match records.
 */

export interface MatchTeam {
  name: string;
  shortName: string;
  isHome?: boolean;
}

export interface Match {
  id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  competition: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "DEMO RESULT";
  date: string;
  kickoff: string;
  venue: string;
  matchHref: string;
  score?: {
    home: number;
    away: number;
  };
}

/**
 * Featured Next Upcoming Match
 */
export const FEATURED_MATCH: Match = {
  id: "featured-match",
  homeTeam: {
    name: "Morning Football Academy",
    shortName: "MFA",
    isHome: true,
  },
  awayTeam: {
    name: "Opponent FC",
    shortName: "OPP",
    isHome: false,
  },
  competition: "Friendly Match",
  status: "UPCOMING",
  date: "TBA",
  kickoff: "TBA",
  venue: "TBA",
  matchHref: "/fixtures",
};

/**
 * Additional Upcoming Fixtures (Demonstration Data)
 */
export const UPCOMING_FIXTURES: Match[] = [
  {
    id: "fixture-1",
    homeTeam: {
      name: "Morning Football Academy",
      shortName: "MFA",
      isHome: true,
    },
    awayTeam: {
      name: "City Rovers Academy",
      shortName: "CRA",
      isHome: false,
    },
    competition: "Academy Youth League",
    status: "UPCOMING",
    date: "TBA",
    kickoff: "TBA",
    venue: "Main Ground",
    matchHref: "/fixtures",
  },
  {
    id: "fixture-2",
    homeTeam: {
      name: "Metro United FC",
      shortName: "MUF",
      isHome: true,
    },
    awayTeam: {
      name: "Morning Football Academy",
      shortName: "MFA",
      isHome: false,
    },
    competition: "Regional Cup Qualifier",
    status: "UPCOMING",
    date: "TBA",
    kickoff: "TBA",
    venue: "Away Arena",
    matchHref: "/fixtures",
  },
  {
    id: "fixture-3",
    homeTeam: {
      name: "Morning Football Academy",
      shortName: "MFA",
      isHome: true,
    },
    awayTeam: {
      name: "Rising Stars FC",
      shortName: "RSF",
      isHome: false,
    },
    competition: "Friendly Invitational",
    status: "UPCOMING",
    date: "TBA",
    kickoff: "TBA",
    venue: "Pitch 1",
    matchHref: "/fixtures",
  },
];

/**
 * Recent Demonstration Match Result
 */
export const RECENT_DEMO_RESULT: Match = {
  id: "recent-demo-result",
  homeTeam: {
    name: "Morning Football Academy",
    shortName: "MFA",
    isHome: true,
  },
  awayTeam: {
    name: "Opponent FC",
    shortName: "OPP",
    isHome: false,
  },
  competition: "Pre-Season Exhibition",
  status: "DEMO RESULT",
  score: {
    home: 2,
    away: 1,
  },
  date: "Recent Match",
  kickoff: "Full Time",
  venue: "Academy Training Facility",
  matchHref: "/fixtures",
};
