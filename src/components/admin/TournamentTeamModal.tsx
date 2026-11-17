"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Shield,
  Search,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  apiClient,
  TournamentTeamDocument,
  RegisterTournamentTeamInput,
  UpdateTournamentTeamInput,
  PlayerDocument,
} from "../../lib/api-client";
import { toBnNum, getBnPosition } from "../../lib/bn-utils";

interface TournamentTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  teamToEdit: TournamentTeamDocument | null;
  existingTeams: TournamentTeamDocument[];
  onSuccess: (savedTeam: TournamentTeamDocument, message: string) => void;
}

const COLOR_PRESETS = [
  { name: "সবুজ (Emerald)", hex: "#10b981" },
  { name: "নীল (Blue)", hex: "#3b82f6" },
  { name: "লাল (Crimson)", hex: "#ef4444" },
  { name: "হলুদ/সোনালী (Amber)", hex: "#f59e0b" },
  { name: "বেগুনী (Purple)", hex: "#8b5cf6" },
  { name: "আকাশি (Cyan)", hex: "#06b6d4" },
  { name: "কমলা (Orange)", hex: "#f97316" },
  { name: "গোলাপী (Rose)", hex: "#f43f5e" },
];

function TournamentTeamInner({
  tournamentId,
  teamToEdit,
  existingTeams,
  onClose,
  onSuccess,
}: {
  tournamentId: string;
  teamToEdit: TournamentTeamDocument | null;
  existingTeams: TournamentTeamDocument[];
  onClose: () => void;
  onSuccess: (savedTeam: TournamentTeamDocument, message: string) => void;
}) {
  const isEditing = Boolean(teamToEdit);

  const [name, setName] = useState(teamToEdit?.name ?? "");
  const [shortCode, setShortCode] = useState(teamToEdit?.shortCode ?? "");
  const [color, setColor] = useState(
    teamToEdit?.color ??
      COLOR_PRESETS[existingTeams.length % COLOR_PRESETS.length].hex
  );
  const [logo, setLogo] = useState(teamToEdit?.logo ?? "");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    teamToEdit?.playerIds ?? []
  );

  const [availablePlayers, setAvailablePlayers] = useState<PlayerDocument[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all active & eligible academy players across all pagination pages
  useEffect(() => {
    let isMounted = true;
    apiClient.players
      .getAllActive()
      .then((players) => {
        if (isMounted) {
          setAvailablePlayers(players);
          setIsLoadingPlayers(false);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load active players:", err);
        if (isMounted) {
          setError("সক্রিয় খেলোয়াড়দের তালিকা লোড করতে সমস্যা হয়েছে।");
          setIsLoadingPlayers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const otherTeamAssignedPlayerIds = useMemo(() => {
    const set = new Set<string>();
    existingTeams.forEach((t) => {
      if (isEditing && teamToEdit && t._id === teamToEdit._id) {
        return;
      }
      if (Array.isArray(t.playerIds)) {
        t.playerIds.forEach((pid) => set.add(pid));
      }
    });
    return set;
  }, [existingTeams, isEditing, teamToEdit]);

  // Robust search supporting full name, slug, position, and jersey number (Arabic & Bengali)
  const filteredPlayers = useMemo(() => {
    if (!playerSearch.trim()) return availablePlayers;
    const q = playerSearch.toLowerCase().trim();
    return availablePlayers.filter((p) => {
      const matchName = p.fullName ? p.fullName.toLowerCase().includes(q) : false;
      const matchSlug = p.slug ? p.slug.toLowerCase().includes(q) : false;
      const matchPos = p.position ? p.position.toLowerCase().includes(q) : false;
      const matchBnPos = p.position ? getBnPosition(p.position).toLowerCase().includes(q) : false;
      const jerseyStr =
        p.jerseyNumber !== undefined && p.jerseyNumber !== null
          ? String(p.jerseyNumber)
          : "";
      const matchJersey =
        jerseyStr.includes(q) || (jerseyStr ? toBnNum(p.jerseyNumber).includes(q) : false);
      return matchName || matchSlug || matchPos || matchBnPos || matchJersey;
    });
  }, [availablePlayers, playerSearch]);

  const togglePlayer = (playerId: string) => {
    if (otherTeamAssignedPlayerIds.has(playerId)) return;

    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else {
        if (prev.length >= 6) {
          setError("সর্বোচ্চ ৬ জন খেলোয়াড় নির্বাচন করা যাবে।");
          return prev;
        }
        setError(null);
        return [...prev, playerId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("দলের নাম আবশ্যক।");
      return;
    }

    if (selectedPlayerIds.length < 5 || selectedPlayerIds.length > 6) {
      setError(
        `প্রতি দলে কমপক্ষে ৫ এবং সর্বোচ্চ ৬ জন খেলোয়াড় নির্বাচন করতে হবে। বর্তমানে ${toBnNum(
          selectedPlayerIds.length
        )} জন নির্বাচিত রয়েছে।`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && teamToEdit) {
        const updatePayload: UpdateTournamentTeamInput = {
          name: name.trim(),
          shortCode: shortCode.trim().toUpperCase() || undefined,
          color: color.trim() || undefined,
          logo: logo.trim() || undefined,
          playerIds: selectedPlayerIds,
        };

        const res = await apiClient.tournaments.updateTeam(teamToEdit._id, updatePayload);
        if (res.data) {
          onSuccess(res.data, "দলের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।");
          onClose();
        }
      } else {
        const registerPayload: RegisterTournamentTeamInput = {
          name: name.trim(),
          shortCode: shortCode.trim().toUpperCase() || undefined,
          color: color.trim() || undefined,
          logo: logo.trim() || undefined,
          playerIds: selectedPlayerIds,
        };

        const res = await apiClient.tournaments.registerTeam(tournamentId, registerPayload);
        if (res.data) {
          onSuccess(res.data, "নতুন দল সফলভাবে টুর্নামেন্টে নিবন্ধিত হয়েছে।");
          onClose();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "দল সংরক্ষণ করতে সমস্যা হয়েছে।";
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
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${color}25`, border: `1px solid ${color}60` }}
            >
              <Shield className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "দল ও স্কোয়াড সম্পাদনা" : "টুর্নামেন্টে নতুন দল নিবন্ধন"}
              </h2>
              <p className="text-xs text-slate-400">
                প্রতিটি দলে ৫–৬ জন খেলোয়াড় নির্দিষ্ট করুন (ন্যূনতম ৫, সর্বোচ্চ ৬)
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                দলের নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="উদা: রেড ড্রাগনস / সবুজ একাদশ"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                শর্ট কোড (২-৪ অক্ষর)
              </label>
              <input
                type="text"
                maxLength={4}
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                placeholder="RED"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              দলের রং (Team Color)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setColor(preset.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color.toLowerCase() === preset.hex.toLowerCase()
                      ? "scale-110 border-white ring-2 ring-emerald-500"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full bg-transparent border-0 cursor-pointer p-0"
                title="কাস্টম রং বাছুন"
              />
              <span className="text-xs font-mono text-slate-400 ml-2">{color}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              দলের লোগো URL (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                খেলোয়াড় নির্বাচন (স্কোয়াড গঠন)
              </label>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  selectedPlayerIds.length >= 5 && selectedPlayerIds.length <= 6
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : selectedPlayerIds.length > 6
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {toBnNum(selectedPlayerIds.length)} / ৫–৬ জন নির্বাচিত
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="খেলোয়াড়ের নাম, জার্সি নং বা পজিশন দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {isLoadingPlayers ? (
              <div className="py-8 text-center text-xs text-slate-400">
                খেলোয়াড় তালিকা লোড হচ্ছে...
              </div>
            ) : availablePlayers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                কোনো সক্রিয় খেলোয়াড় পাওয়া যায়নি। প্রথমে একাডেমি প্লেয়ার যুক্ত করুন।
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                &quot;{playerSearch}&quot; দিয়ে কোনো খেলোয়াড় খুঁজে পাওয়া যায়নি।
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/50">
                {filteredPlayers.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player._id);
                  const isAssignedToOther = otherTeamAssignedPlayerIds.has(player._id);

                  return (
                    <button
                      type="button"
                      key={player._id}
                      onClick={() => togglePlayer(player._id)}
                      disabled={isAssignedToOther}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isAssignedToOther
                          ? "opacity-40 bg-slate-900/40 cursor-not-allowed"
                          : isSelected
                          ? "bg-emerald-500/15 border border-emerald-500/40 text-white cursor-pointer"
                          : "bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 text-slate-300 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-700 bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Player Photo / Avatar */}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                          {player.photo ? (
                            <Image
                              src={player.photo}
                              alt={player.fullName}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                              {player.fullName ? player.fullName.charAt(0) : "P"}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-xs text-white block">
                            {player.fullName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {getBnPosition(player.position)} • #{toBnNum(player.jerseyNumber)}
                          </span>
                        </div>
                      </div>

                      {isAssignedToOther ? (
                        <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                          অন্য দলে নিবন্ধিত
                        </span>
                      ) : isSelected ? (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          নির্বাচিত
                        </span>
                      ) : null}
                    </button>
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
              disabled={isSubmitting || selectedPlayerIds.length < 5 || selectedPlayerIds.length > 6}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "সংরক্ষণ হচ্ছে..."
                : isEditing
                ? "দল হালনাগাদ করুন"
                : "দল নিবন্ধন সম্পন্ন করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentTeamModal({
  isOpen,
  onClose,
  tournamentId,
  teamToEdit,
  existingTeams,
  onSuccess,
}: TournamentTeamModalProps) {
  if (!isOpen) return null;

  return (
    <TournamentTeamInner
      key={teamToEdit?._id || "new"}
      tournamentId={tournamentId}
      teamToEdit={teamToEdit}
      existingTeams={existingTeams}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
