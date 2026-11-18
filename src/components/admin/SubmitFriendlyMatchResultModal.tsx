"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Minus,
  Flame,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  apiClient,
  FriendlySeriesDocument,
  FriendlySeriesMatchDocument,
  FriendlySeriesStats,
  FriendlyTeamSummary,
  FriendlyMatchGoalEvent,
  FriendlyGoalType,
  FriendlySeriesTeamPlayersResponse,
  SubmitFriendlyMatchResultInput,
} from "../../lib/api-client";
import { toBnNum } from "../../lib/bn-utils";

interface SubmitFriendlyMatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: FriendlySeriesDocument;
  match: FriendlySeriesMatchDocument;
  homeTeam?: FriendlyTeamSummary;
  awayTeam?: FriendlyTeamSummary;
  onSuccess: (
    data: {
      match: FriendlySeriesMatchDocument;
      stats: FriendlySeriesStats;
    },
    message: string
  ) => void;
}

function SubmitFriendlyMatchResultInner({
  series,
  match,
  homeTeam,
  awayTeam,
  onClose,
  onSuccess,
}: {
  series: FriendlySeriesDocument;
  match: FriendlySeriesMatchDocument;
  homeTeam?: FriendlyTeamSummary;
  awayTeam?: FriendlyTeamSummary;
  onClose: () => void;
  onSuccess: (
    data: {
      match: FriendlySeriesMatchDocument;
      stats: FriendlySeriesStats;
    },
    message: string
  ) => void;
}) {
  const isCorrection = match.status === "completed" && match.result !== undefined;

  const [homeScore, setHomeScore] = useState<number>(
    match.result?.homeScore ?? 0
  );
  const [awayScore, setAwayScore] = useState<number>(
    match.result?.awayScore ?? 0
  );
  const [notes, setNotes] = useState<string>(match.result?.notes ?? "");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [goals, setGoals] = useState<FriendlyMatchGoalEvent[]>(() => {
    const existingGoals = match.result?.goals || match.goals || [];
    return Array.isArray(existingGoals)
      ? existingGoals.map((g) => ({
          teamId: String(g.teamId),
          playerId: String(g.playerId),
          type: (g.type || "normal") as FriendlyGoalType,
          minute: g.minute,
        }))
      : [];
  });

  const [playersData, setPlayersData] =
    useState<FriendlySeriesTeamPlayersResponse | null>(null);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load team rosters for goal scorer selection
  useEffect(() => {
    let isMounted = true;
    apiClient.friendlySeries
      .getPlayers(series._id)
      .then((res) => {
        if (isMounted && res.data) {
          setPlayersData(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load series players:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlayers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [series._id]);

  const homePlayers = useMemo(() => {
    if (!playersData || !homeTeam) return [];
    const homeTeamIdStr = String(homeTeam._id);
    if (String(playersData.teamA._id) === homeTeamIdStr) {
      return playersData.teamA.players || [];
    }
    if (String(playersData.teamB._id) === homeTeamIdStr) {
      return playersData.teamB.players || [];
    }
    return [];
  }, [playersData, homeTeam]);

  const awayPlayers = useMemo(() => {
    if (!playersData || !awayTeam) return [];
    const awayTeamIdStr = String(awayTeam._id);
    if (String(playersData.teamA._id) === awayTeamIdStr) {
      return playersData.teamA.players || [];
    }
    if (String(playersData.teamB._id) === awayTeamIdStr) {
      return playersData.teamB.players || [];
    }
    return [];
  }, [playersData, awayTeam]);

  const homeTeamId = homeTeam?._id || "";
  const awayTeamId = awayTeam?._id || "";

  const homeGoalsCount = goals.filter((g) => g.teamId === homeTeamId).length;
  const awayGoalsCount = goals.filter((g) => g.teamId === awayTeamId).length;

  const isDraw = homeScore === awayScore;
  const winnerTeam =
    homeScore > awayScore ? homeTeam : awayScore > homeScore ? awayTeam : null;

  const addGoal = (beneficiaryTeamId: string) => {
    const isCreditedHome = beneficiaryTeamId === homeTeamId;
    const defaultPlayer = isCreditedHome
      ? homePlayers[0]?._id || ""
      : awayPlayers[0]?._id || "";

    setGoals((prev) => [
      ...prev,
      {
        teamId: beneficiaryTeamId,
        playerId: defaultPlayer,
        minute: undefined,
        type: "normal",
      },
    ]);
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateGoal = (
    index: number,
    updates: Partial<FriendlyMatchGoalEvent>
  ) => {
    setGoals((prev) =>
      prev.map((g, idx) => {
        if (idx !== index) return g;
        const updated = { ...g, ...updates };

        if (updates.type && updates.type !== g.type) {
          const isCreditedHome = updated.teamId === homeTeamId;
          if (updates.type === "own_goal") {
            updated.playerId = isCreditedHome
              ? awayPlayers[0]?._id || ""
              : homePlayers[0]?._id || "";
          } else {
            updated.playerId = isCreditedHome
              ? homePlayers[0]?._id || ""
              : awayPlayers[0]?._id || "";
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (homeScore < 0 || awayScore < 0) {
      setError("স্কোর ঋণাত্মক হতে পারে না।");
      return;
    }

    if (homeGoalsCount !== homeScore) {
      setError(
        `হোম দলের স্কোর (${toBnNum(homeScore)}) এবং নথিভুক্ত গোল সংখ্যা (${toBnNum(
          homeGoalsCount
        )}) মিলছে না। গোলদাতার তালিকা সংশোধন করুন।`
      );
      return;
    }

    if (awayGoalsCount !== awayScore) {
      setError(
        `অ্যাওয়ে দলের স্কোর (${toBnNum(awayScore)}) এবং নথিভুক্ত গোল সংখ্যা (${toBnNum(
          awayGoalsCount
        )}) মিলছে না। গোলদাতার তালিকা সংশোধন করুন।`
      );
      return;
    }

    for (let i = 0; i < goals.length; i++) {
      const g = goals[i];
      if (!g.playerId) {
        setError(`গোল #${toBnNum(i + 1)}-এ কোনো খেলোয়াড় নির্বাচন করা হয়নি।`);
        return;
      }
      if (g.minute !== undefined && (g.minute < 1 || g.minute > 120)) {
        setError(`গোল #${toBnNum(i + 1)}-এর মিনিট ১ থেকে ১২০-এর মধ্যে হতে হবে।`);
        return;
      }
    }

    if (!isConfirmed) {
      setError("ফলাফল সংরক্ষণের পূর্বে নিশ্চিতকরণ চেকবক্সে টিক দিন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SubmitFriendlyMatchResultInput = {
        homeScore,
        awayScore,
        notes: notes.trim() || undefined,
        goals: goals.map((g) => ({
          playerId: g.playerId,
          teamId: g.teamId,
          type: g.type,
          minute: g.minute ? Number(g.minute) : undefined,
        })),
      };

      const res = isCorrection
        ? await apiClient.friendlySeries.correctMatchResult(
            series._id,
            match._id,
            payload
          )
        : await apiClient.friendlySeries.submitMatchResult(
            series._id,
            match._id,
            payload
          );

      if (res.data) {
        onSuccess(
          res.data,
          isCorrection
            ? `ম্যাচ #${toBnNum(
                match.matchNumber
              )}-এর ফলাফল ও গোল তালিকা সফলভাবে সংশোধন করা হয়েছে এবং সিরিজ স্কোরবোর্ড পুনর্গণনা করা হয়েছে।`
            : `ম্যাচ #${toBnNum(
                match.matchNumber
              )}-এর ফলাফল ও গোল তালিকা সফলভাবে নথিভুক্ত করা হয়েছে!`
        );
        onClose();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "ফলাফল সংরক্ষণ করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isCorrection
                  ? "ম্যাচ ফলাফল ও গোলদাতা সংশোধন"
                  : "ম্যাচ ফলাফল ও গোলদাতা এন্ট্রি"}
              </h2>
              <p className="text-xs text-slate-400">
                {series.name} • ম্যাচ #{toBnNum(match.matchNumber)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Score Entry Board */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="grid grid-cols-7 items-center gap-3 text-center">
              {/* Home Team */}
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: homeTeam?.color || "#10b981" }}
                  />
                  <span className="font-bold text-sm text-white truncate max-w-[140px]">
                    {homeTeam?.name || "হোম দল"}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <label className="text-xs text-slate-400">স্কোর:</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={homeScore}
                    onChange={(e) =>
                      setHomeScore(
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    className="w-16 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="text-[11px]">
                  <span
                    className={
                      homeGoalsCount === homeScore
                        ? "text-emerald-400 font-medium"
                        : "text-amber-400 font-bold"
                    }
                  >
                    গোল নথিভুক্ত: {toBnNum(homeGoalsCount)} / {toBnNum(homeScore)}
                  </span>
                </div>
              </div>

              {/* VS */}
              <div className="col-span-1 text-slate-500 font-black text-sm">
                VS
              </div>

              {/* Away Team */}
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: awayTeam?.color || "#3b82f6" }}
                  />
                  <span className="font-bold text-sm text-white truncate max-w-[140px]">
                    {awayTeam?.name || "অ্যাওয়ে দল"}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <label className="text-xs text-slate-400">স্কোর:</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={awayScore}
                    onChange={(e) =>
                      setAwayScore(
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    className="w-16 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="text-[11px]">
                  <span
                    className={
                      awayGoalsCount === awayScore
                        ? "text-emerald-400 font-medium"
                        : "text-amber-400 font-bold"
                    }
                  >
                    গোল নথিভুক্ত: {toBnNum(awayGoalsCount)} / {toBnNum(awayScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Preview Callout */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-center gap-2">
            {isDraw ? (
              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Minus className="w-4 h-4 stroke-[3]" />
                <span>
                  ম্যাচ ফলাফল ড্র ({toBnNum(homeScore)} - {toBnNum(awayScore)}) •
                  উভয় দলের জয়ে যুক্ত হবে না।
                </span>
              </div>
            ) : winnerTeam ? (
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  ম্যাচ বিজয়ী: {winnerTeam.name} (
                  {toBnNum(Math.max(homeScore, awayScore))} -{" "}
                  {toBnNum(Math.min(homeScore, awayScore))})
                </span>
              </div>
            ) : null}
          </div>

          {/* ======================================================== */}
          {/* GOAL SCORERS SECTION */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  ম্যাচের গোল ও স্কোরার তালিকা
                </h3>
                <p className="text-xs text-slate-400">
                  সিরিজ টপ স্কোরার লিডারবোর্ডের জন্য প্রতিটি গোলের স্কোরার ও মিনিট নির্বাচন করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addGoal(homeTeamId)}
                  disabled={homeGoalsCount >= homeScore || !homeTeamId}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {homeTeam?.shortCode || homeTeam?.name || "হোম"}-এ গোল যোগ
                </button>

                <button
                  type="button"
                  onClick={() => addGoal(awayTeamId)}
                  disabled={awayGoalsCount >= awayScore || !awayTeamId}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {awayTeam?.shortCode || awayTeam?.name || "অ্যাওয়ে"}-এ গোল যোগ
                </button>
              </div>
            </div>

            {isLoadingPlayers ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Users className="w-4 h-4 animate-spin text-emerald-400" />
                <span>প্লেয়ার রোস্টার লোড হচ্ছে...</span>
              </div>
            ) : goals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                কোনো গোল যুক্ত করা হয়নি। (০-০ ড্র হলে গোল তালিকা ফাঁকা থাকবে)
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, idx) => {
                  const isCreditedHome = goal.teamId === homeTeamId;
                  const creditedTeam = isCreditedHome ? homeTeam : awayTeam;
                  const eligiblePlayers =
                    goal.type === "own_goal"
                      ? isCreditedHome
                        ? awayPlayers
                        : homePlayers
                      : isCreditedHome
                      ? homePlayers
                      : awayPlayers;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-2.5 text-xs"
                    >
                      {/* Beneficiary Team Tag */}
                      <span
                        className="px-2.5 py-1.5 rounded-xl font-bold flex-shrink-0 text-white flex items-center gap-1.5 min-w-[100px]"
                        style={{
                          backgroundColor: `${
                            creditedTeam?.color || "#10b981"
                          }25`,
                          border: `1px solid ${
                            creditedTeam?.color || "#10b981"
                          }60`,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              creditedTeam?.color || "#10b981",
                          }}
                        />
                        <span className="truncate">
                          {creditedTeam?.shortCode ||
                            creditedTeam?.name ||
                            "দল"}
                        </span>
                      </span>

                      {/* Goal Type Selector (Normal vs Own Goal) */}
                      <div className="w-28 flex-shrink-0">
                        <select
                          value={goal.type}
                          onChange={(e) =>
                            updateGoal(idx, {
                              type: e.target.value as FriendlyGoalType,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                        >
                          <option value="normal">সাধারণ গোল</option>
                          <option value="own_goal">ওন গোল (OG)</option>
                        </select>
                      </div>

                      {/* Player Selector */}
                      <div className="flex-1 min-w-[160px]">
                        <select
                          value={goal.playerId}
                          onChange={(e) =>
                            updateGoal(idx, { playerId: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">-- গোলদাতা নির্বাচন --</option>
                          {eligiblePlayers.map((p) => (
                            <option key={p._id} value={p._id}>
                              #{toBnNum(p.jerseyNumber)} {p.fullName} (
                              {p.position})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Minute Input */}
                      <div className="w-20 flex-shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          placeholder="মিনিট"
                          value={goal.minute ?? ""}
                          onChange={(e) =>
                            updateGoal(idx, {
                              minute: e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-center text-xs font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeGoal(idx)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
                        title="গোল মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ম্যাচ মন্তব্য / বিশেষ নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="উদা: চমৎকার প্রতিদ্বন্দ্বিতাপূর্ণ ম্যাচ..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Required Confirmation Checkbox */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                required
              />
              <span>
                আমি নিশ্চিত করছি যে প্রদত্ত স্কোর ({toBnNum(homeScore)} -{" "}
                {toBnNum(awayScore)}) এবং গোলদাতার তথ্য সঠিক। এর ভিত্তিতে সিরিজ
                ফলাফল, চ্যাম্পিয়ন স্ট্যাটাস এবং টপ স্কোরার তালিকা স্বয়ংক্রিয়ভাবে
                হালনাগাদ হবে।
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConfirmed}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "সংরক্ষণ হচ্ছে..."
                : isCorrection
                ? "সংশোধন নিশ্চিত করুন"
                : "ফলাফল নিশ্চিত করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubmitFriendlyMatchResultModal({
  isOpen,
  onClose,
  series,
  match,
  homeTeam,
  awayTeam,
  onSuccess,
}: SubmitFriendlyMatchResultModalProps) {
  if (!isOpen || !match) return null;

  return (
    <SubmitFriendlyMatchResultInner
      key={match._id}
      series={series}
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
