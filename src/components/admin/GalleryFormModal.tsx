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
  { label: "দলের লাইনআপ", url: "/images/team.jpeg" },
  { label: "স্টেডিয়াম এরিনা", url: "/images/stadium-hero.jpg" },
  { label: "গোলরক্ষক", url: "/images/players/player-4.jpg" },
  { label: "কৌশলগত ড্রিল", url: "/images/players/player-3.jpg" },
  { label: "ভবিষ্যৎ প্রতিভা", url: "/images/players/player-1.jpg" },
  { label: "ডার্বি উদযাপন", url: "/images/players/test.jpg" },
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
      errors.title = "শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে।";
    } else if (title.trim().length > 150) {
      errors.title = "শিরোনাম ১৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (description.trim().length > 1000) {
      errors.description = "বিবরণ ১০০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (!mediaUrl.trim()) {
      errors.mediaUrl = "মিডিয়া ইউআরএল বা লোকাল পাথ প্রদান করা আবশ্যক।";
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory || finalCategory.length < 2) {
      errors.category = "ক্যাটাগরি কমপক্ষে ২ অক্ষরের হতে হবে।";
    } else if (finalCategory.length > 50) {
      errors.category = "ক্যাটাগরি ৫০ অক্ষরের বেশি হতে পারবে না।";
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
          setFormError(err.message || "ফর্মের ভুলগুলো সংশোধন করুন।");
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError(
          isEdit
            ? "গ্যালারি মিডিয়া আপডেট করার সময় একটি ত্রুটি ঘটেছে।"
            : "গ্যালারি মিডিয়া তৈরি করার সময় একটি ত্রুটি ঘটেছে।"
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
                {isEdit ? "গ্যালারি মিডিয়া সম্পাদনা" : "নতুন মিডিয়া যুক্ত করুন"}
              </h2>
              <p className="text-[11px] text-[#A4B0A8] font-mono">
                {isEdit
                  ? `মিডিয়া আপডেট হচ্ছে: ${galleryItemToEdit?.title}`
                  : "অফিসিয়াল ম্যাচ ডে ফটো, স্কোয়াড পোর্ট্রেট বা ভিডিও হাইলাইট যুক্ত করুন"}
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
                  সংরক্ষণ ব্যর্থ হয়েছে
                </span>
                <p className="text-xs text-red-300/90">{formError}</p>
              </div>
            </div>
          )}

          {/* 1. Media Type Selector */}
          <div>
            <label className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block mb-2">
              মিডিয়ার ধরন <span className="text-[#B9F66B]">*</span>
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
                <span>ছবি / ফটোগ্রাফ</span>
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
                <span>ভিডিও রিল / ক্লিপ</span>
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
                শিরোনাম <span className="text-[#B9F66B]">*</span>
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
                placeholder="যেমন: শরৎকালীন স্কোয়াড লাইনআপ"
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
                  ক্যাটাগরি <span className="text-[#B9F66B]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[10px] font-mono text-[#B9F66B] hover:underline cursor-pointer"
                >
                  {isCustomCategory ? "প্রিসেট নির্বাচন করুন" : "+ কাস্টম"}
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
                  placeholder="যেমন: TOURNAMENT HIGHLIGHTS"
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
                মিডিয়া ইউআরএল / পাথ <span className="text-[#B9F66B]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#A4B0A8]/70">
                সরাসরি ইউআরএল বা /images/... পাথ
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
                placeholder="https://... অথবা /images/team.jpeg"
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
                  প্রিসেট:
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
                থাম্বনেইল ইউআরএল <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক পোস্টার)</span>
              </label>
              <div className="relative">
                <ImageIcon className="w-3.5 h-3.5 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="thumbnail-url"
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="যেমন: /images/stadium-hero.jpg অথবা https://..."
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
                  <span>লাইভ মিডিয়া প্রিভিউ</span>
                </span>
                <span className="text-[10px] font-mono text-[#A4B0A8] uppercase">
                  {mediaType === "image" ? "ছবি" : "ভিডিও"}
                </span>
              </div>

              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#18251F] border border-white/5 flex items-center justify-center">
                {mediaType === "image" ? (
                  imageError ? (
                    <div className="text-center p-4 space-y-1">
                      <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="text-xs text-[#A4B0A8]">
                        প্রদত্ত ইউআরএল থেকে ছবি লোড করা যাচ্ছে না। দয়া করে লিঙ্কটি যাচাই করুন।
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
                      ভিডিও প্রস্তুত আছে
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
              বিবরণ / ক্যাপশন{" "}
              <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
            </label>
            <textarea
              id="media-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="প্রেক্ষাপট, ম্যাচ টুর্নামেন্টের বিবরণ বা অনুশীলনের লক্ষ্য উল্লেখ করুন..."
              className="w-full bg-[#101A17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 7. Published Status Switch */}
          <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-white uppercase tracking-tight block">
                প্রকাশনা স্ট্যাটাস
              </span>
              <p className="text-[11px] text-[#A4B0A8] leading-tight">
                {isPublished
                  ? "মিডিয়াটি প্রকাশিত এবং একাডেমির পাবলিক গ্যালারিতে দৃশ্যমান।"
                  : "খসড়া মোড: আনুষ্ঠানিকভাবে অনুমোদিত না হওয়া পর্যন্ত সর্বসাধারণের জন্য লুকানো থাকবে।"}
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
              বাতিল
            </Button>

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#101A17] border-t-transparent rounded-full animate-spin" />
                  <span>সংরক্ষণ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? "পরিবর্তন সংরক্ষণ করুন" : "মিডিয়া প্রকাশ করুন"}</span>
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
