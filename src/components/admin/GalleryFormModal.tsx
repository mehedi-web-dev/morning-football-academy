"use client";

import { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import { Button } from "@heroui/react";
import {
  apiClient,
  GalleryDocument,
  CreateGalleryInput,
  GalleryMediaType,
  ApiError,
} from "../../lib/api-client";

interface GalleryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItemToEdit?: GalleryDocument | null;
  onSuccess: (savedItem: GalleryDocument, isEdit: boolean) => void;
}

const PRESET_CATEGORIES = [
  "MATCH DAY",
  "TRAINING",
  "TEAM MOMENTS",
  "STADIUM",
  "CELEBRATIONS",
  "ACADEMY LIFE",
];

const LOCAL_PRESET_IMAGES = [
  { label: "Squad Lineup", url: "/images/team.jpeg" },
  { label: "Stadium Arena", url: "/images/stadium-hero.jpg" },
  { label: "Goalkeeper", url: "/images/players/player-4.jpg" },
  { label: "Tactical Drills", url: "/images/players/player-3.jpg" },
  { label: "Future Talent", url: "/images/players/player-1.jpg" },
  { label: "Derby Celebration", url: "/images/players/test.jpg" },
];

/**
 * GalleryFormInner Component
 * Stateful form content remounted via key when galleryItemToEdit changes
 */
function GalleryFormInner({
  galleryItemToEdit,
  onClose,
  onSuccess,
}: {
  galleryItemToEdit?: GalleryDocument | null;
  onClose: () => void;
  onSuccess: (savedItem: GalleryDocument, isEdit: boolean) => void;
}) {
  const isEdit = Boolean(galleryItemToEdit);

  // Form Fields State
  const [title, setTitle] = useState(galleryItemToEdit?.title ?? "");
  const [description, setDescription] = useState(galleryItemToEdit?.description ?? "");
  const [mediaType, setMediaType] = useState<GalleryMediaType>(
    galleryItemToEdit?.mediaType ?? "image"
  );
  const [mediaUrl, setMediaUrl] = useState(galleryItemToEdit?.mediaUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(galleryItemToEdit?.thumbnailUrl ?? "");
  const [category, setCategory] = useState(
    galleryItemToEdit?.category ?? PRESET_CATEGORIES[0]
  );
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(
    galleryItemToEdit?.category
      ? !PRESET_CATEGORIES.includes(galleryItemToEdit.category)
      : false
  );
  const [isPublished, setIsPublished] = useState(
    galleryItemToEdit?.isPublished ?? true
  );

  // Preview state
  const [imageError, setImageError] = useState(false);

  // Form submission & async state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 2) {
      errors.title = "Title must be at least 2 characters.";
    } else if (title.trim().length > 150) {
      errors.title = "Title cannot exceed 150 characters.";
    }

    if (description.trim().length > 1000) {
      errors.description = "Description cannot exceed 1000 characters.";
    }

    if (!mediaUrl.trim()) {
      errors.mediaUrl = "Media URL or local asset path is required.";
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory || finalCategory.length < 2) {
      errors.category = "Category must be at least 2 characters.";
    } else if (finalCategory.length > 50) {
      errors.category = "Category cannot exceed 50 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    const payload: CreateGalleryInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      category: finalCategory,
      isPublished,
    };

    try {
      let saved: GalleryDocument;
      if (isEdit && galleryItemToEdit) {
        const res = await apiClient.gallery.update(galleryItemToEdit._id, payload);
        saved = res.data;
      } else {
        const res = await apiClient.gallery.create(payload);
        saved = res.data;
      }

      onSuccess(saved, isEdit);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400 && typeof err.details === "object" && err.details) {
          const det = err.details as Record<string, string>;
          setFieldErrors(det);
          setFormError(err.message || "Please fix validation errors in the form.");
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError(
          isEdit
            ? "An unexpected error occurred while updating the gallery item."
            : "An unexpected error occurred while creating the gallery item."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#18251F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#101A17]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#202E27] border border-white/10 flex items-center justify-center text-[#B9F66B]">
              {mediaType === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {isEdit ? "EDIT GALLERY MEDIA." : "ADD GALLERY MEDIA."}
              </h2>
              <p className="text-[11px] text-[#A4B0A8] font-mono">
                {isEdit
                  ? `Updating media asset: ${galleryItemToEdit?.title}`
                  : "Curate official matchday photo, squad portrait, or video highlight"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-[#A4B0A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Form Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-300">
                  Submission Failed
                </span>
                <p className="text-xs text-red-300/90">{formError}</p>
              </div>
            </div>
          )}

          {/* 1. Media Type Selector */}
          <div>
            <label className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block mb-2">
              MEDIA TYPE <span className="text-[#B9F66B]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mediaType === "image"
                    ? "bg-[#B9F66B] text-[#101A17] border-[#B9F66B] shadow-md font-black"
                    : "bg-[#101A17] text-[#A4B0A8] border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>PHOTOGRAPH / IMAGE</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mediaType === "video"
                    ? "bg-[#B9F66B] text-[#101A17] border-[#B9F66B] shadow-md font-black"
                    : "bg-[#101A17] text-[#A4B0A8] border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>VIDEO REEL / CLIP</span>
              </button>
            </div>
          </div>

          {/* 2. Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label
                htmlFor="media-title"
                className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
              >
                TITLE <span className="text-[#B9F66B]">*</span>
              </label>
              <input
                id="media-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
                placeholder="e.g. Squad Lineup Autumn Season"
                className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                  fieldErrors.title
                    ? "border-red-500/70 focus:border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/50"
                }`}
              />
              {fieldErrors.title && (
                <p className="text-[10px] text-red-400 mt-1 font-mono">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="media-category"
                  className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block"
                >
                  CATEGORY <span className="text-[#B9F66B]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[10px] font-mono text-[#B9F66B] hover:underline cursor-pointer"
                >
                  {isCustomCategory ? "Choose Preset" : "+ Custom"}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (fieldErrors.category) {
                      setFieldErrors((prev) => ({ ...prev, category: "" }));
                    }
                  }}
                  placeholder="e.g. TOURNAMENT HIGHLIGHTS"
                  className={`w-full bg-[#101A17] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                    fieldErrors.category
                      ? "border-red-500/70 focus:border-red-500"
                      : "border-white/10 focus:border-[#B9F66B]/50"
                  }`}
                />
              ) : (
                <select
                  id="media-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (fieldErrors.category) {
                      setFieldErrors((prev) => ({ ...prev, category: "" }));
                    }
                  }}
                  className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors cursor-pointer"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {fieldErrors.category && (
                <p className="text-[10px] text-red-400 mt-1 font-mono">
                  {fieldErrors.category}
                </p>
              )}
            </div>
          </div>

          {/* 3. Media URL (URL-based Asset Management) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="media-url"
                className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block"
              >
                MEDIA URL / PATH <span className="text-[#B9F66B]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#A4B0A8]/70">
                Direct URL or /images/... path
              </span>
            </div>

            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="media-url"
                type="text"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setImageError(false);
                  if (fieldErrors.mediaUrl) {
                    setFieldErrors((prev) => ({ ...prev, mediaUrl: "" }));
                  }
                }}
                placeholder="https://... or /images/team.jpeg"
                className={`w-full bg-[#101A17] border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                  fieldErrors.mediaUrl
                    ? "border-red-500/70 focus:border-red-500"
                    : "border-white/10 focus:border-[#B9F66B]/50"
                }`}
              />
            </div>
            {fieldErrors.mediaUrl && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {fieldErrors.mediaUrl}
              </p>
            )}

            {/* Quick Sample Presets */}
            {mediaType === "image" && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#A4B0A8]/60 uppercase mr-1">
                  Presets:
                </span>
                {LOCAL_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setMediaUrl(preset.url);
                      setImageError(false);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                      mediaUrl === preset.url
                        ? "bg-[#B9F66B] text-[#101A17] font-bold"
                        : "bg-[#101A17] border border-white/5 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Video Thumbnail (Only for video or custom preview) */}
          {mediaType === "video" && (
            <div>
              <label
                htmlFor="thumbnail-url"
                className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
              >
                THUMBNAIL URL <span className="text-[#A4B0A8]/60 font-normal">(OPTIONAL POSTER)</span>
              </label>
              <div className="relative">
                <ImageIcon className="w-3.5 h-3.5 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="thumbnail-url"
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="e.g. /images/stadium-hero.jpg or https://..."
                  className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* 5. Live Media Visual Preview */}
          {mediaUrl.trim() && (
            <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#B9F66B] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>LIVE MEDIA PREVIEW</span>
                </span>
                <span className="text-[10px] font-mono text-[#A4B0A8] uppercase">
                  {mediaType}
                </span>
              </div>

              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#18251F] border border-white/5 flex items-center justify-center">
                {mediaType === "image" ? (
                  imageError ? (
                    <div className="text-center p-4 space-y-1">
                      <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="text-xs text-[#A4B0A8]">
                        Unable to load image from provided URL. Please verify the link.
                      </p>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18251F] to-[#101A17] p-4 text-center">
                    {thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl}
                        alt="Video Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    ) : null}
                    <div className="relative z-10 w-12 h-12 rounded-full bg-[#B9F66B]/20 border border-[#B9F66B]/40 flex items-center justify-center text-[#B9F66B] shadow-lg mb-2">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="relative z-10 text-xs font-mono text-white font-bold">
                      VIDEO ASSET READY
                    </span>
                    <span className="relative z-10 text-[10px] font-mono text-[#A4B0A8] truncate max-w-xs mt-0.5">
                      {mediaUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Description / Caption */}
          <div>
            <label
              htmlFor="media-description"
              className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
            >
              DESCRIPTION / CAPTION{" "}
              <span className="text-[#A4B0A8]/60 font-normal">(OPTIONAL)</span>
            </label>
            <textarea
              id="media-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context, match tournament details, or athletic focus..."
              className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 7. Published Status Switch */}
          <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-white uppercase tracking-tight block">
                PUBLISH STATUS
              </span>
              <p className="text-[11px] text-[#A4B0A8] leading-tight">
                {isPublished
                  ? "Asset is published and visible on the academy gallery showcase."
                  : "Draft mode: Hidden from public showcase until officially approved."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublished ? "bg-[#B9F66B]" : "bg-[#202E27]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#101A17] shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPublished ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <Button
              type="button"
              onPress={onClose}
              isDisabled={isSubmitting}
              className="bg-transparent border border-white/10 text-[#A4B0A8] hover:text-white hover:border-white/20 text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#101A17] border-t-transparent rounded-full animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? "SAVE CHANGES" : "PUBLISH ASSET"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * GalleryFormModal Component
 * Reusable modal for creating and updating gallery assets
 */
export default function GalleryFormModal({
  isOpen,
  onClose,
  galleryItemToEdit,
  onSuccess,
}: GalleryFormModalProps) {
  if (!isOpen) return null;

  return (
    <GalleryFormInner
      key={galleryItemToEdit?._id ?? "new-gallery-item"}
      galleryItemToEdit={galleryItemToEdit}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
