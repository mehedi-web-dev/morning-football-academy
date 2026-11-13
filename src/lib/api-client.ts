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
      if (params?.limit) query.set("limit", String(params.limit));
      if (typeof params?.isActive === "boolean") {
        query.set("isActive", String(params.isActive));
      }
      if (params?.search) query.set("search", params.search);
      if (params?.position) query.set("position", params.position);

      const qs = query.toString();
      return request<PlayerDocument[]>(`/players${qs ? `?${qs}` : ""}`);
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
      if (params?.limit) query.set("limit", String(params.limit));
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
};
