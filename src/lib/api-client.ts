/**
 * Morning Football Academy API Client
 * Browser requests route through the same-origin Next.js /api rewrites proxy.
 * Server-side calls (SSR / prerender) fallback to direct backend connectivity.
 */

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // In the browser, use same-origin relative path to leverage Next.js rewrite proxy
    return "";
  }
  // On the server (SSR / SSG), call the backend URL directly
  return (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  isAuthError: boolean;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

// Data models matching the backend contracts exactly

export type PlayerStatus = "active" | "injured" | "inactive";

export interface PlayerStatistics {
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  minutesPlayed?: number;
  yellowCards?: number;
  redCards?: number;
  rating?: number;
  manOfTheMatch?: number;
  saves?: number;
}

export interface PlayerDocument {
  _id: string;
  fullName: string;
  slug: string;
  jerseyNumber: number;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  nationality: string;
  dateOfBirth: string;
  height?: string;
  weight?: string;
  bio?: string;
  photo: string;
  phoneNumber?: string;
  email?: string;
  currentAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
  secondaryPosition?: string;
  dominantFoot?: DominantFoot;
  playingExperienceYears?: number;
  previousClub?: string;
  previousTournaments?: string;
  achievements?: string;
  playerStatus?: PlayerStatus;
  joiningDate?: string;
  trainingGroup?: string;
  coachNotes?: string;
  statistics: PlayerStatistics;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerInput {
  fullName: string;
  slug: string;
  jerseyNumber: number;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  nationality: string;
  dateOfBirth: string;
  height?: string;
  weight?: string;
  bio?: string;
  photo: string;
  phoneNumber?: string;
  email?: string;
  currentAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
  secondaryPosition?: string;
  dominantFoot?: DominantFoot;
  playingExperienceYears?: number;
  previousClub?: string;
  previousTournaments?: string;
  achievements?: string;
  playerStatus?: PlayerStatus;
  joiningDate?: string;
  trainingGroup?: string;
  coachNotes?: string;
  statistics?: PlayerStatistics;
  isActive?: boolean;
}

export type UpdatePlayerInput = Partial<CreatePlayerInput>;

export type MatchStatus = "upcoming" | "live" | "completed" | "postponed" | "cancelled";
export type MatchHomeAway = "home" | "away";

export interface MatchDocument {
  _id: string;
  opponent: string;
  opponentLogo?: string;
  competition: string;
  venue: string;
  matchDate: string;
  kickOffTime: string;
  homeAway: MatchHomeAway;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchInput {
  opponent: string;
  opponentLogo?: string;
  competition: string;
  venue: string;
  matchDate: string;
  kickOffTime: string;
  homeAway: MatchHomeAway;
  status?: MatchStatus;
}

export type UpdateMatchInput = Partial<CreateMatchInput>;

export interface ResultDocument {
  _id: string;
  matchId: string;
  opponent: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  competition: string;
  venue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResultInput {
  matchId: string;
  opponent: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  competition: string;
  venue: string;
}

export type UpdateResultInput = Partial<CreateResultInput>;

export type GalleryMediaType = "image" | "video";

export interface GalleryDocument {
  _id: string;
  title: string;
  description?: string;
  mediaType: GalleryMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryInput {
  title: string;
  description?: string;
  mediaType: GalleryMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  category: string;
  isPublished?: boolean;
}

export type UpdateGalleryInput = Partial<CreateGalleryInput>;

export type RegistrationStatus = "pending" | "approved" | "rejected";
export type Gender = "male" | "female" | "other";
export type DominantFoot = "right" | "left" | "both";
export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";

export interface RegistrationDocument {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  position: string;
  experience: string;
  message?: string;
  gender: Gender;
  nationality: string;
  presentAddress: string;
  district: string;
  upazila: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryPosition: string;
  secondaryPosition?: string;
  preferredJerseyNumber: number;
  dominantFoot: DominantFoot;
  height: number;
  weight: number;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  previousClub?: string;
  previousTournaments?: string;
  achievements?: string;
  currentInstitution?: string;
  hasInjury: boolean;
  injuryDetails?: string;
  allergies?: string;
  motivation: string;
  additionalNotes?: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrationInput {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  position: string;
  experience: string;
  message?: string;
  gender: Gender;
  nationality: string;
  presentAddress: string;
  district: string;
  upazila: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryPosition: string;
  secondaryPosition?: string;
  preferredJerseyNumber: number;
  dominantFoot: DominantFoot;
  height: number;
  weight: number;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  previousClub?: string;
  previousTournaments?: string;
  achievements?: string;
  currentInstitution?: string;
  hasInjury: boolean;
  injuryDetails?: string;
  allergies?: string;
  motivation: string;
  additionalNotes?: string;
}

export type UpdateRegistrationInput = Partial<CreateRegistrationInput> & {
  status?: RegistrationStatus;
};

// ==========================================
// TOURNAMENT DATA MODELS & DTOS
// ==========================================

export type TournamentStatus =
  | "draft"
  | "teams_registered"
  | "fixtures_generated"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TournamentStage = "league" | "final";

export type TournamentMatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled";

export type GoalType = "regular" | "extra_time" | "own_goal";

export interface TournamentRules {
  minTeams: number;
  maxTeams: number | null;
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  hasExtraTimeInFinal: boolean;
  hasPenaltiesInFinal: boolean;
  teamsCount?: number;
  playersPerTeam?: number;
}

export interface MatchGoalEvent {
  playerId: string;
  teamId: string;
  minute?: number;
  type: GoalType;
}

export interface MatchResultDetails {
  homeScore: number;
  awayScore: number;
  regularTimeHomeScore?: number;
  regularTimeAwayScore?: number;
  extraTimeHomeScore?: number;
  extraTimeAwayScore?: number;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winnerTeamId?: string | null;
}

export interface TournamentDocument {
  _id: string;
  name: string;
  slug: string;
  season: string;
  description?: string;
  status: TournamentStatus;
  startDate: string;
  endDate?: string;
  venue?: string;
  rules: TournamentRules;
  registeredTeamCount?: number;
  finalMatchId?: string;
  winnerTeamId?: string;
  goldenBootPlayerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentTeamDocument {
  _id: string;
  tournamentId: string;
  name: string;
  shortCode?: string;
  logo?: string;
  color?: string;
  playerIds: string[];
  players?: PlayerDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface TournamentMatchDocument {
  _id: string;
  tournamentId: string;
  stage: TournamentStage;
  round?: number;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  matchDate?: string;
  kickOffTime?: string;
  venue?: string;
  status: TournamentMatchStatus;
  result?: MatchResultDetails;
  goals: MatchGoalEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  teamShortCode?: string;
  teamLogo?: string;
  teamColor?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GoldenBootEntry {
  rank: number;
  playerId: string;
  playerFullName: string;
  jerseyNumber: number;
  position: string;
  photo?: string;
  teamId: string;
  teamName: string;
  teamColor?: string;
  goalsCount: number;
}

export interface CreateTournamentInput {
  name: string;
  slug: string;
  season: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venue?: string;
}

export type UpdateTournamentInput = Partial<CreateTournamentInput> & {
  status?: TournamentStatus;
};

export interface RegisterTournamentTeamInput {
  name: string;
  shortCode?: string;
  logo?: string;
  color?: string;
  playerIds: string[];
}

export type UpdateTournamentTeamInput = Partial<RegisterTournamentTeamInput>;

export interface ScheduleTournamentMatchInput {
  matchDate?: string;
  kickOffTime?: string;
  venue?: string;
  status?: TournamentMatchStatus;
}

export interface SubmitTournamentMatchResultInput {
  stage?: TournamentStage;
  homeScore: number;
  awayScore: number;
  regularTimeHomeScore?: number;
  regularTimeAwayScore?: number;
  extraTimeHomeScore?: number;
  extraTimeAwayScore?: number;
  wentToExtraTime?: boolean;
  wentToPenalties?: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winnerTeamId?: string | null;
  goals?: MatchGoalEvent[];
}

// ==========================================
// Friendly Series Types & DTOs
// ==========================================

export type FriendlySeriesFormat = "best_of_3" | "best_of_5";

export type FriendlySeriesStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type FriendlyMatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled";

export type FriendlyGoalType = "normal" | "own_goal";

export interface FriendlyMatchGoalEvent {
  playerId: string;
  teamId: string;
  type: FriendlyGoalType;
  minute?: number;
}

export interface FriendlyMatchResult {
  homeScore: number;
  awayScore: number;
  winnerTeamId: string | null;
  isDraw: boolean;
  notes?: string;
  goals?: FriendlyMatchGoalEvent[];
}

export interface FriendlySeriesStats {
  teamAWins: number;
  teamBWins: number;
  draws: number;
  matchesPlayed: number;
  matchesRemaining: number;
  maxMatches: number; // 3 for bo3, 5 for bo5
  requiredWins: number; // 2 for bo3, 3 for bo5
  status: FriendlySeriesStatus;
  championTeamId: string | null;
  isDrawnSeries: boolean;
}

export interface FriendlySeriesDocument {
  _id: string;
  name: string;
  slug: string;
  season: string;
  description?: string;
  format: FriendlySeriesFormat;
  teamAId: string;
  teamBId: string;
  status: FriendlySeriesStatus;
  startDate?: string;
  endDate?: string;
  venue?: string;
  championTeamId?: string | null;
  isDrawnSeries: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FriendlySeriesMatchDocument {
  _id: string;
  seriesId: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  matchDate?: string;
  kickOffTime?: string;
  venue?: string;
  status: FriendlyMatchStatus;
  result?: FriendlyMatchResult;
  goals?: FriendlyMatchGoalEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface FriendlyTeamSummary {
  _id: string;
  name: string;
  shortCode?: string;
  logo?: string;
  color?: string;
}

export interface TopGoalScorerEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerFullName?: string;
  playerImage?: string;
  photo?: string;
  jerseyNumber?: number;
  position?: string;
  teamId: string;
  teamName: string;
  teamColor?: string;
  totalGoals: number;
  goalsCount?: number;
  matchesScored?: number;
}

export interface FriendlySeriesRosterTeam {
  _id: string;
  name: string;
  shortCode?: string;
  logo?: string;
  color?: string;
  players: PlayerDocument[];
}

export interface FriendlySeriesTeamPlayersResponse {
  seriesId: string;
  teamA: FriendlySeriesRosterTeam;
  teamB: FriendlySeriesRosterTeam;
}

export interface FriendlySeriesDetailResponse {
  series: FriendlySeriesDocument;
  teamA: FriendlyTeamSummary;
  teamB: FriendlyTeamSummary;
  stats: FriendlySeriesStats;
  championTeam?: FriendlyTeamSummary | null;
}

export interface CreateFriendlySeriesInput {
  name: string;
  slug: string;
  season: string;
  description?: string;
  format: FriendlySeriesFormat;
  teamAId: string;
  teamBId: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
}

export interface UpdateFriendlySeriesInput {
  name?: string;
  slug?: string;
  season?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  status?: FriendlySeriesStatus;
}

export interface ScheduleFriendlyMatchInput {
  matchNumber?: number;
  homeTeamId: string;
  awayTeamId: string;
  matchDate?: string;
  kickOffTime?: string;
  venue?: string;
  status?: FriendlyMatchStatus;
}

export interface UpdateFriendlyMatchScheduleInput {
  matchDate?: string;
  kickOffTime?: string;
  venue?: string;
  status?: FriendlyMatchStatus;
  homeTeamId?: string;
  awayTeamId?: string;
}

export interface SubmitFriendlyMatchResultInput {
  homeScore: number;
  awayScore: number;
  notes?: string;
  goals?: FriendlyMatchGoalEvent[];
}

export interface DashboardStats {
  totalPlayers: number;
  upcomingMatches: number;
  matchResults: number;
  pendingRegistrations: number;
}

/**
 * Core HTTP Request Method
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Normalize endpoint to ensure /api/v1 prefix
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const path = cleanEndpoint.startsWith("/api/v1")
    ? cleanEndpoint
    : `/api/v1${cleanEndpoint}`;

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      cache: options.cache || "no-store",
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Send Better Auth session cookies across origins
    });

    let data: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorPayload = data as { message?: string; details?: unknown } | null;
      let userSafeMessage = errorPayload?.message || "An unexpected error occurred";

      if (response.status === 401) {
        userSafeMessage = "Admin session expired or unauthenticated. Please log in.";
      } else if (response.status === 403) {
        userSafeMessage = "Forbidden: Authorized Administrator privileges required.";
      }

      throw new ApiError(userSafeMessage, response.status, errorPayload?.details);
    }

    return data as ApiResponse<T>;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    const message =
      err instanceof Error ? err.message : "Failed to connect to backend server";
    throw new ApiError(message, 500);
  }
}

/**
 * Reusable Typed Backend API Operations
 */
export const apiClient = {
  // Raw request helper
  request,

  // GET request helper
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  // 1. Players APIs
  players: {
    // Get all players with pagination and filters
    getAll: (params?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      search?: string;
      position?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      // Clamp limit to backend schema maximum of 100
      if (params?.limit !== undefined) {
        query.set("limit", String(Math.min(Math.max(1, params.limit), 100)));
      }
      if (typeof params?.isActive === "boolean") {
        query.set("isActive", String(params.isActive));
      }
      if (params?.search) query.set("search", params.search);
      if (params?.position) query.set("position", params.position);

      const qs = query.toString();
      return request<PlayerDocument[]>(`/players${qs ? `?${qs}` : ""}`);
    },

    // Retrieve all players across all pagination pages
    getAllPages: async (params?: {
      isActive?: boolean;
      search?: string;
      position?: string;
    }): Promise<PlayerDocument[]> => {
      let page = 1;
      const limit = 100;
      let allPlayers: PlayerDocument[] = [];
      let totalPages = 1;

      do {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(limit));
        query.set("sortBy", "jerseyNumber");
        query.set("sortOrder", "asc");
        if (typeof params?.isActive === "boolean") {
          query.set("isActive", String(params.isActive));
        }
        if (params?.search) query.set("search", params.search);
        if (params?.position) query.set("position", params.position);

        const qs = query.toString();
        const res = await request<PlayerDocument[]>(`/players?${qs}`);
        if (res.data && Array.isArray(res.data)) {
          allPlayers = allPlayers.concat(res.data);
        }
        totalPages = res.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);

      return allPlayers;
    },

    // Retrieve all active & eligible academy players across all pagination pages
    // Evaluates both isActive and playerStatus so no active player is excluded
    getAllActive: async (): Promise<PlayerDocument[]> => {
      let page = 1;
      const limit = 100;
      let allPlayers: PlayerDocument[] = [];
      let totalPages = 1;

      do {
        // Query players without hard server-side isActive filter to prevent excluding
        // documents where activity is stored via playerStatus instead of isActive.
        const res = await request<PlayerDocument[]>(
          `/players?page=${page}&limit=${limit}&sortBy=jerseyNumber&sortOrder=asc`
        );
        if (res.data && Array.isArray(res.data)) {
          allPlayers = allPlayers.concat(res.data);
        }
        totalPages = res.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);

      // Safe activity check:
      // A player is active if:
      // - isActive is not explicitly false
      // - playerStatus is not 'inactive'
      return allPlayers.filter((p) => {
        if (p.isActive === false) return false;
        if (p.playerStatus === "inactive") return false;
        return true;
      });
    },

    // Get all players with private admin fields (Protected Admin Endpoint)
    getAllAdmin: (params?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      search?: string;
      position?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit !== undefined) {
        query.set("limit", String(Math.min(Math.max(1, params.limit), 100)));
      }
      if (typeof params?.isActive === "boolean") {
        query.set("isActive", String(params.isActive));
      }
      if (params?.search) query.set("search", params.search);
      if (params?.position) query.set("position", params.position);

      const qs = query.toString();
      return request<PlayerDocument[]>(`/players/admin${qs ? `?${qs}` : ""}`);
    },

    // Count active players (uses limit=1 to read pagination.total accurately)
    countActive: async (): Promise<number> => {
      const res = await request<PlayerDocument[]>("/players?isActive=true&limit=1");
      return res.pagination?.total ?? 0;
    },

    // Get single player by MongoDB ID
    getById: (id: string) => {
      return request<PlayerDocument>(`/players/${id}`);
    },

    // Get single player by unique slug
    getBySlug: (slug: string) => {
      return request<PlayerDocument>(`/players/slug/${slug}`);
    },

    // Create a new player (Protected Admin Endpoint)
    create: (data: CreatePlayerInput) => {
      return request<PlayerDocument>("/players", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update player by ID (Protected Admin Endpoint)
    update: (id: string, data: UpdatePlayerInput) => {
      return request<PlayerDocument>(`/players/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Delete player by ID (Protected Admin Endpoint)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/players/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 2. Matches APIs
  matches: {
    // Get all matches with pagination and filters
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      competition?: string;
      from?: string;
      to?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.status) query.set("status", params.status);
      if (params?.competition) query.set("competition", params.competition);
      if (params?.from) query.set("from", params.from);
      if (params?.to) query.set("to", params.to);
      if (params?.sortBy) query.set("sortBy", params.sortBy);
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

      const qs = query.toString();
      return request<MatchDocument[]>(`/matches${qs ? `?${qs}` : ""}`);
    },

    // Get upcoming matches (sorted chronologically)
    getUpcoming: (limit = 5) => {
      return request<MatchDocument[]>(`/matches/upcoming?limit=${limit}`);
    },

    // Count upcoming matches (uses status=upcoming&limit=1 to read pagination.total accurately)
    countUpcoming: async (): Promise<number> => {
      const res = await request<MatchDocument[]>("/matches?status=upcoming&limit=1");
      return res.pagination?.total ?? 0;
    },

    // Get single match by ID
    getById: (id: string) => {
      return request<MatchDocument>(`/matches/${id}`);
    },

    // Get matches by specific status
    getByStatus: (status: string) => {
      return request<MatchDocument[]>(`/matches/status/${status}`);
    },

    // Create a new match fixture (Protected Admin Endpoint)
    create: (data: CreateMatchInput) => {
      return request<MatchDocument>("/matches", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update match fixture by ID (Protected Admin Endpoint)
    update: (id: string, data: UpdateMatchInput) => {
      return request<MatchDocument>(`/matches/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Delete match fixture by ID (Protected Admin Endpoint)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/matches/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 3. Results APIs
  results: {
    // Get all results with pagination and optional filters
    getAll: (params?: {
      page?: number;
      limit?: number;
      competition?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.competition) query.set("competition", params.competition);
      if (params?.sortBy) query.set("sortBy", params.sortBy);
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

      const qs = query.toString();
      return request<ResultDocument[]>(`/results${qs ? `?${qs}` : ""}`);
    },

    // Get recent results
    getRecent: (limit = 5) => {
      return request<ResultDocument[]>(`/results/recent?limit=${limit}`);
    },

    // Count all results (uses limit=1 to read pagination.total accurately)
    count: async (): Promise<number> => {
      const res = await request<ResultDocument[]>("/results?limit=1");
      return res.pagination?.total ?? 0;
    },

    // Get single result by ID
    getById: (id: string) => {
      return request<ResultDocument>(`/results/${id}`);
    },

    // Get result by referenced Match ID
    getByMatchId: (matchId: string) => {
      return request<ResultDocument>(`/results/match/${matchId}`);
    },

    // Create a new match score result (Protected Admin Endpoint)
    create: (data: CreateResultInput) => {
      return request<ResultDocument>("/results", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update match score result by ID (Protected Admin Endpoint)
    update: (id: string, data: UpdateResultInput) => {
      return request<ResultDocument>(`/results/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Delete match score result by ID (Protected Admin Endpoint)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/results/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 4. Gallery APIs (Public Read, Protected Admin Write)
  gallery: {
    // Get gallery items with pagination and filters
    getAll: (params?: {
      page?: number;
      limit?: number;
      category?: string;
      mediaType?: GalleryMediaType;
      isPublished?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.category) query.set("category", params.category);
      if (params?.mediaType) query.set("mediaType", params.mediaType);
      if (params?.isPublished !== undefined) {
        query.set("isPublished", String(params.isPublished));
      }
      if (params?.sortBy) query.set("sortBy", params.sortBy);
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

      const qs = query.toString();
      return request<GalleryDocument[]>(`/gallery${qs ? `?${qs}` : ""}`);
    },

    // Count all gallery items (uses limit=1 to read pagination.total accurately)
    count: async (params?: {
      isPublished?: boolean;
      category?: string;
      mediaType?: GalleryMediaType;
    }): Promise<number> => {
      const query = new URLSearchParams();
      query.set("limit", "1");
      if (params?.isPublished !== undefined) {
        query.set("isPublished", String(params.isPublished));
      }
      if (params?.category) query.set("category", params.category);
      if (params?.mediaType) query.set("mediaType", params.mediaType);

      const qs = query.toString();
      const res = await request<GalleryDocument[]>(`/gallery${qs ? `?${qs}` : ""}`);
      return res.pagination?.total ?? 0;
    },

    // Get single gallery item by ID
    getById: (id: string) => {
      return request<GalleryDocument>(`/gallery/${id}`);
    },

    // Get gallery items by category
    getByCategory: (category: string) => {
      return request<GalleryDocument[]>(
        `/gallery/category/${encodeURIComponent(category)}`
      );
    },

    // Create a new gallery media item (Protected Admin Endpoint)
    create: (data: CreateGalleryInput) => {
      return request<GalleryDocument>("/gallery", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update gallery media item by ID (Protected Admin Endpoint)
    update: (id: string, data: UpdateGalleryInput) => {
      return request<GalleryDocument>(`/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Toggle publish status convenience helper (Protected Admin Endpoint)
    togglePublish: (id: string, isPublished: boolean) => {
      return request<GalleryDocument>(`/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished }),
      });
    },

    // Delete gallery media item by ID (Protected Admin Endpoint)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/gallery/${id}`, {
        method: "DELETE",
      });
    },
  },

  // 5. Registrations APIs (Protected Admin Endpoints & Public Submission)
  registrations: {
    // Get registrations with pagination and status filter
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: RegistrationStatus;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.status) query.set("status", params.status);
      if (params?.search) query.set("search", params.search);
      if (params?.sortBy) query.set("sortBy", params.sortBy);
      if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

      const qs = query.toString();
      return request<RegistrationDocument[]>(`/registrations${qs ? `?${qs}` : ""}`);
    },

    // Get single registration by ID (Protected Admin Endpoint)
    getById: (id: string) => {
      return request<RegistrationDocument>(`/registrations/${id}`);
    },

    // Get registrations by status (Protected Admin Endpoint)
    getByStatus: (status: RegistrationStatus) => {
      return request<RegistrationDocument[]>(`/registrations/status/${status}`);
    },

    // Update status (e.g. approve or reject) (Protected Admin Endpoint)
    updateStatus: (id: string, status: RegistrationStatus) => {
      return request<RegistrationDocument>(`/registrations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },

    // Update registration details (Protected Admin Endpoint)
    update: (id: string, data: UpdateRegistrationInput) => {
      return request<RegistrationDocument>(`/registrations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Delete registration by ID (Protected Admin Endpoint)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/registrations/${id}`, {
        method: "DELETE",
      });
    },

    // Public academy registration submission
    submit: (data: CreateRegistrationInput) => {
      return request<RegistrationDocument>("/registrations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Count registrations (Protected Admin Endpoint)
    count: async (params?: {
      status?: RegistrationStatus;
      search?: string;
    }): Promise<number> => {
      const query = new URLSearchParams();
      query.set("limit", "1");
      if (params?.status) query.set("status", params.status);
      if (params?.search) query.set("search", params.search);

      const qs = query.toString();
      const res = await request<RegistrationDocument[]>(
        `/registrations${qs ? `?${qs}` : ""}`
      );
      return res.pagination?.total ?? 0;
    },

    // Count pending registrations (uses status=pending&limit=1 to read pagination.total accurately)
    countPending: async (): Promise<number> => {
      const res = await request<RegistrationDocument[]>("/registrations?status=pending&limit=1");
      return res.pagination?.total ?? 0;
    },
  },

  // 5. Aggregated Dashboard Overview Statistics
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const [totalPlayers, upcomingMatches, matchResults, pendingRegistrations] =
        await Promise.all([
          apiClient.players.countActive(),
          apiClient.matches.countUpcoming(),
          apiClient.results.count(),
          apiClient.registrations.countPending(),
        ]);

      return {
        totalPlayers,
        upcomingMatches,
        matchResults,
        pendingRegistrations,
      };
    },
  },

  // 6. Tournament Management APIs
  tournaments: {
    // List tournaments with pagination & filter
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: TournamentStatus;
      season?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.status) query.set("status", params.status);
      if (params?.season) query.set("season", params.season);

      const qs = query.toString();
      return request<TournamentDocument[]>(`/tournaments${qs ? `?${qs}` : ""}`);
    },

    // Get single tournament by ID
    getById: (id: string) => {
      return request<TournamentDocument>(`/tournaments/${id}`);
    },

    // Get single tournament by Slug
    getBySlug: (slug: string) => {
      return request<TournamentDocument>(`/tournaments/slug/${slug}`);
    },

    // Create tournament (Admin)
    create: (data: CreateTournamentInput) => {
      return request<TournamentDocument>("/tournaments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update tournament (Admin)
    update: (id: string, data: UpdateTournamentInput) => {
      return request<TournamentDocument>(`/tournaments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Cancel tournament (Admin)
    cancel: (id: string) => {
      return request<TournamentDocument>(`/tournaments/${id}/cancel`, {
        method: "POST",
      });
    },

    // Delete tournament (Admin)
    delete: (id: string) => {
      return request<{ deleted: boolean; id: string }>(`/tournaments/${id}`, {
        method: "DELETE",
      });
    },

    // Teams
    getTeams: (tournamentId: string) => {
      return request<TournamentTeamDocument[]>(`/tournaments/${tournamentId}/teams`);
    },

    getTeamById: (teamId: string) => {
      return request<TournamentTeamDocument & { players?: PlayerDocument[] }>(
        `/tournaments/teams/${teamId}`
      );
    },

    registerTeam: (tournamentId: string, data: RegisterTournamentTeamInput) => {
      return request<TournamentTeamDocument>(`/tournaments/${tournamentId}/teams`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    updateTeam: (teamId: string, data: UpdateTournamentTeamInput) => {
      return request<TournamentTeamDocument>(`/tournaments/teams/${teamId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    deleteTeam: (teamId: string) => {
      return request<{ deleted: boolean; teamId: string }>(
        `/tournaments/teams/${teamId}`,
        {
          method: "DELETE",
        }
      );
    },

    // Fixtures & Matches
    getMatches: (
      tournamentId: string,
      params?: {
        stage?: TournamentStage;
        round?: number;
        status?: TournamentMatchStatus;
        teamId?: string;
      }
    ) => {
      const query = new URLSearchParams();
      if (params?.stage) query.set("stage", params.stage);
      if (params?.round !== undefined) query.set("round", String(params.round));
      if (params?.status) query.set("status", params.status);
      if (params?.teamId) query.set("teamId", params.teamId);

      const qs = query.toString();
      return request<TournamentMatchDocument[]>(
        `/tournaments/${tournamentId}/matches${qs ? `?${qs}` : ""}`
      );
    },

    getMatchById: (tournamentId: string, matchId: string) => {
      return request<TournamentMatchDocument>(
        `/tournaments/${tournamentId}/matches/${matchId}`
      );
    },

    generateFixtures: (tournamentId: string) => {
      return request<TournamentMatchDocument[]>(
        `/tournaments/${tournamentId}/fixtures/generate`,
        {
          method: "POST",
        }
      );
    },

    generateFinal: (tournamentId: string) => {
      return request<TournamentMatchDocument>(
        `/tournaments/${tournamentId}/final/generate`,
        {
          method: "POST",
        }
      );
    },

    scheduleMatch: (
      tournamentId: string,
      matchId: string,
      data: ScheduleTournamentMatchInput
    ) => {
      return request<TournamentMatchDocument>(
        `/tournaments/${tournamentId}/matches/${matchId}/schedule`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
    },

    submitResult: (
      tournamentId: string,
      matchId: string,
      data: SubmitTournamentMatchResultInput
    ) => {
      return request<TournamentMatchDocument>(
        `/tournaments/${tournamentId}/matches/${matchId}/result`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
    },

    // Standings & Leaderboard
    getStandings: (tournamentId: string) => {
      return request<TeamStanding[]>(`/tournaments/${tournamentId}/standings`);
    },

    getGoldenBoot: (tournamentId: string) => {
      return request<GoldenBootEntry[]>(`/tournaments/${tournamentId}/golden-boot`);
    },
  },

  // ==========================================
  // Friendly Series Module
  // ==========================================
  friendlySeries: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      status?: FriendlySeriesStatus;
      format?: FriendlySeriesFormat;
      season?: string;
      teamId?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.status) query.set("status", params.status);
      if (params?.format) query.set("format", params.format);
      if (params?.season) query.set("season", params.season);
      if (params?.teamId) query.set("teamId", params.teamId);

      const qs = query.toString();
      return request<FriendlySeriesDetailResponse[]>(
        `/friendly-series${qs ? `?${qs}` : ""}`
      );
    },

    getBySlug: (slug: string) => {
      return request<FriendlySeriesDetailResponse>(`/friendly-series/slug/${slug}`);
    },

    getById: (id: string) => {
      return request<FriendlySeriesDetailResponse>(`/friendly-series/${id}`);
    },

    getStats: (id: string) => {
      return request<FriendlySeriesStats>(`/friendly-series/${id}/standings`);
    },

    getMatches: (seriesId: string) => {
      return request<FriendlySeriesMatchDocument[]>(
        `/friendly-series/${seriesId}/matches`
      );
    },

    getMatchById: (seriesId: string, matchId: string) => {
      return request<FriendlySeriesMatchDocument>(
        `/friendly-series/${seriesId}/matches/${matchId}`
      );
    },

    getPlayers: (id: string) => {
      return request<FriendlySeriesTeamPlayersResponse>(
        `/friendly-series/${id}/players`
      );
    },

    getTopScorers: (id: string) => {
      return request<TopGoalScorerEntry[]>(
        `/friendly-series/${id}/top-scorers`
      );
    },

    // Admin Actions
    create: (data: CreateFriendlySeriesInput) => {
      return request<FriendlySeriesDocument>("/friendly-series", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    update: (id: string, data: UpdateFriendlySeriesInput) => {
      return request<FriendlySeriesDocument>(`/friendly-series/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    delete: (id: string) => {
      return request<{ deleted: boolean }>(`/friendly-series/${id}`, {
        method: "DELETE",
      });
    },

    scheduleMatch: (
      seriesId: string,
      data: ScheduleFriendlyMatchInput
    ) => {
      return request<FriendlySeriesMatchDocument>(
        `/friendly-series/${seriesId}/matches`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    updateMatchSchedule: (
      seriesId: string,
      matchId: string,
      data: UpdateFriendlyMatchScheduleInput
    ) => {
      return request<FriendlySeriesMatchDocument>(
        `/friendly-series/${seriesId}/matches/${matchId}/schedule`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
    },

    submitMatchResult: (
      seriesId: string,
      matchId: string,
      data: SubmitFriendlyMatchResultInput
    ) => {
      return request<{
        match: FriendlySeriesMatchDocument;
        stats: FriendlySeriesStats;
      }>(`/friendly-series/${seriesId}/matches/${matchId}/result`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    correctMatchResult: (
      seriesId: string,
      matchId: string,
      data: SubmitFriendlyMatchResultInput
    ) => {
      return request<{
        match: FriendlySeriesMatchDocument;
        stats: FriendlySeriesStats;
      }>(`/friendly-series/${seriesId}/matches/${matchId}/result`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    /**
     * Aggregates all existing academy teams without duplicates from tournaments and series
     */
    getAvailableAcademyTeams: async (): Promise<FriendlyTeamSummary[]> => {
      const teamsMap = new Map<string, FriendlyTeamSummary>();
      try {
        const tournamentsRes = await apiClient.tournaments.getAll({ limit: 100 });
        const tournaments = tournamentsRes.data || [];
        const teamPromises = tournaments.map((t) =>
          apiClient.tournaments.getTeams(t._id).catch(() => ({ data: [] as TournamentTeamDocument[] }))
        );
        const results = await Promise.all(teamPromises);
        for (const res of results) {
          if (Array.isArray(res.data)) {
            for (const t of res.data) {
              if (t._id && !teamsMap.has(t._id)) {
                teamsMap.set(t._id, {
                  _id: t._id,
                  name: t.name,
                  shortCode: t.shortCode,
                  logo: t.logo,
                  color: t.color,
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch teams from tournaments:", e);
      }

      try {
        const seriesRes = await apiClient.friendlySeries.getAll({ limit: 100 });
        const seriesList = seriesRes.data || [];
        for (const s of seriesList) {
          if (s.teamA && !teamsMap.has(s.teamA._id)) {
            teamsMap.set(s.teamA._id, s.teamA);
          }
          if (s.teamB && !teamsMap.has(s.teamB._id)) {
            teamsMap.set(s.teamB._id, s.teamB);
          }
        }
      } catch {
        // Silently continue
      }

      return Array.from(teamsMap.values());
    },
  },
};
