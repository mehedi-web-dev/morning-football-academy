"use client";

import { useState, useMemo } from "react";
import {
  X,
  Trophy,
  Flame,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  apiClient,
  TournamentMatchDocument,
  TournamentTeamDocument,
  PlayerDocument,
  SubmitTournamentMatchResultInput,
  GoalType,
} from "../../lib/api-client";
import { toBnNum, getBnRound } from "../../lib/bn-utils";

interface TournamentMatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  match: TournamentMatchDocument | null;
  homeTeam?: TournamentTeamDocument;
  awayTeam?: TournamentTeamDocument;
  playersMap: Map<string, PlayerDocument>;
  onSuccess: (updatedMatch: TournamentMatchDocument, message: string) => void;
}

interface LocalGoal {
  teamId: string;
  playerId: string;
  minute?: number;
  type: GoalType;
}

function TournamentMatchResultInner({
  tournamentId,
  match,
  homeTeam,
  awayTeam,
  playersMap,
  onClose,
  onSuccess,
}: {
  tournamentId: string;
  match: TournamentMatchDocument;
  homeTeam: TournamentTeamDocument;
  awayTeam: TournamentTeamDocument;
  playersMap: Map<string, PlayerDocument>;
  onClose: () => void;
  onSuccess: (updatedMatch: TournamentMatchDocument, message: string) => void;
}) {
  const isFinal = match.stage === "final";

  const [homeScore, setHomeScore] = useState<number>(match.result?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.result?.awayScore ?? 0);

  const [wentToExtraTime, setWentToExtraTime] = useState(
    Boolean(match.result?.wentToExtraTime)
  );
  const [wentToPenalties, setWentToPenalties] = useState(
    Boolean(match.result?.wentToPenalties)
  );
  const [homePenaltyScore, setHomePenaltyScore] = useState<number>(
    match.result?.homePenaltyScore ?? 0
  );
  const [awayPenaltyScore, setAwayPenaltyScore] = useState<number>(
    match.result?.awayPenaltyScore ?? 0
  );
  const [winnerTeamId] = useState<string>(match.result?.winnerTeamId || "");

  const [goals, setGoals] = useState<LocalGoal[]>(
    Array.isArray(match.goals) && match.goals.length > 0
      ? match.goals.map((g) => ({
          teamId: g.teamId,
          playerId: g.playerId,
          minute: g.minute,
          type: g.type,
        }))
      : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homePlayers = useMemo(() => {
    if (!homeTeam || !homeTeam.playerIds) return [];
    return homeTeam.playerIds
      .map((id) => playersMap.get(id))
      .filter((p): p is PlayerDocument => Boolean(p));
  }, [homeTeam, playersMap]);

  const awayPlayers = useMemo(() => {
    if (!awayTeam || !awayTeam.playerIds) return [];
    return awayTeam.playerIds
      .map((id) => playersMap.get(id))
      .filter((p): p is PlayerDocument => Boolean(p));
  }, [awayTeam, playersMap]);

  const homeGoalsCount = goals.filter((g) => g.teamId === homeTeam._id).length;
  const awayGoalsCount = goals.filter((g) => g.teamId === awayTeam._id).length;

  const addGoal = (teamId: string) => {
    const isHome = teamId === homeTeam._id;
    const defaultPlayer = isHome
      ? homePlayers[0]?._id || ""
      : awayPlayers[0]?._id || "";

    setGoals((prev) => [
      ...prev,
      {
        teamId,
        playerId: defaultPlayer,
        minute: undefined,
        type: "regular",
      },
    ]);
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateGoal = (index: number, updates: Partial<LocalGoal>) => {
    setGoals((prev) =>
      prev.map((g, idx) => {
        if (idx !== index) return g;
        const updated = { ...g, ...updates };

        if (updates.type && updates.type !== g.type) {
          const isCreditedHome = updated.teamId === homeTeam._id;
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

    if (homeGoalsCount !== homeScore) {
      setError(
        `হোম দলের স্কোর (${toBnNum(homeScore)}) এবং নথিভুক্ত গোল সংখ্যা (${toBnNum(
          homeGoalsCount
        )}) মিলছে না। গোল তালিকা ঠিক করুন।`
      );
      return;
    }

    if (awayGoalsCount !== awayScore) {
      setError(
        `অ্যাওয়ে দলের স্কোর (${toBnNum(awayScore)}) এবং নথিভুক্ত গোল সংখ্যা (${toBnNum(
          awayGoalsCount
        )}) মিলছে না। গোল তালিকা ঠিক করুন।`
      );
      return;
    }

    for (let i = 0; i < goals.length; i++) {
      if (!goals[i].playerId) {
        setError(`গোল #${toBnNum(i + 1)}-এ কোনো খেলোয়াড় নির্বাচন করা হয়নি।`);
        return;
      }
    }

    if (isFinal) {
      const isDraw = homeScore === awayScore;
      if (isDraw && !wentToPenalties) {
        setError(
          "গ্র্যান্ড ফাইনালে ম্যাচ ড্র হতে পারে না। স্কোর সমতা হলে পেনাল্টি শুটআউট নির্বাচন করুন।"
        );
        return;
      }

      if (wentToPenalties) {
        if (homePenaltyScore === awayPenaltyScore) {
          setError("পেনাল্টি শুটআউটে দুই দলের স্কোর সমান হতে পারে না; একজন বিজয়ী হতে হবে।");
          return;
        }
      }

      let determinedWinner = winnerTeamId;
      if (!determinedWinner) {
        if (homeScore > awayScore) {
          determinedWinner = homeTeam._id;
        } else if (awayScore > homeScore) {
          determinedWinner = awayTeam._id;
        } else if (wentToPenalties) {
          determinedWinner =
            homePenaltyScore > awayPenaltyScore ? homeTeam._id : awayTeam._id;
        }
      }

      if (!determinedWinner) {
        setError("গ্র্যান্ড ফাইনালে বিজয়ী দল নির্বাচন করা আবশ্যক।");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload: SubmitTournamentMatchResultInput = {
        stage: match.stage,
        homeScore,
        awayScore,
        wentToExtraTime,
        wentToPenalties,
        homePenaltyScore: wentToPenalties ? homePenaltyScore : undefined,
        awayPenaltyScore: wentToPenalties ? awayPenaltyScore : undefined,
        winnerTeamId:
          isFinal
            ? homeScore > awayScore
              ? homeTeam._id
              : awayScore > homeScore
              ? awayTeam._id
              : wentToPenalties
              ? homePenaltyScore > awayPenaltyScore
                ? homeTeam._id
                : awayTeam._id
              : winnerTeamId || null
            : homeScore > awayScore
            ? homeTeam._id
            : awayScore > homeScore
            ? awayTeam._id
            : null,
        goals: goals.map((g) => ({
          teamId: g.teamId,
          playerId: g.playerId,
          minute: g.minute,
          type: g.type,
        })),
      };

      const res = await apiClient.tournaments.submitResult(
        tournamentId,
        match._id,
        payload
      );

      if (res.data) {
        onSuccess(
          res.data,
          isFinal
            ? "গ্র্যান্ড ফাইনালের ফলাফল ও চ্যাম্পিয়ন সফলভাবে রেকর্ড করা হয়েছে!"
            : "ম্যাচের ফলাফল ও গোল্ডেন বুট ডাটা সফলভাবে সংরক্ষিত হয়েছে।"
        );
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ফলাফল সংরক্ষণ করতে ব্যর্থ হয়েছে।";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isFinal ? "গ্র্যান্ড ফাইনাল ফলাফল ও ট্রফি" : "ম্যাচ ফলাফল ও গোল এন্ট্রি"}
              </h2>
              <p className="text-xs text-slate-400">
                {isFinal
                  ? `গ্র্যান্ড ফাইনাল • ম্যাচ ${toBnNum(match.matchNumber)} (চ্যাম্পিয়ন নির্ধারণ)`
                  : `${getBnRound(match.round || 1)} • ম্যাচ ${toBnNum(match.matchNumber)}`}
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
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm flex-shrink-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="grid grid-cols-7 items-center gap-3 text-center">
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: homeTeam.color || "#10b981" }}
                  />
                  <span className="font-bold text-sm sm:text-base text-white">
                    {homeTeam.name}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <label className="text-xs text-slate-400">স্কোর:</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
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

              <div className="col-span-1 text-slate-500 font-black text-sm">VS</div>

              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: awayTeam.color || "#3b82f6" }}
                  />
                  <span className="font-bold text-sm sm:text-base text-white">
                    {awayTeam.name}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <label className="text-xs text-slate-400">স্কোর:</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
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

          {isFinal && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                গ্র্যান্ড ফাইনাল অতিরিক্ত নিয়মাবলী
              </span>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wentToExtraTime}
                    onChange={(e) => setWentToExtraTime(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  অতিরিক্ত সময় অনুষ্ঠিত হয়েছে
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wentToPenalties}
                    onChange={(e) => {
                      setWentToPenalties(e.target.checked);
                      if (e.target.checked) setWentToExtraTime(true);
                    }}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  টাইব্রেকার (পেনাল্টি শুটআউট)
                </label>
              </div>

              {wentToPenalties && (
                <div className="pt-2 border-t border-amber-500/20 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {homeTeam.name} পেনাল্টি স্কোর:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={homePenaltyScore}
                      onChange={(e) => setHomePenaltyScore(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {awayTeam.name} পেনাল্টি স্কোর:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={awayPenaltyScore}
                      onChange={(e) => setAwayPenaltyScore(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center font-bold text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  ম্যাচের গোল ও স্কোরার তালিকা
                </h3>
                <p className="text-xs text-slate-400">
                  গোল্ডেন বুট লিডারবোর্ডের জন্য প্রতিটি গোলদাতার নাম ও মিনিট রেকর্ড করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addGoal(homeTeam._id)}
                  disabled={homeGoalsCount >= homeScore}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {homeTeam.shortCode || homeTeam.name}-এ গোল যোগ
                </button>

                <button
                  type="button"
                  onClick={() => addGoal(awayTeam._id)}
                  disabled={awayGoalsCount >= awayScore}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {awayTeam.shortCode || awayTeam.name}-এ গোল যোগ
                </button>
              </div>
            </div>

            {goals.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                কোনো গোল যুক্ত করা হয়নি। (০-০ ড্র হলে গোল তালিকা ফাঁকা থাকবে)
              </div>
            ) : (
              <div className="space-y-2.5">
                {goals.map((goal, idx) => {
                  const isCreditedHome = goal.teamId === homeTeam._id;
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
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs"
                    >
                      <span
                        className="px-2.5 py-1 rounded-lg font-bold flex-shrink-0 text-white flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${creditedTeam.color || "#10b981"}33`,
                          border: `1px solid ${creditedTeam.color || "#10b981"}60`,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: creditedTeam.color || "#10b981" }}
                        />
                        {creditedTeam.shortCode || creditedTeam.name}
                      </span>

                      <div className="flex-1 min-w-[160px]">
                        <select
                          value={goal.playerId}
                          onChange={(e) => updateGoal(idx, { playerId: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">-- খেলোয়াড় নির্বাচন করুন --</option>
                          {eligiblePlayers.map((p) => (
                            <option key={p._id} value={p._id}>
                              #{p.jerseyNumber} {p.fullName} ({p.position})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          max="130"
                          placeholder="মিনিট"
                          value={goal.minute ?? ""}
                          onChange={(e) =>
                            updateGoal(idx, {
                              minute: e.target.value ? parseInt(e.target.value) : undefined,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-white text-xs"
                        />
                      </div>

                      <div className="w-28">
                        <select
                          value={goal.type}
                          onChange={(e) =>
                            updateGoal(idx, { type: e.target.value as GoalType })
                          }
                          className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs cursor-pointer"
                        >
                          <option value="regular">নরমাল গোল</option>
                          <option value="extra_time">অতিরিক্ত সময়</option>
                          <option value="own_goal">ওন গোল</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGoal(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              disabled={
                isSubmitting ||
                homeGoalsCount !== homeScore ||
                awayGoalsCount !== awayScore
              }
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "ফলাফল নিশ্চিত করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentMatchResultModal({
  isOpen,
  onClose,
  tournamentId,
  match,
  homeTeam,
  awayTeam,
  playersMap,
  onSuccess,
}: TournamentMatchResultModalProps) {
  if (!isOpen || !match || !homeTeam || !awayTeam) return null;

  return (
    <TournamentMatchResultInner
      key={match._id}
      tournamentId={tournamentId}
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      playersMap={playersMap}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
