"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { authClient, useSession } from "../../../lib/auth-client";

/**
 * Admin Login Page
 * Single Admin authentication portal for Morning Football Academy management
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const sessionResult = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // If already authenticated as Admin, automatically redirect to /admin
  useEffect(() => {
    if (!sessionResult?.isPending && sessionResult?.data?.user) {
      router.replace("/admin");
    }
  }, [sessionResult, router]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = "অ্যাডমিন ইমেইল ঠিকানা আবশ্যক";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "সঠিক ইমেইল ঠিকানা প্রদান করুন";
    }

    if (!password) {
      errors.password = "অ্যাডমিন পাসওয়ার্ড আবশ্যক";
    } else if (password.length < 6) {
      errors.password = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ||
            "লগইন ব্যর্থ হয়েছে। আপনার অ্যাডমিন তথ্য পুনরায় যাচাই করুন।"
        );
      } else {
        // Successful authentication: navigate to the protected admin area
        router.push("/admin");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "অথেন্টিকেশন সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। সার্ভার চলমান রয়েছে কি না নিশ্চিত হোন।";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#101A17] text-white overflow-hidden">
      {/* Background Stadium Atmosphere & Green Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/stadium-hero.jpg"
          alt="Morning Football Academy Stadium under floodlights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20 saturate-[1.1] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101A17] via-[#101A17]/90 to-[#101A17]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/10 via-[#18251F]/40 to-transparent blur-3xl" />
      </div>

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Official Academy Crest */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#18251F] border border-[#B9F66B]/40 shadow-[0_0_25px_rgba(185,246,107,0.25)] p-1.5 flex items-center justify-center">
            <Image
              src="/images/logo.jpeg"
              alt="Morning Football Academy Official Crest"
              width={72}
              height={72}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="space-y-1">
            <Chip
              className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.24em] text-[10px] uppercase px-3 py-1 shadow-sm"
            >
              <Shield className="w-3 h-3 text-[#B9F66B] mr-1.5 inline-block" />
              স্টাফ পোর্টাল
            </Chip>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              অ্যাডমিন লগইন।
            </h1>

            <p className="text-xs sm:text-sm text-[#A4B0A8]">
              মর্নিং ফুটবল একাডেমির অনুমোদিত প্রশাসনিক প্রবেশদ্বার।
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-[#202E27] border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.7)] backdrop-blur-md space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-200 text-xs sm:text-sm"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-red-400 block uppercase text-xs tracking-wider">
                  প্রবেশাধিকার ব্যর্থ হয়েছে
                </span>
                <p className="leading-relaxed text-red-200/90">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono font-bold tracking-wider text-[#A4B0A8] uppercase"
              >
                অ্যাডমিন ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A4B0A8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="admin@morningfootball.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#18251F] border text-white text-sm placeholder-[#A4B0A8]/40 focus:outline-none focus:ring-2 focus:ring-[#B9F66B] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    validationErrors.email
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#B9F66B]/50"
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-[11px] text-red-400 font-medium pl-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono font-bold tracking-wider text-[#A4B0A8] uppercase"
              >
                অ্যাডমিন পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A4B0A8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-[#18251F] border text-white text-sm placeholder-[#A4B0A8]/40 focus:outline-none focus:ring-2 focus:ring-[#B9F66B] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    validationErrors.password
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-[#B9F66B]/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  tabIndex={0}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A4B0A8] hover:text-[#B9F66B] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড প্রদর্শন করুন"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-[11px] text-red-400 font-medium pl-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#A4B0A8] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B9F66B] shrink-0" />
              <span>Better Auth সেশন এনক্রিপশন দ্বারা সুরক্ষিত</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isDisabled={isLoading}
                className="w-full bg-[#B9F66B] text-[#0A0A0A] font-black text-xs sm:text-sm tracking-[0.16em] uppercase rounded-full py-3.5 hover:bg-[#cbfd82] active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(185,246,107,0.3)] hover:shadow-[0_0_30px_rgba(185,246,107,0.5)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>অ্যাডমিন পোর্টালে প্রবেশ করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-white/[0.08] text-center">
            <p className="text-[10px] text-[#A4B0A8]/60 font-mono uppercase tracking-widest">
              একক অ্যাডমিনিস্ট্রেটর প্রবেশাধিকার • সাধারণ নিবন্ধন সংরক্ষিত
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
