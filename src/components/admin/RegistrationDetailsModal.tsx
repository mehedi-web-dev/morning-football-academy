"use client";

import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@heroui/react";
import { RegistrationDocument, RegistrationStatus } from "../../lib/api-client";

interface RegistrationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationDocument | null;
  onStatusChange: (
    registration: RegistrationDocument,
    newStatus: RegistrationStatus
  ) => void;
  onDelete: (registration: RegistrationDocument) => void;
}

/**
 * Accurately calculate age from date of birth
 */
function calculateAge(dobStr: string): number {
  try {
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  } catch {
    return 0;
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format datetime for submission timestamp
 */
function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Status badge helper
 */
function getStatusBadge(status: RegistrationStatus) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          PENDING REVIEW
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-xs font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
          ACCEPTED / APPROVED
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-mono font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          REJECTED
        </span>
      );
  }
}

/**
 * RegistrationDetailsModal Component
 * Comprehensive applicant profile view with workflow action controls
 */
export default function RegistrationDetailsModal({
  isOpen,
  onClose,
  registration,
  onStatusChange,
  onDelete,
}: RegistrationDetailsModalProps) {
  if (!isOpen || !registration) return null;

  const age = calculateAge(registration.dateOfBirth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#18251F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#101A17]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202E27] border border-white/10 flex items-center justify-center text-[#B9F66B]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {registration.fullName}
                </h2>
                {getStatusBadge(registration.status)}
              </div>
              <p className="text-[11px] text-[#A4B0A8] font-mono mt-0.5">
                Applicant ID: {registration._id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A4B0A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. Core Profile & Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Preferred Position */}
            <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                PREFERRED POSITION
              </span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#B9F66B]" />
                <span className="text-sm font-black text-white uppercase">
                  {registration.position}
                </span>
              </div>
            </div>

            {/* Date of Birth & Age */}
            <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                DATE OF BIRTH & AGE
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B9F66B]" />
                <span className="text-sm font-black text-white">
                  {formatDate(registration.dateOfBirth)}{" "}
                  <span className="text-xs font-mono font-normal text-[#B9F66B]">
                    ({age} years old)
                  </span>
                </span>
              </div>
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                EMAIL ADDRESS
              </span>
              <a
                href={`mailto:${registration.email}`}
                className="flex items-center gap-2 text-xs font-mono text-white hover:text-[#B9F66B] transition-colors group truncate"
              >
                <Mail className="w-3.5 h-3.5 text-[#B9F66B] shrink-0" />
                <span className="truncate">{registration.email}</span>
                <ExternalLink className="w-3 h-3 text-[#A4B0A8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-xl bg-[#101A17] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
                PHONE NUMBER
              </span>
              <a
                href={`tel:${registration.phone}`}
                className="flex items-center gap-2 text-xs font-mono text-white hover:text-[#B9F66B] transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-[#B9F66B] shrink-0" />
                <span>{registration.phone}</span>
                <ExternalLink className="w-3 h-3 text-[#A4B0A8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
          </div>

          {/* 2. Football Experience */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>FOOTBALL BACKGROUND & PLAYING EXPERIENCE</span>
            </span>
            <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
              {registration.experience}
            </div>
          </div>

          {/* 3. Applicant Personal Statement / Message */}
          {registration.message && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B9F66B]" />
                <span>APPLICANT PERSONAL STATEMENT</span>
              </span>
              <div className="p-4 rounded-xl bg-[#101A17] border border-white/10 text-xs sm:text-sm text-white/80 italic leading-relaxed whitespace-pre-wrap">
                &ldquo;{registration.message}&rdquo;
              </div>
            </div>
          )}

          {/* 4. Submission & System Metadata */}
          <div className="p-3.5 rounded-xl bg-[#202E27]/50 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#A4B0A8]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B9F66B]" />
              <span>Applied: {formatDateTime(registration.createdAt)}</span>
            </div>
            {registration.updatedAt && (
              <span>Last Evaluated: {formatDateTime(registration.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Modal Footer / Workflow Action Buttons */}
        <div className="px-5 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#101A17]/70 shrink-0">
          {/* Left Action: Delete */}
          <button
            type="button"
            onClick={() => onDelete(registration)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DELETE APPLICANT</span>
          </button>

          {/* Right Actions: Workflow Status Change */}
          <div className="flex items-center gap-2">
            {registration.status !== "approved" && (
              <Button
                onPress={() => onStatusChange(registration, "approved")}
                className="bg-[#B9F66B] hover:bg-[#a8ec56] text-[#101A17] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ACCEPT / APPROVE</span>
              </Button>
            )}

            {registration.status !== "rejected" && (
              <Button
                onPress={() => onStatusChange(registration, "rejected")}
                className="bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </Button>
            )}

            {registration.status !== "pending" && (
              <Button
                onPress={() => onStatusChange(registration, "pending")}
                className="bg-white/5 hover:bg-white/10 text-[#A4B0A8] hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SET PENDING</span>
              </Button>
            )}

            <Button
              onPress={onClose}
              className="bg-[#202E27] border border-white/10 text-white hover:border-white/20 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              CLOSE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
