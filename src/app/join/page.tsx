"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  Info,
  RotateCcw,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  CreateRegistrationInput,
  RegistrationDocument,
  ApiError,
} from "../../lib/api-client";
import { toBnNum, getBnPosition } from "../../lib/bn-utils";

const POSITION_OPTIONS = [
  "Goalkeeper",
  "Centre Back",
  "Full Back / Wing Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger",
  "Striker / Centre Forward",
];

/**
 * Calculate age from date of birth string
 */
function calculateAge(dobStr: string): number | null {
  if (!dobStr) return null;
  try {
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Public Academy Enrollment & Trialist Registration Page
 * Connects to the Express backend POST /api/v1/registrations endpoint
 */
export default function JoinPage() {
  // Form Field State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [position, setPosition] = useState(POSITION_OPTIONS[4]); // Default: Central Midfielder
  const [customPosition, setCustomPosition] = useState("");
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedCandidate, setSubmittedCandidate] =
    useState<RegistrationDocument | null>(null);

  // Derived live age preview
  const calculatedAge = calculateAge(dateOfBirth);

  // Validate Form against exact backend contracts
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Full Name: min 2, max 100
    const cleanName = fullName.trim();
    if (!cleanName) {
      errors.fullName = "দয়া করে আপনার পুরো নাম লিখুন।";
    } else if (cleanName.length < 2) {
      errors.fullName = "পুরো নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanName.length > 100) {
      errors.fullName = "পুরো নাম ১০০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 2. Email: valid email regex
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = "দয়া করে আপনার ইমেইল ঠিকানা দিন।";
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = "সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: name@example.com)।";
    }

    // 3. Phone: min 6, max 20
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      errors.phone = "দয়া করে যোগাযোগের ফোন নম্বর দিন।";
    } else if (cleanPhone.length < 6) {
      errors.phone = "ফোন নম্বর অন্তত ৬ ডিজিটের হতে হবে।";
    } else if (cleanPhone.length > 20) {
      errors.phone = "ফোন নম্বর ২০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 4. Date of Birth: valid date in the past
    if (!dateOfBirth) {
      errors.dateOfBirth = "দয়া করে আপনার জন্মতারিখ নির্বাচন করুন।";
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = "সঠিক জন্মতারিখ প্রদান করুন।";
      } else if (birthDate >= today) {
        errors.dateOfBirth = "জন্মতারিখ অবশ্যই অতীতের হতে হবে।";
      } else if (calculatedAge !== null && (calculatedAge < 5 || calculatedAge > 40)) {
        errors.dateOfBirth =
          "জন্মতারিখ পুনরায় যাচাই করুন। একাডেমিতে সাধারণত ৬ থেকে ৩৫ বছর বয়সীদের ভর্তি নেওয়া হয়।";
      }
    }

    // 5. Position: min 2, max 50
    const finalPosition = isCustomPosition ? customPosition.trim() : position.trim();
    if (!finalPosition) {
      errors.position = "দয়া করে পছন্দের পজিশন নির্বাচন বা উল্লেখ করুন।";
    } else if (finalPosition.length < 2) {
      errors.position = "পজিশন অন্তত ২ অক্ষরের হতে হবে।";
    } else if (finalPosition.length > 50) {
      errors.position = "পজিশন ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 6. Football Experience: min 2, max 500
    const cleanExp = experience.trim();
    if (!cleanExp) {
      errors.experience = "দয়া করে আপনার ফুটবল খেলার অভিজ্ঞতার বিবরণ দিন।";
    } else if (cleanExp.length < 2) {
      errors.experience = "অভিজ্ঞতার বিবরণ অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanExp.length > 500) {
      errors.experience = "অভিজ্ঞতার বিবরণ ৫০০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 7. Message: max 1000 (optional)
    if (message.trim().length > 1000) {
      errors.message = "ব্যক্তিগত বার্তা ১০০০ অক্ষরের বেশি হতে পারবে না।";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const finalPosition = isCustomPosition ? customPosition.trim() : position.trim();

    const payload: CreateRegistrationInput = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dateOfBirth,
      position: finalPosition,
      experience: experience.trim(),
      message: message.trim() || undefined,
    };

    try {
      const response = await apiClient.registrations.submit(payload);
      setSubmittedCandidate(response.data);
      setSubmitError(null);

      // Scroll to top of content to see confirmation
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400 && typeof err.details === "object" && err.details) {
          const det = err.details as Record<string, string>;
          setFieldErrors(det);
          setSubmitError(err.message || "অনুগ্রহ করে নিচের ভুল তথ্য সংশোধন করুন।");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError(
          "আবেদন জমা দেওয়া সম্ভব হয়নি। ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another application
  const handleReset = () => {
    setSubmittedCandidate(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setDateOfBirth("");
    setPosition(POSITION_OPTIONS[4]);
    setCustomPosition("");
    setIsCustomPosition(false);
    setExperience("");
    setMessage("");
    setFieldErrors({});
    setSubmitError(null);
  };

  return (
    <div className="w-full bg-[#101A17] text-white min-h-screen">
      {/* 1. Cinematic Hero Header */}
      <section className="relative w-full py-16 sm:py-24 bg-[#101A17] border-b border-white/[0.08] overflow-hidden">
        {/* Background Image & Forest-Green Atmospheric Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/images/stadium-hero.jpg"
            alt="Morning Football Academy training pitch under evening floodlights"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30 saturate-[1.1] brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#101A17]/80 via-[#101A17]/95 to-[#101A17]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/15 via-[#0d281a]/30 to-transparent blur-3xl opacity-60 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center">
            <Chip className="bg-[#18251F]/90 backdrop-blur-md text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.22em] text-[10px] sm:text-[11px] uppercase px-3.5 py-1 shadow-[0_0_15px_rgba(185,246,107,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-2 inline-block animate-pulse" />
              একাডেমি ভর্তি ২০২৬/২০২৭
            </Chip>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
            মর্নিং ফুটবল একাডেমিতে{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_25px_rgba(185,246,107,0.35)]">
              ভর্তি হন।
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#A4B0A8] max-w-2xl mx-auto leading-relaxed">
            শীর্ষস্থানীয় ক্রীড়াবিদ হিসেবে নিজেকে গড়ে তুলতে প্রথম পদক্ষেপ গ্রহণ করুন। আসন্ন একাডেমি ট্রায়ালের জন্য নিচে আপনার খেলোয়াড় আবেদন জমা দিন।
          </p>

          {/* Quick Pillars Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 text-[11px] font-mono text-[#A4B0A8]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Trophy className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>উন্নত প্রশিক্ষণ পদ্ধতি</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>লাইসেন্সপ্রাপ্ত টেকনিক্যাল কোচ</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>অনূর্ধ্ব-১৩ থেকে সিনিয়র স্কোয়াড</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Form Section */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {submittedCandidate ? (
          /* =========================================================
             A. SUCCESS CONFIRMATION STATE
             ========================================================= */
          <div className="rounded-3xl bg-[#18251F] border border-[#B9F66B]/40 p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#B9F66B]/10 blur-3xl pointer-events-none" />

            {/* Glowing Success Badge */}
            <div className="relative w-20 h-20 mx-auto rounded-3xl bg-[#202E27] border border-[#B9F66B]/50 flex items-center justify-center text-[#B9F66B] shadow-[0_0_30px_rgba(185,246,107,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 relative z-10">
              <span className="px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 font-mono text-[11px] font-black uppercase tracking-wider inline-block">
                আবেদন সফলভাবে গৃহীত হয়েছে
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                স্বাগতম, {submittedCandidate.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-xl mx-auto leading-relaxed">
                আপনার একাডেমি ট্রায়াল আবেদন সফলভাবে নিবন্ধিত হয়েছে এবং বর্তমান স্ট্যাটাস:{" "}
                <strong className="text-amber-300 font-mono uppercase">পর্যালোচনাধীন</strong>।
                আমাদের অভিজ্ঞ কোচিং প্যানেল আপনার প্রোফাইল যাচাই করে ট্রায়াল সেশনের নির্দিষ্ট তারিখ জানিয়ে দ্রুত যোগাযোগ করবেন।
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#101A17] border border-white/10 text-left space-y-3 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-mono text-[#A4B0A8] uppercase">
                  আবেদনের সারসংক্ষেপ
                </span>
                <span className="text-[11px] font-mono text-[#B9F66B]">
                  আইডি: {submittedCandidate._id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    প্রার্থী
                  </span>
                  <span className="font-bold text-white uppercase">
                    {submittedCandidate.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    পছন্দের পজিশন
                  </span>
                  <span className="font-bold text-[#B9F66B] uppercase">
                    {getBnPosition(submittedCandidate.position)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    ইমেইল
                  </span>
                  <span className="font-mono text-white/90">
                    {submittedCandidate.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    ফোন
                  </span>
                  <span className="font-mono text-white/90">
                    {submittedCandidate.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps Guide */}
            <div className="p-5 rounded-2xl bg-[#202E27] border border-white/10 text-left space-y-3 relative z-10">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#B9F66B]" />
                <span>পরবর্তী ধাপসমূহ</span>
              </h3>

              <div className="space-y-2 text-xs text-[#A4B0A8] leading-relaxed">
                <p>
                  <strong className="text-white">১. কারিগরি মূল্যায়ন:</strong> আমাদের কোচিং দল
                  আগামী ৩-৫ কার্যদিবসের মধ্যে বর্তমান স্কোয়াডের শূন্যপদের সাথে আপনার খেলার পটভূমি পর্যালোচনা করবেন।
                </p>
                <p>
                  <strong className="text-white">২. ট্রায়াল আমন্ত্রণ:</strong> উপযুক্ত বিবেচিত
                  প্রার্থীদের ইমেইল এবং ফোনে এসএমএস পাঠিয়ে ট্রায়ালের সময়সূচি ও প্রয়োজনীয় কিট সংক্রান্ত নির্দেশনা প্রদান করা হবে।
                </p>
                <p>
                  <strong className="text-white">৩. মাঠের পারফরম্যান্স যাচাই:</strong> সরাসরি মাঠে টেকনিক্যাল ড্রিল,
                  স্মল-সাইডেড ম্যাচ এবং গতি ও ফিটনেস অ্যাসেসমেন্টে অংশ নিন।
                </p>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#a8ec56] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2">
                  <span>হোমপেজে ফিরে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                onPress={handleReset}
                variant="outline"
                className="w-full sm:w-auto bg-transparent border border-white/15 text-white hover:border-[#B9F66B]/50 hover:text-[#B9F66B] font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>নতুন আরেকটি আবেদন করুন</span>
              </Button>
            </div>
          </div>
        ) : (
          /* =========================================================
             B. REGISTRATION APPLICATION FORM
             ========================================================= */
          <div className="space-y-8">
            {/* Trial Process Timeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[#B9F66B] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>ধাপ ০১</span>
                  <User className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">আবেদন জমা দিন</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  আপনার খেলার অভিজ্ঞতা, পছন্দের পজিশন ও যোগাযোগের তথ্য প্রদান করুন।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[#B9F66B] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>ধাপ ০২</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">কোচিং পর্যালোচনা</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  আমাদের কারিগরি দল প্রতিটি আবেদন যাচাই করে বয়স ভিত্তিক স্কোয়াড নির্ধারণ করবেন।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[#B9F66B] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>ধাপ ০৩</span>
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">ট্রায়াল আমন্ত্রণ</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  নির্বাচিত প্রার্থীদের ফ্লাডলাইটের নিচে পূর্ণাঙ্গ মাঠের ট্রায়াল সেশনে আমন্ত্রণ জানানো হবে।
                </p>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="rounded-3xl bg-[#18251F] border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  খেলোয়াড় ভর্তি ও ট্রায়াল আবেদন ফরম
                </h2>
                <p className="text-xs sm:text-sm text-[#A4B0A8]">
                  <span className="text-[#B9F66B]">*</span> চিহ্নিত প্রতিটি তথ্য দেওয়া আবশ্যক।
                  আপনার তথ্য সম্পূর্ণ সুরক্ষিত থাকবে এবং কেবল একাডেমি কর্তৃপক্ষ কর্তৃক পর্যালোচিত হবে।
                </p>
              </div>

              {/* Server / Global Error Banner */}
              {submitError && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-300">
                      আবেদন জমাদানে ত্রুটি
                    </span>
                    <p className="text-xs text-red-300/90">{submitError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                  >
                    পুরো নাম <span className="text-[#B9F66B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                        }
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className={`w-full bg-[#101A17] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                        fieldErrors.fullName
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-[#B9F66B]/60"
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-red-400 font-mono mt-1">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* 2. Email & Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      ইমেইল ঠিকানা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        placeholder="যেমন: tanvir@example.com"
                        className={`w-full bg-[#101A17] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                          fieldErrors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-white/10 focus:border-[#B9F66B]/60"
                        }`}
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p className="text-[11px] text-red-400 font-mono mt-1">
                        {fieldErrors.email}
                      </p>
                    ) : (
                      <span className="text-[10px] font-mono text-[#A4B0A8]/70 mt-1 block">
                        ট্রায়াল আমন্ত্রণের বিস্তারিত এই ইমেইলে পাঠানো হবে
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      যোগাযোগের ফোন নম্বর <span className="text-[#B9F66B]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        placeholder="যেমন: +৮৮০ ১৭XXXXXXXX"
                        className={`w-full bg-[#101A17] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                          fieldErrors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "border-white/10 focus:border-[#B9F66B]/60"
                        }`}
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className="text-[11px] text-red-400 font-mono mt-1">
                        {fieldErrors.phone}
                      </p>
                    ) : (
                      <span className="text-[10px] font-mono text-[#A4B0A8]/70 mt-1 block">
                        খেলোয়াড় অথবা অভিভাবকের ফোন নম্বর
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Date of Birth & Preferred Position Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="dateOfBirth"
                        className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                      >
                        জন্মতারিখ <span className="text-[#B9F66B]">*</span>
                      </label>
                      {calculatedAge !== null && (
                        <span className="text-[11px] font-mono font-bold text-[#B9F66B]">
                          বয়স: {toBnNum(calculatedAge)} বছর
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                          if (fieldErrors.dateOfBirth) {
                            setFieldErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        className={`w-full bg-[#101A17] border rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                          fieldErrors.dateOfBirth
                            ? "border-red-500 focus:border-red-500"
                            : "border-white/10 focus:border-[#B9F66B]/60"
                        }`}
                      />
                    </div>
                    {fieldErrors.dateOfBirth && (
                      <p className="text-[11px] text-red-400 font-mono mt-1">
                        {fieldErrors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Preferred Position */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="position"
                        className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                      >
                        পছন্দের পজিশন <span className="text-[#B9F66B]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomPosition(!isCustomPosition)}
                        className="text-[10px] font-mono text-[#B9F66B] hover:underline cursor-pointer"
                      >
                        {isCustomPosition ? "পূর্বনির্ধারিত তালিকা" : "+ অন্যান্য পজিশন"}
                      </button>
                    </div>

                    {isCustomPosition ? (
                      <input
                        id="position"
                        type="text"
                        value={customPosition}
                        onChange={(e) => {
                          setCustomPosition(e.target.value);
                          if (fieldErrors.position) {
                            setFieldErrors((prev) => ({ ...prev, position: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        placeholder="যেমন: লেফট উইং ব্যাক / ইনভার্টেড উইঙ্গার"
                        className={`w-full bg-[#101A17] border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
                          fieldErrors.position
                            ? "border-red-500 focus:border-red-500"
                            : "border-white/10 focus:border-[#B9F66B]/60"
                        }`}
                      />
                    ) : (
                      <select
                        id="position"
                        value={position}
                        onChange={(e) => {
                          setPosition(e.target.value);
                          if (fieldErrors.position) {
                            setFieldErrors((prev) => ({ ...prev, position: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        className="w-full bg-[#101A17] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#B9F66B]/60 transition-colors cursor-pointer"
                      >
                        {POSITION_OPTIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {getBnPosition(pos)}
                          </option>
                        ))}
                      </select>
                    )}

                    {fieldErrors.position && (
                      <p className="text-[11px] text-red-400 font-mono mt-1">
                        {fieldErrors.position}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Football Playing Experience */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="experience"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      ফুটবল খেলার অভিজ্ঞতা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        experience.length > 450 ? "text-amber-300" : "text-[#A4B0A8]/60"
                      }`}
                    >
                      {toBnNum(experience.length)} / ৫০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="experience"
                    rows={4}
                    value={experience}
                    onChange={(e) => {
                      setExperience(e.target.value);
                      if (fieldErrors.experience) {
                        setFieldErrors((prev) => ({ ...prev, experience: "" }));
                      }
                    }}
                    disabled={isSubmitting}
                    maxLength={500}
                    placeholder="আপনার বর্তমান বা পূর্ববর্তী ক্লাব, স্কুল দল, ফুটবল একাডেমি, পছন্দের পা (বাম/ডান), এবং সাম্প্রতিক সাফল্য সম্পর্কে লিখুন..."
                    className={`w-full bg-[#101A17] border rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors resize-none leading-relaxed ${
                      fieldErrors.experience
                        ? "border-red-500 focus:border-red-500"
                        : "border-white/10 focus:border-[#B9F66B]/60"
                    }`}
                  />
                  {fieldErrors.experience && (
                    <p className="text-[11px] text-red-400 font-mono mt-1">
                      {fieldErrors.experience}
                    </p>
                  )}
                </div>

                {/* 5. Personal Statement / Message (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="message"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      ব্যক্তিগত বার্তা{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(message.length)} / ১০০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={1000}
                    placeholder="আপনার ফুটবলীয় লক্ষ্য, স্বপ্ন এবং কেন আপনি মর্নিং ফুটবল একাডেমিতে যোগ দিতে চান তা আমাদের জানান..."
                    className="w-full bg-[#101A17] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/60 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* 6. Terms Notice */}
                <div className="p-4 rounded-xl bg-[#101A17] border border-white/5 text-[11px] text-[#A4B0A8] leading-relaxed">
                  এই আবেদন জমা দেওয়ার মাধ্যমে আপনি নিশ্চিত করছেন যে প্রদত্ত সকল তথ্য সঠিক ও সত্য।
                  ১৮ বছরের কম বয়সী প্রার্থীদের ক্ষেত্রে ট্রায়ালে অংশগ্রহণে অভিভাবকের সম্মতি থাকতে হবে।
                </div>

                {/* 7. Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    isDisabled={isSubmitting}
                    className="w-full bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs sm:text-sm tracking-[0.16em] uppercase rounded-xl py-4 transition-all shadow-[0_0_20px_rgba(185,246,107,0.3)] hover:shadow-[0_0_30px_rgba(185,246,107,0.5)] cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#101A17] border-t-transparent rounded-full animate-spin" />
                        <span>ট্রায়াল আবেদন জমা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>ট্রায়াল আবেদন জমা দিন</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
