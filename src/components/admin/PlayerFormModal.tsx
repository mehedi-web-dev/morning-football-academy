"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  PlayerDocument,
  CreatePlayerInput,
  ApiError,
} from "../../lib/api-client";

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: PlayerDocument | null;
  onSuccess: (savedPlayer: PlayerDocument, isEdit: boolean) => void;
}

const LOCAL_PHOTO_PRESETS = [
  { label: "Preset 1", path: "/images/players/mehedi.jpeg" },
  { label: "Preset 2", path: "/images/players/player-1.jpg" },
  { label: "Preset 3", path: "/images/players/player-3.jpg" },
  { label: "Preset 4", path: "/images/players/player-4.jpg" },
];

const POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"] as const;

/**
 * Generate a clean URL-safe slug from full name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * PlayerFormInner Component
 * Stateful form content remounted via key when playerToEdit changes
 */
function PlayerFormInner({
  playerToEdit,
  onClose,
  onSuccess,
}: {
  playerToEdit?: PlayerDocument | null;
  onClose: () => void;
  onSuccess: (savedPlayer: PlayerDocument, isEdit: boolean) => void;
}) {
  const isEdit = Boolean(playerToEdit);

  // Form Fields State initialized from props
  const [fullName, setFullName] = useState(playerToEdit?.fullName ?? "");
  const [slug, setSlug] = useState(playerToEdit?.slug ?? "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(playerToEdit));
  const [jerseyNumber, setJerseyNumber] = useState<number | "">(playerToEdit?.jerseyNumber ?? 10);
  const [position, setPosition] = useState<"Goalkeeper" | "Defender" | "Midfielder" | "Forward">(
    playerToEdit?.position ?? "Forward"
  );
  const [nationality, setNationality] = useState(playerToEdit?.nationality ?? "Bangladesh");
  const [dateOfBirth, setDateOfBirth] = useState(
    playerToEdit?.dateOfBirth
      ? new Date(playerToEdit.dateOfBirth).toISOString().split("T")[0]
      : "2008-01-01"
  );
  const [height, setHeight] = useState(playerToEdit?.height ?? "178 cm");
  const [weight, setWeight] = useState(playerToEdit?.weight ?? "70 kg");
  const [bio, setBio] = useState(playerToEdit?.bio ?? "");
  const [photo, setPhoto] = useState(playerToEdit?.photo ?? "/images/players/mehedi.jpeg");
  const [isActive, setIsActive] = useState(playerToEdit?.isActive ?? true);

  // Statistics State
  const [appearances, setAppearances] = useState<number | "">(
    playerToEdit?.statistics?.appearances ?? 0
  );
  const [goals, setGoals] = useState<number | "">(playerToEdit?.statistics?.goals ?? 0);
  const [assists, setAssists] = useState<number | "">(playerToEdit?.statistics?.assists ?? 0);
  const [cleanSheets, setCleanSheets] = useState<number | "">(
    playerToEdit?.statistics?.cleanSheets ?? 0
  );

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-slugify when full name changes (if not manually overridden in creation)
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!isSlugManuallyEdited && !isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  // Client-Side Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long.";
    }

    if (!slug.trim() || slug.trim().length < 2) {
      errors.slug = "Slug must be at least 2 characters long.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }

    const num = Number(jerseyNumber);
    if (jerseyNumber === "" || isNaN(num) || num < 1 || num > 99) {
      errors.jerseyNumber = "Jersey number must be an integer between 1 and 99.";
    }

    if (!nationality.trim() || nationality.trim().length < 2) {
      errors.nationality = "Nationality is required (at least 2 characters).";
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        errors.dateOfBirth = "Invalid date format.";
      }
    }

    if (!photo.trim()) {
      errors.photo = "Photo path or image URL is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload: CreatePlayerInput = {
      fullName: fullName.trim(),
      slug: slug.trim(),
      jerseyNumber: Number(jerseyNumber),
      position,
      nationality: nationality.trim(),
      dateOfBirth,
      height: height.trim() || undefined,
      weight: weight.trim() || undefined,
      bio: bio.trim() || undefined,
      photo: photo.trim(),
      statistics: {
        appearances: Number(appearances) || 0,
        goals: Number(goals) || 0,
        assists: Number(assists) || 0,
        cleanSheets: Number(cleanSheets) || 0,
      },
      isActive,
    };

    try {
      if (isEdit && playerToEdit) {
        const response = await apiClient.players.update(playerToEdit._id, payload);
        onSuccess(response.data, true);
      } else {
        const response = await apiClient.players.create(payload);
        onSuccess(response.data, false);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (Array.isArray(err.details)) {
          const serverErrors: Record<string, string> = {};
          err.details.forEach((item: { field: string; message: string }) => {
            if (item.field) {
              serverErrors[item.field] = item.message;
            }
          });
          setFieldErrors(serverErrors);
        }
      } else {
        setFormError("Failed to save player profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl my-8 bg-[#18251F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
      {/* Modal Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#18251F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#101A17] border border-[#B9F66B]/30 flex items-center justify-center text-[#B9F66B]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="player-form-title"
              className="text-base sm:text-xl font-black text-white uppercase tracking-tight"
            >
              {isEdit ? "Edit Player Profile" : "Register New Player"}
            </h2>
            <span className="text-[11px] font-mono text-[#A4B0A8] block">
              {isEdit
                ? `Updating roster details for ${playerToEdit?.fullName}`
                : "Add verified squad talent to Morning Football Academy database"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-2 rounded-xl text-[#A4B0A8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body - Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Global Error Banner */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-white flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-xs text-red-200">{formError}</p>
          </div>
        )}

        {/* Section 1: Core Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            1. SQUAD IDENTITY & BIO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Sterling"
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.fullName
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* URL Slug */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                URL Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. liam-sterling"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.slug
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.slug && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.slug}
                </p>
              )}
            </div>

            {/* Jersey Number */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Jersey Number (1-99) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={99}
                placeholder="10"
                value={jerseyNumber}
                onChange={(e) =>
                  setJerseyNumber(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.jerseyNumber
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.jerseyNumber && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.jerseyNumber}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Position <span className="text-red-400">*</span>
              </label>
              <select
                value={position}
                onChange={(e) =>
                  setPosition(
                    e.target.value as
                      | "Goalkeeper"
                      | "Defender"
                      | "Midfielder"
                      | "Forward"
                  )
                }
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos} className="bg-[#18251F] text-white">
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Nationality */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Nationality <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangladesh"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.nationality
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.nationality && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.nationality}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none transition-colors ${
                  fieldErrors.dateOfBirth
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
              {fieldErrors.dateOfBirth && (
                <p className="text-[11px] text-red-400 font-mono">
                  {fieldErrors.dateOfBirth}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Physical Attributes & Bio */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            2. PHYSICAL ATTRIBUTES & BIOGRAPHY
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Height (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 182 cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Weight (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 74 kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#B9F66B]/60 transition-colors"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-mono uppercase text-[#A4B0A8] tracking-wider block">
                Player Biography & Tactical Role (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                placeholder="Enter background, athletic strengths, or scouting notes..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#B9F66B]/60 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Photo Selection */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            3. PLAYER PHOTOGRAPH
          </h3>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#A4B0A8]">Quick Presets:</span>
              {LOCAL_PHOTO_PRESETS.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => setPhoto(p.path)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    photo === p.path
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "bg-[#101A17] text-[#A4B0A8] hover:text-white border border-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#101A17] border border-white/15 shrink-0 flex items-center justify-center">
                <Image
                  src={photo || "/images/players/mehedi.jpeg"}
                  alt="Player photo preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <input
                type="text"
                required
                placeholder="Enter image asset path or URL..."
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className={`flex-1 bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/20 focus:outline-none transition-colors ${
                  fieldErrors.photo
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/10 focus:border-[#B9F66B]/60"
                }`}
              />
            </div>
            {fieldErrors.photo && (
              <p className="text-[11px] text-red-400 font-mono">
                {fieldErrors.photo}
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Statistics */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B9F66B] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
            4. COMPETITION STATISTICS (CAREER / SEASON)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                Appearances
              </label>
              <input
                type="number"
                min={0}
                value={appearances}
                onChange={(e) =>
                  setAppearances(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-[#B9F66B]/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                Goals
              </label>
              <input
                type="number"
                min={0}
                value={goals}
                onChange={(e) =>
                  setGoals(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-[#B9F66B]/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                Assists
              </label>
              <input
                type="number"
                min={0}
                value={assists}
                onChange={(e) =>
                  setAssists(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-[#B9F66B]/60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A4B0A8] block">
                Clean Sheets
              </label>
              <input
                type="number"
                min={0}
                value={cleanSheets}
                onChange={(e) =>
                  setCleanSheets(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10)
                  )
                }
                className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-[#B9F66B]/60"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Active Status */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-white block">
              ACTIVE SQUAD ROSTER
            </span>
            <span className="text-[11px] text-[#A4B0A8]">
              Inactive players remain in the database but are excluded from active squad lineups.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B9F66B]"></div>
          </label>
        </div>

        {/* Form Actions Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onPress={onClose}
            isDisabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            CANCEL
          </Button>

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>SAVING...</span>
            ) : isEdit ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>UPDATE PLAYER</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>SAVE PLAYER</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * PlayerFormModal Component
 * Mounts PlayerFormInner with dynamic key to ensure clean initial state
 */
export default function PlayerFormModal({
  isOpen,
  onClose,
  playerToEdit,
  onSuccess,
}: PlayerFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-form-title"
    >
      <PlayerFormInner
        key={playerToEdit?._id ?? "new-player"}
        playerToEdit={playerToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
