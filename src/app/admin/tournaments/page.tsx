"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Edit2,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
} from "lucide-react";
import AdminGuard from "../../../components/admin/AdminGuard";
import AdminDashboardShell from "../../../components/admin/AdminDashboardShell";
import {
  apiClient,
  TournamentDocument,
  TournamentTeamDocument,
  TournamentMatchDocument,
  TeamStanding,
  GoldenBootEntry,
  PlayerDocument,
} from "../../../lib/api-client";
import {
  toBnNum,
  formatBnDate,
  getBnTournamentStatus,
  getBnTournamentMatchStatus,
  getBnRound,
  getBnPosition,
} from "../../../lib/bn-utils";
import TournamentFormModal from "../../../components/admin/TournamentFormModal";
import TournamentTeamModal from "../../../components/admin/TournamentTeamModal";
import TournamentMatchScheduleModal from "../../../components/admin/TournamentMatchScheduleModal";
import TournamentMatchResultModal from "../../../components/admin/TournamentMatchResultModal";
import DeleteTournamentModal from "../../../components/admin/DeleteTournamentModal";

type ManagementSubTab = "teams" | "matches" | "standings" | "goldenBoot";

export default function AdminTournamentsPage() {
  // Tournaments List State
  const [tournaments, setTournaments] = useState<TournamentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected Tournament for in-depth management
  const [selectedTournament, setSelectedTournament] = useState<TournamentDocument | null>(
    null
  );
  const [managementTab, setManagementTab] = useState<ManagementSubTab>("teams");

  // Selected Tournament Data
  const [teams, setTeams] = useState<
    (TournamentTeamDocument & { players?: PlayerDocument[] })[]
  >([]);
  const [matches, setMatches] = useState<TournamentMatchDocument[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [goldenBoot, setGoldenBoot] = useState<GoldenBootEntry[]>([]);
  const [playersMap, setPlayersMap] = useState<Map<string, PlayerDocument>>(new Map());
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Modals state
  const [isTournamentFormOpen, setIsTournamentFormOpen] = useState(false);
  const [tournamentToEdit, setTournamentToEdit] = useState<TournamentDocument | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<TournamentDocument | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<TournamentTeamDocument | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [matchToSchedule, setMatchToSchedule] = useState<TournamentMatchDocument | null>(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [matchToEnterResult, setMatchToEnterResult] = useState<TournamentMatchDocument | null>(null);

  // Action busy states
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);

  // Match Round filter in admin
  const [matchRoundFilter, setMatchRoundFilter] = useState<string>("all");

  // Notification Toast State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load all academy players for lookup across all pages
  useEffect(() => {
    apiClient.players
      .getAllPages()
      .then((players) => {
        const pMap = new Map<string, PlayerDocument>();
        players.forEach((p) => pMap.set(p._id, p));
        setPlayersMap(pMap);
      })
      .catch((err: unknown) => {
        console.error("Failed to load players for admin map:", err);
      });
  }, []);

  // Load tournaments list
  const loadTournaments = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsLoading(true);
    }
    try {
      const res = await apiClient.tournaments.getAll({ limit: 100 });
      const list = res.data || [];
      setTournaments(list);

      // Keep selected tournament updated
      if (selectedTournament) {
        const updated = list.find((t) => t._id === selectedTournament._id);
        if (updated) setSelectedTournament(updated);
      } else if (list.length > 0) {
        setSelectedTournament(list[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "টুর্নামেন্ট তালিকা লোড করতে ব্যর্থ হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTournament]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected tournament detail datasets
  const loadTournamentDetails = useCallback(
    async (tournamentId: string, isManual = false) => {
      if (isManual) {
        setIsLoadingDetails(true);
      }
      try {
        const [teamsRes, matchesRes, standingsRes, gbRes] = await Promise.allSettled([
          apiClient.tournaments.getTeams(tournamentId),
          apiClient.tournaments.getMatches(tournamentId),
          apiClient.tournaments.getStandings(tournamentId),
          apiClient.tournaments.getGoldenBoot(tournamentId),
        ]);

        if (teamsRes.status === "fulfilled" && teamsRes.value.data) {
          const rawTeams = teamsRes.value.data;
          const enhancedTeams = rawTeams.map((team) => {
            const teamPlayers: PlayerDocument[] = [];
            if (Array.isArray(team.playerIds)) {
              team.playerIds.forEach((pid) => {
                const p = playersMap.get(pid);
                if (p) teamPlayers.push(p);
              });
            }
            return {
              ...team,
              players: team.players && team.players.length > 0 ? team.players : teamPlayers,
            };
          });
          setTeams(enhancedTeams);
        }

        if (matchesRes.status === "fulfilled" && matchesRes.value.data) {
          setMatches(matchesRes.value.data);
        }

        if (standingsRes.status === "fulfilled" && standingsRes.value.data) {
          setStandings(standingsRes.value.data);
        }

        if (gbRes.status === "fulfilled" && gbRes.value.data) {
          setGoldenBoot(gbRes.value.data);
        }
      } catch (err: unknown) {
        console.error("Error loading tournament details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [playersMap]
  );

  useEffect(() => {
    if (selectedTournament) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTournamentDetails(selectedTournament._id);
    }
  }, [selectedTournament, loadTournamentDetails]);

  // Teams lookup map
  const teamsMap = useMemo(() => {
    const map = new Map<string, TournamentTeamDocument>();
    teams.forEach((t) => map.set(t._id, t));
    return map;
  }, [teams]);

  // Filter tournaments list
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.name.toLowerCase().includes(q) ||
          t.season.toLowerCase().includes(q) ||
          (t.venue && t.venue.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tournaments, statusFilter, searchQuery]);

  // Filter matches by round
  const filteredMatches = useMemo(() => {
    let list = [...matches];
    if (matchRoundFilter === "final") {
      list = list.filter((m) => m.stage === "final");
    } else if (matchRoundFilter !== "all") {
      const rNum = parseInt(matchRoundFilter, 10);
      list = list.filter((m) => m.stage === "league" && m.round === rNum);
    }
    return list.sort((a, b) => a.matchNumber - b.matchNumber);
  }, [matches, matchRoundFilter]);

  // Dynamic rounds extracted from league matches
  const availableRounds = useMemo(() => {
    const rounds = new Set<number>();
    matches.forEach((m) => {
      if (m.stage === "league" && typeof m.round === "number") {
        rounds.add(m.round);
      }
    });
    return Array.from(rounds).sort((a, b) => a - b);
  }, [matches]);

  // Handler: Generate Round-Robin Fixtures
  const handleGenerateFixtures = async () => {
    if (!selectedTournament) return;
    setIsGeneratingFixtures(true);
    try {
      await apiClient.tournaments.generateFixtures(selectedTournament._id);
      setNotification({
        type: "success",
        message: "অভিনন্দন! রাউন্ড-রবিন ম্যাচ ফিক্সচার সফলভাবে তৈরি হয়েছে।",
      });
      // Refresh tournament and details
      loadTournaments();
      loadTournamentDetails(selectedTournament._id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ফিক্সচার তৈরি করতে সমস্যা হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsGeneratingFixtures(false);
    }
  };

  // Handler: Generate Grand Final (Top 2 teams)
  const handleGenerateFinal = async () => {
    if (!selectedTournament) return;
    setIsGeneratingFinal(true);
    try {
      await apiClient.tournaments.generateFinal(selectedTournament._id);
      setNotification({
        type: "success",
        message: "শীর্ষ ২ দলের মধ্যে গ্র্যান্ড ফাইনাল ফিক্সচার সফলভাবে তৈরি হয়েছে!",
      });
      loadTournaments();
      loadTournamentDetails(selectedTournament._id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ফাইনাল ফিক্সচার তৈরি করতে সমস্যা হয়েছে।";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  // Handler: Delete Team
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (
      !confirm(
        `আপনি কি নিশ্চিতভাবে "${teamName}" দলটি এই টুর্নামেন্ট থেকে মুছে ফেলতে চান?`
      )
    ) {
      return;
    }
    try {
      await apiClient.tournaments.deleteTeam(teamId);
      setNotification({
        type: "success",
        message: `দল "${teamName}" সফলভাবে মুছে ফেলা হয়েছে।`,
      });
      if (selectedTournament) {
        loadTournaments();
        loadTournamentDetails(selectedTournament._id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "দল মুছতে ব্যর্থ হয়েছে।";
      setNotification({ type: "error", message: msg });
    }
  };

  // League matches completion checker
  const leagueMatches = useMemo(() => {
    return matches.filter((m) => m.stage === "league");
  }, [matches]);

  const totalLeagueMatchesCount = leagueMatches.length;

  const completedLeagueMatchesCount = useMemo(() => {
    return leagueMatches.filter((m) => m.status === "completed").length;
  }, [leagueMatches]);

  const allLeagueMatchesComplete =
    totalLeagueMatchesCount > 0 &&
    completedLeagueMatchesCount === totalLeagueMatchesCount;
  const hasFinalMatch = matches.some((m) => m.stage === "final");

  return (
    <AdminGuard>
      <AdminDashboardShell>
        <div className="space-y-8">
          {/* Top Banner / Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                <Trophy className="w-4 h-4" />
                টুর্নামেন্ট ম্যানেজমেন্ট কনসোল
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                টুর্নামেন্ট ও টিম ড্যাশবোর্ড
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                টুর্নামেন্ট পরিচালনা, ৫–৬ জনের স্কোয়াড গঠন, ফিক্সচার জেনারেশন ও লাইভ গোল্ডেন বুট।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadTournaments();
                  if (selectedTournament) loadTournamentDetails(selectedTournament._id);
                }}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => {
                  setTournamentToEdit(null);
                  setIsTournamentFormOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                নতুন টুর্নামেন্ট তৈরি
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm transition-all ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                বন্ধ করুন
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: TOURNAMENT SELECTOR CARDS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                বিদ্যমান টুর্নামেন্টসমূহ ({toBnNum(filteredTournaments.length)})
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="টুর্নামেন্ট খুঁজুন..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">সকল স্ট্যাটাস</option>
                  <option value="draft">ড্রাফট (Draft)</option>
                  <option value="teams_registered">দল নিবন্ধিত</option>
                  <option value="fixtures_generated">ফিক্সচার নির্ধারিত</option>
                  <option value="in_progress">চলমান (In Progress)</option>
                  <option value="completed">সমাপ্ত (Completed)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="h-40 rounded-2xl border border-slate-800 bg-slate-900/50 flex items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400">টুর্নামেন্ট লোড হচ্ছে...</span>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">কোনো টুর্নামেন্ট পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500">
                  নতুন টুর্নামেন্ট তৈরি করতে উপরের বাটনে ক্লিক করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTournaments.map((t) => {
                  const isSelected = selectedTournament?._id === t._id;

                  return (
                    <div
                      key={t._id}
                      onClick={() => setSelectedTournament(t)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isSelected
                          ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {getBnTournamentStatus(t.status)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            সিজন: {t.season}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-tight">
                          {t.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            {toBnNum(t.registeredTeamCount || 0)}টি দল (ন্যূনতম ৩)
                          </span>
                          {t.venue && (
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {t.venue}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isSelected ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {isSelected ? "বর্তমানে নির্বাচিত" : "পরিচালনা করুন"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/tournaments/${t.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="পাবলিক পেজ দেখুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setTournamentToEdit(t);
                              setIsTournamentFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setTournamentToDelete(t);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="মুছুন / বাতিল করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: TOURNAMENT MANAGEMENT CONSOLE */}
          {/* ======================================================== */}
          {selectedTournament && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-6 shadow-2xl">
              {/* Management Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      সক্রিয় পরিচালনা কনসোল
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedTournament.name} ({selectedTournament.season})
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-3">
                    <span>স্ট্যাটাস: <strong>{getBnTournamentStatus(selectedTournament.status)}</strong></span>
                    <span>•</span>
                    <span>ভেন্যু: <strong>{selectedTournament.venue || "নির্ধারিত নয়"}</strong></span>
                  </p>
                </div>

                {/* Workflow Triggers */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Generate Fixtures Button (Requires at least 3 teams) */}
                  {(selectedTournament.status === "teams_registered" ||
                    (selectedTournament.status === "draft" && teams.length >= 3)) && (
                    <button
                      onClick={handleGenerateFixtures}
                      disabled={isGeneratingFixtures || teams.length < 3}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      {isGeneratingFixtures
                        ? "ফিক্সচার তৈরি হচ্ছে..."
                        : "রাউন্ড-রবিন লিগ ফিক্সচার তৈরি করুন"}
                    </button>
                  )}

                  {/* Generate Final Button (Requires all league matches completed) */}
                  {!hasFinalMatch &&
                    (selectedTournament.status === "in_progress" ||
                      selectedTournament.status === "fixtures_generated") &&
                    allLeagueMatchesComplete && (
                      <button
                        onClick={handleGenerateFinal}
                        disabled={isGeneratingFinal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4" />
                        {isGeneratingFinal
                          ? "ফাইনাল তৈরি হচ্ছে..."
                          : "গ্র্যান্ড ফাইনাল তৈরি করুন (শীর্ষ ২ দল)"}
                      </button>
                    )}

                  <Link
                    href={`/tournaments/${selectedTournament.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    লাইভ ভিউ
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  টুর্নামেন্ট লাইফসাইকেল অগ্রগতি:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div
                    className={`p-2 rounded-xl border ${
                      selectedTournament.status === "draft"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    ১. ড্রাফট
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      selectedTournament.status === "teams_registered"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                        : teams.length >= 3
                        ? "bg-slate-900 border-emerald-500/30 text-emerald-400 font-medium"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    ২. দল নিবন্ধিত ({toBnNum(teams.length)}টি, ন্যূনতম ৩)
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      selectedTournament.status === "fixtures_generated"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                        : matches.length > 0
                        ? "bg-slate-900 border-emerald-500/30 text-emerald-400 font-medium"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    ৩. ফিক্সচার প্রস্তুত
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      selectedTournament.status === "in_progress"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    ৪. ম্যাচ চলমান ({toBnNum(completedLeagueMatchesCount)}/{toBnNum(totalLeagueMatchesCount)})
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      selectedTournament.status === "completed"
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-black"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    ৫. ফাইনাল ও চ্যাম্পিয়ন
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setManagementTab("teams")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    managementTab === "teams"
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  দল ও স্কোয়াড ({toBnNum(teams.length)}টি)
                </button>

                <button
                  onClick={() => setManagementTab("matches")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    managementTab === "matches"
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  ফিক্সচার ও ফলাফল ({toBnNum(matches.length)})
                </button>

                <button
                  onClick={() => setManagementTab("standings")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    managementTab === "standings"
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  পয়েন্ট টেবিল
                </button>

                <button
                  onClick={() => setManagementTab("goldenBoot")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    managementTab === "goldenBoot"
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  গোল্ডেন বুট ({toBnNum(goldenBoot.length)})
                </button>
              </div>

              {/* Sub-Tab 1: Teams & Squads */}
              {managementTab === "teams" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        অংশগ্রহণকারী দলসমূহ ({toBnNum(teams.length)}টি)
                      </h3>
                      <p className="text-xs text-slate-400">
                        টুর্নামেন্টে কমপক্ষে ৩টি দল থাকবে। প্রতিটি দলে ৫–৬ জন খেলোয়াড় থাকতে হবে।
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setTeamToEdit(null);
                        setIsTeamModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      নতুন দল নিবন্ধন করুন
                    </button>
                  </div>

                  {isLoadingDetails ? (
                    <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center space-y-2">
                      <Shield className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">এখনও কোনো দল নিবন্ধিত হয়নি</p>
                      <p className="text-xs text-slate-500">
                        টুর্নামেন্ট শুরু করতে কমপক্ষে ৩টি দল ও তাদের প্রতিটিতে ৫–৬ জন খেলোয়াড় নিবন্ধন করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teams.map((t) => {
                        const squadCount = t.playerIds?.length || 0;
                        const isFull = squadCount >= 5 && squadCount <= 6;
                        return (
                          <div
                            key={t._id}
                            className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4 hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: t.color || "#10b981" }}
                                />
                                <div>
                                  <h4 className="font-bold text-white text-sm">
                                    {t.name}
                                  </h4>
                                  {t.shortCode && (
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                      {t.shortCode}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setTeamToEdit(t);
                                    setIsTeamModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="সম্পাদনা"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(t._id, t.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Squad Status */}
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
                              <span className="text-slate-400">স্কোয়াড সংখ্যা:</span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                  isFull
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {toBnNum(squadCount)} / ৫–৬ জন
                              </span>
                            </div>

                            {/* Player Preview */}
                            <div className="text-xs space-y-1">
                              {t.players && t.players.length > 0 ? (
                                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                  {t.players.map((p) => (
                                    <div
                                      key={p._id}
                                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/60 text-slate-300 text-[11px]"
                                    >
                                      <span>{p.fullName}</span>
                                      <span className="font-mono text-slate-500">
                                        #{toBnNum(p.jerseyNumber)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px]">
                                  কোনো খেলোয়াড় অন্তর্ভুক্ত নেই
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Matches & Fixtures */}
              {managementTab === "matches" && (
                <div className="space-y-6">
                  {/* Round Filter & Matches count */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        ম্যাচ শিডিউল ও রেজাল্ট এন্ট্রি ({toBnNum(matches.length)})
                      </h3>
                      <p className="text-xs text-slate-400">
                        তারিখ/সময় নির্ধারণ করুন এবং খেলার শেষে স্কোর ও গোলদাতা রেকর্ড করুন।
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex overflow-x-auto gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setMatchRoundFilter("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          matchRoundFilter === "all"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        সব ম্যাচ
                      </button>

                      {availableRounds.map((r) => (
                        <button
                          key={r}
                          onClick={() => setMatchRoundFilter(String(r))}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            matchRoundFilter === String(r)
                              ? "bg-emerald-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {getBnRound(r)}
                        </button>
                      ))}

                      {hasFinalMatch && (
                        <button
                          onClick={() => setMatchRoundFilter("final")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            matchRoundFilter === "final"
                              ? "bg-emerald-500 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          গ্র্যান্ড ফাইনাল
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Odd-Team Bye Alert for Selected Round */}
                  {matchRoundFilter !== "all" &&
                    matchRoundFilter !== "final" &&
                    (() => {
                      const rNum = parseInt(matchRoundFilter, 10);
                      const roundMatches = matches.filter(
                        (m) => m.stage === "league" && m.round === rNum
                      );
                      if (roundMatches.length === 0) return null;
                      const playingIds = new Set(
                        roundMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId])
                      );
                      const byeTeam = teams.find((t) => !playingIds.has(t._id));
                      if (!byeTeam) return null;
                      return (
                        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center gap-2.5 text-xs text-cyan-300">
                          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>
                            এই রাউন্ডে বিরতি (Bye): <strong>{byeTeam.name}</strong>
                          </span>
                        </div>
                      );
                    })()}

                  {isLoadingDetails ? (
                    <div className="h-40 rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center space-y-2">
                      <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">কোনো ফিক্সচার তৈরি হয়নি</p>
                      <p className="text-xs text-slate-500">
                        কমপক্ষে ৩টি দল নিবন্ধিত হলে উপরের &quot;রাউন্ড-রবিন লিগ ফিক্সচার তৈরি করুন&quot; বাটনে ক্লিক করুন।
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMatches.map((m) => {
                        const home = teamsMap.get(m.homeTeamId);
                        const away = teamsMap.get(m.awayTeamId);
                        const isFinal = m.stage === "final";
                        const isCompleted = m.status === "completed";

                        return (
                          <div
                            key={m._id}
                            className={`p-5 rounded-2xl border transition-all space-y-4 ${
                              isFinal
                                ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 shadow-lg"
                                : "border-slate-800 bg-slate-950/60"
                            }`}
                          >
                            {/* Match Header */}
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-850 pb-2">
                              <span className="font-semibold text-slate-300">
                                {isFinal
                                  ? `গ্র্যান্ড ফাইনাল • ম্যাচ ${toBnNum(m.matchNumber)}`
                                  : `${getBnRound(m.round || 1)} • ম্যাচ ${toBnNum(m.matchNumber)}`}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${
                                  isCompleted
                                    ? "bg-slate-800 text-slate-300"
                                    : m.status === "live"
                                    ? "bg-rose-500/20 text-rose-400 animate-pulse"
                                    : "bg-blue-500/10 text-blue-400"
                                }`}
                              >
                                {getBnTournamentMatchStatus(m.status)}
                              </span>
                            </div>

                            {/* Teams & Score */}
                            <div className="grid grid-cols-7 items-center gap-2 py-1">
                              <div className="col-span-3 text-right">
                                <span className="font-bold text-white text-sm block truncate">
                                  {home?.name || "হোম দল"}
                                </span>
                                {home?.shortCode && (
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {home.shortCode}
                                  </span>
                                )}
                              </div>

                              <div className="col-span-1 text-center">
                                {isCompleted && m.result ? (
                                  <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-sm text-white">
                                    {toBnNum(m.result.homeScore)} - {toBnNum(m.result.awayScore)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 font-bold">
                                    VS
                                  </span>
                                )}
                              </div>

                              <div className="col-span-3 text-left">
                                <span className="font-bold text-white text-sm block truncate">
                                  {away?.name || "অ্যাওয়ে দল"}
                                </span>
                                {away?.shortCode && (
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {away.shortCode}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Date, Time & Venue */}
                            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-850">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>
                                  {m.matchDate ? formatBnDate(m.matchDate) : "তারিখ নির্ধারিত নয়"}
                                  {m.kickOffTime && ` • ${m.kickOffTime}`}
                                </span>
                              </div>

                              {m.venue && (
                                <span className="truncate max-w-[120px] text-slate-500">
                                  {m.venue}
                                </span>
                              )}
                            </div>

                            {/* Match Admin Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-850">
                              <button
                                onClick={() => {
                                  setMatchToSchedule(m);
                                  setIsScheduleModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
                              >
                                সময়সূচি ও ভেন্যু
                              </button>

                              <button
                                onClick={() => {
                                  setMatchToEnterResult(m);
                                  setIsResultModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                {isCompleted ? "ফলাফল পরিবর্তন" : "ফলাফল এন্ট্রি"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Standings */}
              {managementTab === "standings" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    লাইভ পয়েন্ট টেবিল
                  </h3>

                  {standings.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
                      কোনো ম্যাচ সম্পন্ন না হওয়ায় পয়েন্ট টেবিল এখনও শুরু হয়নি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950">
                            <th className="p-3 text-center w-12">স্থান</th>
                            <th className="p-3">দল</th>
                            <th className="p-3 text-center">ম্যাচ</th>
                            <th className="p-3 text-center text-emerald-400">জয়</th>
                            <th className="p-3 text-center text-amber-400">ড্র</th>
                            <th className="p-3 text-center text-rose-400">হার</th>
                            <th className="p-3 text-center">GF</th>
                            <th className="p-3 text-center">GA</th>
                            <th className="p-3 text-center">GD</th>
                            <th className="p-3 text-center font-bold text-white">পয়েন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {standings.map((st) => (
                            <tr key={st.teamId} className="hover:bg-slate-900/60">
                              <td className="p-3 text-center font-bold">
                                {toBnNum(st.rank)}
                              </td>
                              <td className="p-3 font-semibold text-white">
                                {st.teamName}
                              </td>
                              <td className="p-3 text-center font-mono">{toBnNum(st.played)}</td>
                              <td className="p-3 text-center font-mono text-emerald-400">{toBnNum(st.won)}</td>
                              <td className="p-3 text-center font-mono text-amber-400">{toBnNum(st.drawn)}</td>
                              <td className="p-3 text-center font-mono text-rose-400">{toBnNum(st.lost)}</td>
                              <td className="p-3 text-center font-mono">{toBnNum(st.goalsFor)}</td>
                              <td className="p-3 text-center font-mono">{toBnNum(st.goalsAgainst)}</td>
                              <td className="p-3 text-center font-mono">
                                {st.goalDifference > 0 ? "+" : ""}
                                {toBnNum(st.goalDifference)}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-white text-sm">
                                {toBnNum(st.points)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 4: Golden Boot */}
              {managementTab === "goldenBoot" && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    গোল্ডেন বুট লিডারবোর্ড
                  </h3>

                  {goldenBoot.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
                      এখনও কোনো খেলোয়াড় গোল করেননি।
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950">
                            <th className="p-3 text-center w-12">স্থান</th>
                            <th className="p-3">খেলোয়াড়</th>
                            <th className="p-3">দল</th>
                            <th className="p-3">পজিশন</th>
                            <th className="p-3 text-center font-bold text-amber-400">মোট গোল</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {goldenBoot.map((gb) => (
                            <tr key={gb.playerId} className="hover:bg-slate-900/60">
                              <td className="p-3 text-center font-bold font-mono">
                                {toBnNum(gb.rank)}
                              </td>
                              <td className="p-3 font-semibold text-white">
                                {gb.playerFullName}
                              </td>
                              <td className="p-3 text-slate-300">{gb.teamName}</td>
                              <td className="p-3 text-slate-400">{getBnPosition(gb.position)}</td>
                              <td className="p-3 text-center font-mono font-bold text-amber-400 text-sm">
                                {toBnNum(gb.goalsCount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODALS */}
        {/* ======================================================== */}
        {/* Tournament Form Modal */}
        <TournamentFormModal
          isOpen={isTournamentFormOpen}
          onClose={() => setIsTournamentFormOpen(false)}
          tournamentToEdit={tournamentToEdit}
          onSuccess={(saved, msg) => {
            setNotification({ type: "success", message: msg });
            loadTournaments();
            setSelectedTournament(saved);
          }}
        />

        {/* Delete / Cancel Tournament Modal */}
        <DeleteTournamentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          tournament={tournamentToDelete}
          onSuccess={(msg) => {
            setNotification({ type: "success", message: msg });
            setSelectedTournament(null);
            loadTournaments();
          }}
        />

        {/* Team Register / Edit Modal */}
        {selectedTournament && (
          <TournamentTeamModal
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
            tournamentId={selectedTournament._id}
            teamToEdit={teamToEdit}
            existingTeams={teams}
            onSuccess={(_saved, msg) => {
              setNotification({ type: "success", message: msg });
              loadTournaments();
              loadTournamentDetails(selectedTournament._id);
            }}
          />
        )}

        {/* Match Schedule Modal */}
        {selectedTournament && matchToSchedule && (
          <TournamentMatchScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setMatchToSchedule(null);
            }}
            tournamentId={selectedTournament._id}
            match={matchToSchedule}
            homeTeam={teamsMap.get(matchToSchedule.homeTeamId)}
            awayTeam={teamsMap.get(matchToSchedule.awayTeamId)}
            onSuccess={(_saved, msg) => {
              setNotification({ type: "success", message: msg });
              loadTournamentDetails(selectedTournament._id);
            }}
          />
        )}

        {/* Match Result Modal */}
        {selectedTournament && matchToEnterResult && (
          <TournamentMatchResultModal
            isOpen={isResultModalOpen}
            onClose={() => {
              setIsResultModalOpen(false);
              setMatchToEnterResult(null);
            }}
            tournamentId={selectedTournament._id}
            match={matchToEnterResult}
            homeTeam={teamsMap.get(matchToEnterResult.homeTeamId)}
            awayTeam={teamsMap.get(matchToEnterResult.awayTeamId)}
            playersMap={playersMap}
            onSuccess={(_saved, msg) => {
              setNotification({ type: "success", message: msg });
              loadTournaments();
              loadTournamentDetails(selectedTournament._id);
            }}
          />
        )}
      </AdminDashboardShell>
    </AdminGuard>
  );
}
