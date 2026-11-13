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
  Users,
  HeartPulse,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  CreateRegistrationInput,
  RegistrationDocument,
  ApiError,
  Gender,
  DominantFoot,
  ExperienceLevel,
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

const GENDER_OPTIONS = [
  { value: "male", label: "পুরুষ" },
  { value: "female", label: "মহিলা" },
  { value: "other", label: "অন্যান্য" },
];

const DOMINANT_FOOT_OPTIONS = [
  { value: "right", label: "ডান পা" },
  { value: "left", label: "বাম পা" },
  { value: "both", label: "দুই পা-ই" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "beginner", label: "শিক্ষানবিশ (বিগিনার)" },
  { value: "intermediate", label: "মধ্যম (ইন্টারমিডিয়েট)" },
  { value: "advanced", label: "উন্নত (অ্যাডভান্সড)" },
  { value: "professional", label: "পেশাদার" },
];

const fieldInputClass = (hasError: boolean) =>
  `w-full bg-[#101A17] border rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-[#B9F66B]/60"
  }`;

const fieldSelectClass = (hasError: boolean) =>
  `${fieldInputClass(hasError)} cursor-pointer`;

const fieldTextareaClass = (hasError: boolean) =>
  `w-full bg-[#101A17] border rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-[#A4B0A8]/50 focus:outline-none transition-colors resize-none leading-relaxed ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-white/10 focus:border-[#B9F66B]/60"
  }`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-400 font-mono mt-1">{message}</p>;
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

  // Personal Information
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("বাংলাদেশি");
  const [presentAddress, setPresentAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");

  // Guardian & Emergency Contact
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Football Profile
  const [primaryPosition, setPrimaryPosition] = useState(POSITION_OPTIONS[4]);
  const [secondaryPosition, setSecondaryPosition] = useState("");
  const [preferredJerseyNumber, setPreferredJerseyNumber] = useState("");
  const [dominantFoot, setDominantFoot] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Football Experience
  const [experienceLevel, setExperienceLevel] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [previousClub, setPreviousClub] = useState("");
  const [previousTournaments, setPreviousTournaments] = useState("");
  const [achievements, setAchievements] = useState("");
  const [currentInstitution, setCurrentInstitution] = useState("");

  // Health & Additional Information
  const [hasInjury, setHasInjury] = useState<boolean | null>(null);
  const [injuryDetails, setInjuryDetails] = useState("");
  const [allergies, setAllergies] = useState("");
  const [motivation, setMotivation] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedCandidate, setSubmittedCandidate] =
    useState<RegistrationDocument | null>(null);

  // Derived live age preview
  const calculatedAge = calculateAge(dateOfBirth);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

    // 7. Personal Information
    if (!gender) {
      errors.gender = "দয়া করে লিঙ্গ নির্বাচন করুন।";
    }

    const cleanNationality = nationality.trim();
    if (!cleanNationality) {
      errors.nationality = "দয়া করে আপনার জাতীয়তা লিখুন।";
    } else if (cleanNationality.length < 2) {
      errors.nationality = "জাতীয়তা অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanNationality.length > 50) {
      errors.nationality = "জাতীয়তা ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanAddress = presentAddress.trim();
    if (!cleanAddress) {
      errors.presentAddress = "দয়া করে আপনার বর্তমান ঠিকানা লিখুন।";
    } else if (cleanAddress.length < 5) {
      errors.presentAddress = "বর্তমান ঠিকানা অন্তত ৫ অক্ষরের হতে হবে।";
    } else if (cleanAddress.length > 300) {
      errors.presentAddress = "বর্তমান ঠিকানা ৩০০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanDistrict = district.trim();
    if (!cleanDistrict) {
      errors.district = "দয়া করে জেলা লিখুন।";
    } else if (cleanDistrict.length < 2) {
      errors.district = "জেলার নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanDistrict.length > 50) {
      errors.district = "জেলার নাম ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanUpazila = upazila.trim();
    if (!cleanUpazila) {
      errors.upazila = "দয়া করে উপজেলা লিখুন।";
    } else if (cleanUpazila.length < 2) {
      errors.upazila = "উপজেলার নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanUpazila.length > 50) {
      errors.upazila = "উপজেলার নাম ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 8. Guardian & Emergency Contact
    const cleanGuardianName = guardianName.trim();
    if (!cleanGuardianName) {
      errors.guardianName = "দয়া করে অভিভাবকের পুরো নাম লিখুন।";
    } else if (cleanGuardianName.length < 2) {
      errors.guardianName = "অভিভাবকের নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanGuardianName.length > 100) {
      errors.guardianName = "অভিভাবকের নাম ১০০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanGuardianPhone = guardianPhone.trim();
    if (!cleanGuardianPhone) {
      errors.guardianPhone = "দয়া করে অভিভাবকের ফোন নম্বর দিন।";
    } else if (cleanGuardianPhone.length < 6) {
      errors.guardianPhone = "অভিভাবকের ফোন নম্বর অন্তত ৬ ডিজিটের হতে হবে।";
    } else if (cleanGuardianPhone.length > 20) {
      errors.guardianPhone = "অভিভাবকের ফোন নম্বর ২০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanEmergencyName = emergencyContactName.trim();
    if (!cleanEmergencyName) {
      errors.emergencyContactName = "দয়া করে জরুরি যোগাযোগের ব্যক্তির নাম লিখুন।";
    } else if (cleanEmergencyName.length < 2) {
      errors.emergencyContactName = "জরুরি যোগাযোগের নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanEmergencyName.length > 100) {
      errors.emergencyContactName =
        "জরুরি যোগাযোগের নাম ১০০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanEmergencyPhone = emergencyContactPhone.trim();
    if (!cleanEmergencyPhone) {
      errors.emergencyContactPhone = "দয়া করে জরুরি যোগাযোগের ফোন নম্বর দিন।";
    } else if (cleanEmergencyPhone.length < 6) {
      errors.emergencyContactPhone =
        "জরুরি যোগাযোগের ফোন নম্বর অন্তত ৬ ডিজিটের হতে হবে।";
    } else if (cleanEmergencyPhone.length > 20) {
      errors.emergencyContactPhone =
        "জরুরি যোগাযোগের ফোন নম্বর ২০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 9. Football Profile
    const cleanPrimaryPosition = primaryPosition.trim();
    if (!cleanPrimaryPosition) {
      errors.primaryPosition = "দয়া করে প্রধান খেলার পজিশন নির্বাচন করুন।";
    } else if (cleanPrimaryPosition.length < 2) {
      errors.primaryPosition = "প্রধান পজিশন অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanPrimaryPosition.length > 50) {
      errors.primaryPosition = "প্রধান পজিশন ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (secondaryPosition.trim().length > 50) {
      errors.secondaryPosition = "দ্বিতীয় পজিশন ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    const jerseyNumber = parseNumber(preferredJerseyNumber);
    if (jerseyNumber === null) {
      errors.preferredJerseyNumber = "দয়া করে পছন্দের জার্সি নম্বর দিন।";
    } else if (!Number.isInteger(jerseyNumber) || jerseyNumber < 1 || jerseyNumber > 99) {
      errors.preferredJerseyNumber =
        "জার্সি নম্বর ১ থেকে ৯৯ এর মধ্যে পূর্ণসংখ্যা হতে হবে।";
    }

    if (!dominantFoot) {
      errors.dominantFoot = "দয়া করে আপনার শক্তিশালী পা নির্বাচন করুন।";
    }

    const heightValue = parseNumber(height);
    if (heightValue === null) {
      errors.height = "দয়া করে আপনার উচ্চতা (সেন্টিমিটার) দিন।";
    } else if (heightValue < 100 || heightValue > 250) {
      errors.height = "উচ্চতা ১০০ থেকে ২৫০ সেন্টিমিটারের মধ্যে হতে হবে।";
    }

    const weightValue = parseNumber(weight);
    if (weightValue === null) {
      errors.weight = "দয়া করে আপনার ওজন (কেজি) দিন।";
    } else if (weightValue < 25 || weightValue > 200) {
      errors.weight = "ওজন ২৫ থেকে ২০০ কেজির মধ্যে হতে হবে।";
    }

    // 10. Football Experience Details
    if (!experienceLevel) {
      errors.experienceLevel = "দয়া করে আপনার অভিজ্ঞতার স্তর নির্বাচন করুন।";
    }

    const yearsValue = parseNumber(yearsOfExperience);
    if (yearsValue === null) {
      errors.yearsOfExperience = "দয়া করে খেলার অভিজ্ঞতার বছর লিখুন।";
    } else if (!Number.isInteger(yearsValue) || yearsValue < 0 || yearsValue > 50) {
      errors.yearsOfExperience =
        "অভিজ্ঞতার বছর ০ থেকে ৫০ এর মধ্যে পূর্ণসংখ্যা হতে হবে।";
    }

    if (previousClub.trim().length > 200) {
      errors.previousClub = "পূর্ববর্তী ক্লাব/একাডেমির নাম ২০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (previousTournaments.trim().length > 300) {
      errors.previousTournaments =
        "পূর্ববর্তী টুর্নামেন্টের বিবরণ ৩০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (achievements.trim().length > 300) {
      errors.achievements = "অর্জন ও পুরস্কারের বিবরণ ৩০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (currentInstitution.trim().length > 200) {
      errors.currentInstitution =
        "বর্তমান স্কুল/কলেজের নাম ২০০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 11. Health & Additional Information
    if (hasInjury === null) {
      errors.hasInjury = "দয়া করে জানান আপনার বর্তমানে কোনো আঘাত বা শারীরিক সীমাবদ্ধতা আছে কি না।";
    } else if (hasInjury && !injuryDetails.trim()) {
      errors.injuryDetails = "আঘাত বা শারীরিক সীমাবদ্ধতার বিবরণ লিখুন।";
    } else if (injuryDetails.trim().length > 500) {
      errors.injuryDetails = "আঘাতের বিবরণ ৫০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (allergies.trim().length > 500) {
      errors.allergies = "অ্যালার্জি বা স্বাস্থ্য সংক্রান্ত তথ্য ৫০০ অক্ষরের বেশি হতে পারবে না।";
    }

    const cleanMotivation = motivation.trim();
    if (!cleanMotivation) {
      errors.motivation = "দয়া করে একাডেমিতে যোগ দেওয়ার কারণ লিখুন।";
    } else if (cleanMotivation.length < 2) {
      errors.motivation = "যোগ দেওয়ার কারণ অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleanMotivation.length > 1000) {
      errors.motivation = "যোগ দেওয়ার কারণ ১০০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (additionalNotes.trim().length > 1000) {
      errors.additionalNotes = "অতিরিক্ত তথ্য ১০০০ অক্ষরের বেশি হতে পারবে না।";
    }

    // 12. Message: max 1000 (optional)
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
      gender: gender as Gender,
      nationality: nationality.trim(),
      presentAddress: presentAddress.trim(),
      district: district.trim(),
      upazila: upazila.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      primaryPosition: primaryPosition.trim(),
      secondaryPosition: secondaryPosition.trim() || undefined,
      preferredJerseyNumber: Number(preferredJerseyNumber),
      dominantFoot: dominantFoot as DominantFoot,
      height: Number(height),
      weight: Number(weight),
      experienceLevel: experienceLevel as ExperienceLevel,
      yearsOfExperience: Number(yearsOfExperience),
      previousClub: previousClub.trim() || undefined,
      previousTournaments: previousTournaments.trim() || undefined,
      achievements: achievements.trim() || undefined,
      currentInstitution: currentInstitution.trim() || undefined,
      hasInjury: hasInjury === true,
      injuryDetails: hasInjury === true ? injuryDetails.trim() || undefined : undefined,
      allergies: allergies.trim() || undefined,
      motivation: motivation.trim(),
      additionalNotes: additionalNotes.trim() || undefined,
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
          if (Array.isArray(err.details)) {
            const mappedErrors: Record<string, string> = {};
            for (const detail of err.details as Array<{
              field?: string;
              message?: string;
            }>) {
              if (detail.field) {
                mappedErrors[detail.field] = detail.message || "তথ্যটি যাচাই করুন।";
              }
            }
            setFieldErrors(mappedErrors);
          } else {
            setFieldErrors(err.details as Record<string, string>);
          }
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
    setGender("");
    setNationality("বাংলাদেশি");
    setPresentAddress("");
    setDistrict("");
    setUpazila("");
    setGuardianName("");
    setGuardianPhone("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setPrimaryPosition(POSITION_OPTIONS[4]);
    setSecondaryPosition("");
    setPreferredJerseyNumber("");
    setDominantFoot("");
    setHeight("");
    setWeight("");
    setExperienceLevel("");
    setYearsOfExperience("");
    setPreviousClub("");
    setPreviousTournaments("");
    setAchievements("");
    setCurrentInstitution("");
    setHasInjury(null);
    setInjuryDetails("");
    setAllergies("");
    setMotivation("");
    setAdditionalNotes("");
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

                {/* Gender & Nationality Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      লিঙ্গ <span className="text-[#B9F66B]">*</span>
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        clearFieldError("gender");
                      }}
                      disabled={isSubmitting}
                      className={fieldSelectClass(!!fieldErrors.gender)}
                    >
                      <option value="" disabled>
                        লিঙ্গ নির্বাচন করুন
                      </option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.gender} />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label
                      htmlFor="nationality"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      জাতীয়তা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      value={nationality}
                      onChange={(e) => {
                        setNationality(e.target.value);
                        clearFieldError("nationality");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: বাংলাদেশি"
                      className={fieldInputClass(!!fieldErrors.nationality)}
                    />
                    <FieldError message={fieldErrors.nationality} />
                  </div>
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

                {/* Present Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="presentAddress"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      বর্তমান ঠিকানা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(presentAddress.length)} / ৩০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="presentAddress"
                    rows={2}
                    value={presentAddress}
                    onChange={(e) => {
                      setPresentAddress(e.target.value);
                      clearFieldError("presentAddress");
                    }}
                    disabled={isSubmitting}
                    maxLength={300}
                    placeholder="বাসা/রোড, এলাকা, শহর"
                    className={fieldTextareaClass(!!fieldErrors.presentAddress)}
                  />
                  <FieldError message={fieldErrors.presentAddress} />
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

                {/* District & Upazila Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* District */}
                  <div>
                    <label
                      htmlFor="district"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      জেলা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="district"
                      type="text"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        clearFieldError("district");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: ঢাকা"
                      className={fieldInputClass(!!fieldErrors.district)}
                    />
                    <FieldError message={fieldErrors.district} />
                  </div>

                  {/* Upazila */}
                  <div>
                    <label
                      htmlFor="upazila"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      উপজেলা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="upazila"
                      type="text"
                      value={upazila}
                      onChange={(e) => {
                        setUpazila(e.target.value);
                        clearFieldError("upazila");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: ধানমন্ডি"
                      className={fieldInputClass(!!fieldErrors.upazila)}
                    />
                    <FieldError message={fieldErrors.upazila} />
                  </div>
                </div>

                {/* Guardian & Emergency Contact Section */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2">
                  <Users className="w-4 h-4 text-[#B9F66B]" />
                  <h3 className="text-sm font-black text-white tracking-wide">
                    অভিভাবক ও জরুরি যোগাযোগ
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guardian Name */}
                  <div>
                    <label
                      htmlFor="guardianName"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      অভিভাবকের পুরো নাম <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="guardianName"
                      type="text"
                      value={guardianName}
                      onChange={(e) => {
                        setGuardianName(e.target.value);
                        clearFieldError("guardianName");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      className={fieldInputClass(!!fieldErrors.guardianName)}
                    />
                    <FieldError message={fieldErrors.guardianName} />
                  </div>

                  {/* Guardian Phone */}
                  <div>
                    <label
                      htmlFor="guardianPhone"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      অভিভাবকের ফোন নম্বর <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="guardianPhone"
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => {
                        setGuardianPhone(e.target.value);
                        clearFieldError("guardianPhone");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: +৮৮০ ১৭XXXXXXXX"
                      className={fieldInputClass(!!fieldErrors.guardianPhone)}
                    />
                    <FieldError message={fieldErrors.guardianPhone} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Emergency Contact Name */}
                  <div>
                    <label
                      htmlFor="emergencyContactName"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      জরুরি যোগাযোগের ব্যক্তির নাম <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="emergencyContactName"
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => {
                        setEmergencyContactName(e.target.value);
                        clearFieldError("emergencyContactName");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: সাদিয়া আক্তার"
                      className={fieldInputClass(!!fieldErrors.emergencyContactName)}
                    />
                    <FieldError message={fieldErrors.emergencyContactName} />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label
                      htmlFor="emergencyContactPhone"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      জরুরি যোগাযোগের ফোন নম্বর <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="emergencyContactPhone"
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => {
                        setEmergencyContactPhone(e.target.value);
                        clearFieldError("emergencyContactPhone");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: +৮৮০ ১৮XXXXXXXX"
                      className={fieldInputClass(!!fieldErrors.emergencyContactPhone)}
                    />
                    <FieldError message={fieldErrors.emergencyContactPhone} />
                  </div>
                </div>

                {/* Football Profile Section */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2">
                  <Shield className="w-4 h-4 text-[#B9F66B]" />
                  <h3 className="text-sm font-black text-white tracking-wide">
                    ফুটবল প্রোফাইল
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Playing Position */}
                  <div>
                    <label
                      htmlFor="primaryPosition"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      প্রধান খেলার পজিশন <span className="text-[#B9F66B]">*</span>
                    </label>
                    <select
                      id="primaryPosition"
                      value={primaryPosition}
                      onChange={(e) => {
                        setPrimaryPosition(e.target.value);
                        clearFieldError("primaryPosition");
                      }}
                      disabled={isSubmitting}
                      className={fieldSelectClass(!!fieldErrors.primaryPosition)}
                    >
                      {POSITION_OPTIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {getBnPosition(pos)}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.primaryPosition} />
                  </div>

                  {/* Secondary Playing Position */}
                  <div>
                    <label
                      htmlFor="secondaryPosition"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      দ্বিতীয় খেলার পজিশন{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <select
                      id="secondaryPosition"
                      value={secondaryPosition}
                      onChange={(e) => {
                        setSecondaryPosition(e.target.value);
                        clearFieldError("secondaryPosition");
                      }}
                      disabled={isSubmitting}
                      className={fieldSelectClass(!!fieldErrors.secondaryPosition)}
                    >
                      <option value="">প্রযোজ্য নয়</option>
                      {POSITION_OPTIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {getBnPosition(pos)}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.secondaryPosition} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Jersey Number */}
                  <div>
                    <label
                      htmlFor="preferredJerseyNumber"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      পছন্দের জার্সি নম্বর <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="preferredJerseyNumber"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={99}
                      step={1}
                      value={preferredJerseyNumber}
                      onChange={(e) => {
                        setPreferredJerseyNumber(e.target.value);
                        clearFieldError("preferredJerseyNumber");
                      }}
                      disabled={isSubmitting}
                      placeholder="১ - ৯৯"
                      className={fieldInputClass(!!fieldErrors.preferredJerseyNumber)}
                    />
                    <FieldError message={fieldErrors.preferredJerseyNumber} />
                  </div>

                  {/* Dominant Foot */}
                  <div>
                    <label
                      htmlFor="dominantFoot"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      শক্তিশালী পা <span className="text-[#B9F66B]">*</span>
                    </label>
                    <select
                      id="dominantFoot"
                      value={dominantFoot}
                      onChange={(e) => {
                        setDominantFoot(e.target.value);
                        clearFieldError("dominantFoot");
                      }}
                      disabled={isSubmitting}
                      className={fieldSelectClass(!!fieldErrors.dominantFoot)}
                    >
                      <option value="" disabled>
                        শক্তিশালী পা নির্বাচন করুন
                      </option>
                      {DOMINANT_FOOT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.dominantFoot} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Height */}
                  <div>
                    <label
                      htmlFor="height"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      উচ্চতা (সেন্টিমিটার) <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="height"
                      type="number"
                      inputMode="numeric"
                      min={100}
                      max={250}
                      step={1}
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        clearFieldError("height");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: ১৭৫"
                      className={fieldInputClass(!!fieldErrors.height)}
                    />
                    <FieldError message={fieldErrors.height} />
                  </div>

                  {/* Weight */}
                  <div>
                    <label
                      htmlFor="weight"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      ওজন (কেজি) <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="weight"
                      type="number"
                      inputMode="numeric"
                      min={25}
                      max={200}
                      step={1}
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        clearFieldError("weight");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: ৬৫"
                      className={fieldInputClass(!!fieldErrors.weight)}
                    />
                    <FieldError message={fieldErrors.weight} />
                  </div>
                </div>

                {/* Football Experience Section */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2">
                  <Trophy className="w-4 h-4 text-[#B9F66B]" />
                  <h3 className="text-sm font-black text-white tracking-wide">
                    ফুটবল অভিজ্ঞতা
                  </h3>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Experience Level */}
                  <div>
                    <label
                      htmlFor="experienceLevel"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      অভিজ্ঞতার স্তর <span className="text-[#B9F66B]">*</span>
                    </label>
                    <select
                      id="experienceLevel"
                      value={experienceLevel}
                      onChange={(e) => {
                        setExperienceLevel(e.target.value);
                        clearFieldError("experienceLevel");
                      }}
                      disabled={isSubmitting}
                      className={fieldSelectClass(!!fieldErrors.experienceLevel)}
                    >
                      <option value="" disabled>
                        অভিজ্ঞতার স্তর নির্বাচন করুন
                      </option>
                      {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fieldErrors.experienceLevel} />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label
                      htmlFor="yearsOfExperience"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      খেলার অভিজ্ঞতা (বছর) <span className="text-[#B9F66B]">*</span>
                    </label>
                    <input
                      id="yearsOfExperience"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50}
                      step={1}
                      value={yearsOfExperience}
                      onChange={(e) => {
                        setYearsOfExperience(e.target.value);
                        clearFieldError("yearsOfExperience");
                      }}
                      disabled={isSubmitting}
                      placeholder="যেমন: ৩"
                      className={fieldInputClass(!!fieldErrors.yearsOfExperience)}
                    />
                    <FieldError message={fieldErrors.yearsOfExperience} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Previous Club / Academy */}
                  <div>
                    <label
                      htmlFor="previousClub"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      পূর্ববর্তী ক্লাব বা একাডেমি{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <input
                      id="previousClub"
                      type="text"
                      value={previousClub}
                      onChange={(e) => {
                        setPreviousClub(e.target.value);
                        clearFieldError("previousClub");
                      }}
                      disabled={isSubmitting}
                      placeholder="না থাকলে খালি রাখুন"
                      className={fieldInputClass(!!fieldErrors.previousClub)}
                    />
                    <FieldError message={fieldErrors.previousClub} />
                  </div>

                  {/* Current School / College */}
                  <div>
                    <label
                      htmlFor="currentInstitution"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5"
                    >
                      বর্তমান স্কুল বা কলেজ{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <input
                      id="currentInstitution"
                      type="text"
                      value={currentInstitution}
                      onChange={(e) => {
                        setCurrentInstitution(e.target.value);
                        clearFieldError("currentInstitution");
                      }}
                      disabled={isSubmitting}
                      placeholder="প্রতিষ্ঠানের নাম"
                      className={fieldInputClass(!!fieldErrors.currentInstitution)}
                    />
                    <FieldError message={fieldErrors.currentInstitution} />
                  </div>
                </div>

                {/* Previous Tournaments */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="previousTournaments"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      পূর্ববর্তী টুর্নামেন্টে অংশগ্রহণ{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(previousTournaments.length)} / ৩০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="previousTournaments"
                    rows={2}
                    value={previousTournaments}
                    onChange={(e) => {
                      setPreviousTournaments(e.target.value);
                      clearFieldError("previousTournaments");
                    }}
                    disabled={isSubmitting}
                    maxLength={300}
                    placeholder="অংশগ্রহণ করা টুর্নামেন্টের নাম ও সাল লিখুন"
                    className={fieldTextareaClass(!!fieldErrors.previousTournaments)}
                  />
                  <FieldError message={fieldErrors.previousTournaments} />
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="achievements"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      অর্জন ও পুরস্কার{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(achievements.length)} / ৩০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="achievements"
                    rows={2}
                    value={achievements}
                    onChange={(e) => {
                      setAchievements(e.target.value);
                      clearFieldError("achievements");
                    }}
                    disabled={isSubmitting}
                    maxLength={300}
                    placeholder="উল্লেখযোগ্য অর্জন বা পুরস্কারের বিবরণ"
                    className={fieldTextareaClass(!!fieldErrors.achievements)}
                  />
                  <FieldError message={fieldErrors.achievements} />
                </div>

                {/* Health & Additional Information Section */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 pt-2">
                  <HeartPulse className="w-4 h-4 text-[#B9F66B]" />
                  <h3 className="text-sm font-black text-white tracking-wide">
                    স্বাস্থ্য ও অতিরিক্ত তথ্য
                  </h3>
                </div>

                {/* Current Injury or Physical Limitation */}
                <div>
                  <label className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block mb-1.5">
                    বর্তমানে কোনো আঘাত বা শারীরিক সীমাবদ্ধতা আছে?{" "}
                    <span className="text-[#B9F66B]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm cursor-pointer transition-colors ${
                        hasInjury === false
                          ? "border-[#B9F66B] bg-[#B9F66B]/10 text-[#B9F66B]"
                          : "border-white/10 bg-[#101A17] text-[#A4B0A8] hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="hasInjury"
                        checked={hasInjury === false}
                        onChange={() => {
                          setHasInjury(false);
                          setInjuryDetails("");
                          clearFieldError("hasInjury");
                          clearFieldError("injuryDetails");
                        }}
                        disabled={isSubmitting}
                        className="sr-only"
                      />
                      <span
                        className={`w-3.5 h-3.5 rounded-full border ${
                          hasInjury === false
                            ? "border-[#B9F66B] bg-[#B9F66B]"
                            : "border-white/30"
                        }`}
                      />
                      <span>না</span>
                    </label>

                    <label
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm cursor-pointer transition-colors ${
                        hasInjury === true
                          ? "border-[#B9F66B] bg-[#B9F66B]/10 text-[#B9F66B]"
                          : "border-white/10 bg-[#101A17] text-[#A4B0A8] hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="hasInjury"
                        checked={hasInjury === true}
                        onChange={() => {
                          setHasInjury(true);
                          clearFieldError("hasInjury");
                        }}
                        disabled={isSubmitting}
                        className="sr-only"
                      />
                      <span
                        className={`w-3.5 h-3.5 rounded-full border ${
                          hasInjury === true
                            ? "border-[#B9F66B] bg-[#B9F66B]"
                            : "border-white/30"
                        }`}
                      />
                      <span>হ্যাঁ</span>
                    </label>
                  </div>
                  <FieldError message={fieldErrors.hasInjury} />
                </div>

                {/* Injury Details (conditional) */}
                {hasInjury === true && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="injuryDetails"
                        className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                      >
                        আঘাত বা শারীরিক সীমাবদ্ধতার বিবরণ{" "}
                        <span className="text-[#B9F66B]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                        {toBnNum(injuryDetails.length)} / ৫০০ অক্ষর
                      </span>
                    </div>
                    <textarea
                      id="injuryDetails"
                      rows={3}
                      value={injuryDetails}
                      onChange={(e) => {
                        setInjuryDetails(e.target.value);
                        clearFieldError("injuryDetails");
                      }}
                      disabled={isSubmitting}
                      maxLength={500}
                      placeholder="আঘাতের ধরন, কখন হয়েছে এবং বর্তমান অবস্থা লিখুন"
                      className={fieldTextareaClass(!!fieldErrors.injuryDetails)}
                    />
                    <FieldError message={fieldErrors.injuryDetails} />
                  </div>
                )}

                {/* Allergies / Health Restrictions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="allergies"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      অ্যালার্জি বা স্বাস্থ্য সংক্রান্ত নিষেধাজ্ঞা{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(allergies.length)} / ৫০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="allergies"
                    rows={2}
                    value={allergies}
                    onChange={(e) => {
                      setAllergies(e.target.value);
                      clearFieldError("allergies");
                    }}
                    disabled={isSubmitting}
                    maxLength={500}
                    placeholder="যেমন: ধুলা/পরাগে অ্যালার্জি, নির্দিষ্ট কোনো খাবারে সমস্যা"
                    className={fieldTextareaClass(!!fieldErrors.allergies)}
                  />
                  <FieldError message={fieldErrors.allergies} />
                </div>

                {/* Motivation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="motivation"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      কেন আপনি মর্নিং ফুটবল একাডেমিতে যোগ দিতে চান?{" "}
                      <span className="text-[#B9F66B]">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        motivation.length > 900 ? "text-amber-300" : "text-[#A4B0A8]/60"
                      }`}
                    >
                      {toBnNum(motivation.length)} / ১০০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="motivation"
                    rows={3}
                    value={motivation}
                    onChange={(e) => {
                      setMotivation(e.target.value);
                      clearFieldError("motivation");
                    }}
                    disabled={isSubmitting}
                    maxLength={1000}
                    placeholder="আপনার ফুটবলীয় লক্ষ্য এবং একাডেমিতে যোগ দেওয়ার কারণ লিখুন"
                    className={fieldTextareaClass(!!fieldErrors.motivation)}
                  />
                  <FieldError message={fieldErrors.motivation} />
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

                {/* Additional Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="additionalNotes"
                      className="text-xs font-mono text-[#A4B0A8] uppercase tracking-wider block"
                    >
                      অতিরিক্ত তথ্য{" "}
                      <span className="text-[#A4B0A8]/60 font-normal">(ঐচ্ছিক)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#A4B0A8]/60">
                      {toBnNum(additionalNotes.length)} / ১০০০ অক্ষর
                    </span>
                  </div>
                  <textarea
                    id="additionalNotes"
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => {
                      setAdditionalNotes(e.target.value);
                      clearFieldError("additionalNotes");
                    }}
                    disabled={isSubmitting}
                    maxLength={1000}
                    placeholder="অন্যান্য কোনো তথ্য যা আমাদের জানানো প্রয়োজন"
                    className={fieldTextareaClass(!!fieldErrors.additionalNotes)}
                  />
                  <FieldError message={fieldErrors.additionalNotes} />
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
