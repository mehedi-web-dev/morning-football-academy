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
      errors.fullName = "Please enter your full name.";
    } else if (cleanName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    } else if (cleanName.length > 100) {
      errors.fullName = "Full name cannot exceed 100 characters.";
    }

    // 2. Email: valid email regex
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    // 3. Phone: min 6, max 20
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      errors.phone = "Please enter a contact phone number.";
    } else if (cleanPhone.length < 6) {
      errors.phone = "Phone number must be at least 6 digits.";
    } else if (cleanPhone.length > 20) {
      errors.phone = "Phone number cannot exceed 20 characters.";
    }

    // 4. Date of Birth: valid date in the past
    if (!dateOfBirth) {
      errors.dateOfBirth = "Please select your date of birth.";
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = "Please enter a valid date.";
      } else if (birthDate >= today) {
        errors.dateOfBirth = "Date of birth must be in the past.";
      } else if (calculatedAge !== null && (calculatedAge < 5 || calculatedAge > 40)) {
        errors.dateOfBirth =
          "Please verify your birth date. Academy enrollment is typically for ages 6 to 35.";
      }
    }

    // 5. Position: min 2, max 50
    const finalPosition = isCustomPosition ? customPosition.trim() : position.trim();
    if (!finalPosition) {
      errors.position = "Please select or enter your preferred position.";
    } else if (finalPosition.length < 2) {
      errors.position = "Position must be at least 2 characters.";
    } else if (finalPosition.length > 50) {
      errors.position = "Position cannot exceed 50 characters.";
    }

    // 6. Football Experience: min 2, max 500
    const cleanExp = experience.trim();
    if (!cleanExp) {
      errors.experience = "Please summarize your football playing experience.";
    } else if (cleanExp.length < 2) {
      errors.experience = "Experience details must be at least 2 characters.";
    } else if (cleanExp.length > 500) {
      errors.experience = "Experience cannot exceed 500 characters.";
    }

    // 7. Message: max 1000 (optional)
    if (message.trim().length > 1000) {
      errors.message = "Personal message cannot exceed 1000 characters.";
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
          setSubmitError(err.message || "Please fix validation errors below.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError(
          "Unable to submit your application. Please check your network connection and try again."
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
              ACADEMY ENROLLMENT 2026/2027
            </Chip>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
            JOIN MORNING FOOTBALL{" "}
            <span className="text-[#B9F66B] drop-shadow-[0_0_25px_rgba(185,246,107,0.35)]">
              ACADEMY.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[#A4B0A8] max-w-2xl mx-auto leading-relaxed">
            Take the first step toward elite athletic development. Submit your player application
            below to be reviewed by our coaching staff for upcoming trial sessions.
          </p>

          {/* Quick Pillars Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 text-[11px] font-mono text-[#A4B0A8]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Trophy className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>ELITE DEVELOPMENT PATHWAYS</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>LICENSED TECHNICAL COACHES</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18251F] border border-white/10">
              <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>U13 TO SENIOR SQUADS</span>
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
                APPLICATION SUBMITTED SUCCESSFULLY
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                WELCOME, {submittedCandidate.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#A4B0A8] max-w-xl mx-auto leading-relaxed">
                Your academy trial application has been registered with status{" "}
                <strong className="text-amber-300 font-mono uppercase">PENDING REVIEW</strong>.
                Our coaching staff will review your background and contact you regarding
                trial session dates.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#101A17] border border-white/10 text-left space-y-3 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-mono text-[#A4B0A8] uppercase">
                  APPLICATION SUMMARY
                </span>
                <span className="text-[11px] font-mono text-[#B9F66B]">
                  ID: {submittedCandidate._id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    CANDIDATE
                  </span>
                  <span className="font-bold text-white uppercase">
                    {submittedCandidate.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    PREFERRED POSITION
                  </span>
                  <span className="font-bold text-[#B9F66B] uppercase">
                    {submittedCandidate.position}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    EMAIL
                  </span>
                  <span className="font-mono text-white/90">
                    {submittedCandidate.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#A4B0A8]/80 uppercase block">
                    PHONE
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
                <span>WHAT HAPPENS NEXT?</span>
              </h3>

              <div className="space-y-2 text-xs text-[#A4B0A8] leading-relaxed">
                <p>
                  <strong className="text-white">1. Technical Evaluation:</strong> Our coaches
                  will screen your playing background against current squad vacancies within 3-5
                  business days.
                </p>
                <p>
                  <strong className="text-white">2. Trial Invitation:</strong> Eligible
                  candidates will receive an email and SMS with date, venue floodlight timing,
                  and training kit requirements.
                </p>
                <p>
                  <strong className="text-white">3. On-Pitch Assessment:</strong> Join us for
                  technical drills, small-sided games, and speed/agility evaluations.
                </p>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#a8ec56] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2">
                  <span>RETURN TO HOMEPAGE</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                onPress={handleReset}
                variant="outline"
                className="w-full sm:w-auto bg-transparent border border-white/15 text-white hover:border-[#B9F66B]/50 hover:text-[#B9F66B] font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>SUBMIT ANOTHER APPLICATION</span>
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
                  <span>STEP 01</span>
                  <User className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">SUBMIT APPLICATION</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  Provide your playing background, preferred role, and contact information.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[#B9F66B] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>STEP 02</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">COACHING REVIEW</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  Our technical staff evaluates each applicant for age-group squad placement.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[#B9F66B] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span>STEP 03</span>
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-white uppercase">TRIAL INVITATION</h3>
                <p className="text-[11px] text-[#A4B0A8] leading-tight">
                  Selected candidates are invited for full on-pitch trial sessions under floodlights.
                </p>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="rounded-3xl bg-[#18251F] border border-white/10 p-6 sm:p-10 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  PLAYER APPLICATION FORM
                </h2>
                <p className="text-xs sm:text-sm text-[#A4B0A8]">
                  All fields marked with <span className="text-[#B9F66B]">*</span> are required.
                  Your information is kept secure and reviewed strictly by our academy staff.
                </p>
              </div>

              {/* Server / Global Error Banner */}
              {submitError && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-300">
                      Application Submission Error
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
                    FULL NAME <span className="text-[#B9F66B]">*</span>
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
                      placeholder="e.g. Liam Vance"
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
                      EMAIL ADDRESS <span className="text-[#B9F66B]">*</span>
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
                        placeholder="e.g. liam.vance@example.com"
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
                        Trial invitations will be sent to this email
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      CONTACT PHONE <span className="text-[#B9F66B]">*</span>
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
                        placeholder="e.g. +44 7911 123456"
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
                        Player or parent/guardian contact number
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
                        DATE OF BIRTH <span className="text-[#B9F66B]">*</span>
                      </label>
                      {calculatedAge !== null && (
                        <span className="text-[11px] font-mono font-bold text-[#B9F66B]">
                          Age: {calculatedAge} years old
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
                        PREFERRED POSITION <span className="text-[#B9F66B]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomPosition(!isCustomPosition)}
                        className="text-[10px] font-mono text-[#B9F66B] hover:underline cursor-pointer"
                      >
                        {isCustomPosition ? "Choose Preset" : "+ Other Position"}
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
                        placeholder="e.g. Left Wing Back / Inverted Winger"
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
                            {pos}
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
                      FOOTBALL PLAYING EXPERIENCE <span className="text-[#B9F66B]">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        experience.length > 450 ? "text-amber-300" : "text-[#A4B0A8]/60"
                      }`}
                    >
                      {experience.length} / 500 characters
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
                    placeholder="Describe your current club, school team, football academies attended, preferred foot, and recent competitive achievements..."
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
                      PERSONAL STATEMENT{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(OPTIONAL)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {message.length} / 1000 characters
                    </span>
                  </div>
                  <textarea
                    id="message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={1000}
                    placeholder="Tell our coaching team about your athletic goals, personal motivations, or why you want to represent Morning Football Academy..."
                    className="w-full bg-[#101A17] border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none focus:border-[#B9F66B]/60 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* 6. Terms Notice */}
                <div className="p-4 rounded-xl bg-[#101A17] border border-white/5 text-[11px] text-[#A4B0A8] leading-relaxed">
                  By submitting this registration, you confirm that the candidate information
                  provided is accurate. Candidates under 18 must have guardian consent for trial
                  participation.
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
                        <span>SUBMITTING TRIAL APPLICATION...</span>
                      </>
                    ) : (
                      <>
                        <span>SUBMIT TRIAL APPLICATION</span>
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
