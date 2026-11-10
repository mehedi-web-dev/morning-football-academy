"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Search,
  Filter,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  AlertCircle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
  Sparkles,
  Award,
} from "lucide-react";
import { Button, Chip } from "@heroui/react";
import {
  apiClient,
  RegistrationDocument,
  RegistrationStatus,
  PaginationMeta,
  ApiError,
} from "../../../lib/api-client";
import RegistrationDetailsModal from "../../../components/admin/RegistrationDetailsModal";
import StatusChangeModal from "../../../components/admin/StatusChangeModal";
import DeleteRegistrationModal from "../../../components/admin/DeleteRegistrationModal";

const STATUS_FILTERS: { label: string; value: "ALL" | RegistrationStatus }[] = [
  { label: "ALL STATUS", value: "ALL" },
  { label: "PENDING REVIEW", value: "pending" },
  { label: "ACCEPTED", value: "approved" },
  { label: "REJECTED", value: "rejected" },
];

/**
 * Calculate age accurately from date of birth
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
 * Escape CSV string according to RFC 4180
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Admin Registrations Management Page (CRUD & Workflow)
 * Fully connected to MongoDB through Express backend Registration REST APIs
 */
export default function AdminRegistrationsPage() {
  // Query Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | RegistrationStatus>("ALL");
  const [positionFilter, setPositionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Data & Async State
  const [registrations, setRegistrations] = useState<RegistrationDocument[]>([]);
  const [allMetricsRegistrations, setAllMetricsRegistrations] = useState<RegistrationDocument[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Modals & Action State
  const [selectedForDetails, setSelectedForDetails] = useState<RegistrationDocument | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    registration: RegistrationDocument;
    targetStatus: RegistrationStatus;
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<RegistrationDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load all registrations for pipeline metrics banner
  const loadMetricsData = useCallback(() => {
    apiClient.registrations
      .getAll({ limit: 500, sortBy: "createdAt", sortOrder: "desc" })
      .then((res) => {
        setAllMetricsRegistrations(res.data || []);
      })
      .catch(() => {
        setAllMetricsRegistrations([]);
      });
  }, []);

  // Fetch paginated registrations from backend API
  const loadRegistrations = useCallback(
    (abortSignal?: { aborted: boolean }) => {
      const statusParam = selectedStatus === "ALL" ? undefined : selectedStatus;
      const searchParam = searchTerm.trim() || undefined;

      apiClient.registrations
        .getAll({
          page,
          limit,
          status: statusParam,
          search: searchParam,
          sortBy: "createdAt",
          sortOrder,
        })
        .then((response) => {
          if (!abortSignal?.aborted) {
            setRegistrations(response.data || []);
            setPagination(response.pagination || null);
            setError(null);
            setIsAuthError(false);
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!abortSignal?.aborted) {
            if (err instanceof ApiError) {
              setError(err.message);
              setIsAuthError(err.isAuthError);
            } else {
              setError("Failed to fetch registrations from database.");
            }
            setIsLoading(false);
          }
        });
    },
    [page, limit, selectedStatus, searchTerm, sortOrder]
  );

  // Initial load and parameter updates
  useEffect(() => {
    const signal = { aborted: false };
    loadRegistrations(signal);
    loadMetricsData();
    return () => {
      signal.aborted = true;
    };
  }, [loadRegistrations, loadMetricsData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    loadRegistrations();
    loadMetricsData();
  };

  // Status Change Workflow Trigger
  const handleOpenStatusChange = (
    registration: RegistrationDocument,
    targetStatus: RegistrationStatus
  ) => {
    setStatusChangeTarget({ registration, targetStatus });
  };

  // Confirm Status Change
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setIsUpdatingStatus(true);

    const { registration, targetStatus } = statusChangeTarget;

    try {
      const res = await apiClient.registrations.updateStatus(
        registration._id,
        targetStatus
      );

      // If details modal is open with this registration, update it
      if (selectedForDetails && selectedForDetails._id === registration._id) {
        setSelectedForDetails(res.data);
      }

      setNotification({
        type: "success",
        message: `Application for ${registration.fullName} updated to ${targetStatus.toUpperCase()}.`,
      });
      setStatusChangeTarget(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Failed to update registration status.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Workflow
  const handleOpenDelete = (registration: RegistrationDocument) => {
    setRegistrationToDelete(registration);
  };

  const handleConfirmDelete = async () => {
    if (!registrationToDelete) return;
    setIsDeleting(true);

    try {
      await apiClient.registrations.delete(registrationToDelete._id);
      setNotification({
        type: "success",
        message: `Application for ${registrationToDelete.fullName} deleted successfully.`,
      });

      if (selectedForDetails?._id === registrationToDelete._id) {
        setSelectedForDetails(null);
      }

      setRegistrationToDelete(null);
      if (registrations.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        handleRefresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Failed to delete registration record.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export Engine
  const handleExportCsv = async () => {
    setIsExporting(true);
    const statusParam = selectedStatus === "ALL" ? undefined : selectedStatus;
    const searchParam = searchTerm.trim() || undefined;

    try {
      // Fetch up to 1000 matching records to export complete matching dataset
      const res = await apiClient.registrations.getAll({
        page: 1,
        limit: 1000,
        status: statusParam,
        search: searchParam,
        sortBy: "createdAt",
        sortOrder,
      });

      const recordsToExport = res.data || [];

      if (recordsToExport.length === 0) {
        setNotification({
          type: "error",
          message: "No registration records available to export.",
        });
        return;
      }

      // Filter by position client-side if a specific position is selected
      const filteredRecords = positionFilter
        ? recordsToExport.filter((r) =>
            r.position.toLowerCase().includes(positionFilter.toLowerCase())
          )
        : recordsToExport;

      // Build CSV Header & Rows
      const headers = [
        "Full Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Age",
        "Preferred Position",
        "Football Experience",
        "Application Message",
        "Status",
        "Submission Date",
      ];

      const rows = filteredRecords.map((r) => [
        escapeCsv(r.fullName),
        escapeCsv(r.email),
        escapeCsv(r.phone),
        escapeCsv(r.dateOfBirth ? r.dateOfBirth.split("T")[0] : ""),
        escapeCsv(calculateAge(r.dateOfBirth)),
        escapeCsv(r.position),
        escapeCsv(r.experience),
        escapeCsv(r.message || ""),
        escapeCsv(r.status.toUpperCase()),
        escapeCsv(r.createdAt ? r.createdAt.replace("T", " ").slice(0, 19) : ""),
      ]);

      const csvContent =
        "\uFEFF" + // UTF-8 Byte Order Mark for Excel
        headers.join(",") +
        "\n" +
        rows.map((row) => row.join(",")).join("\n");

      // Create download blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `mfa-registrations-${selectedStatus.toLowerCase()}-${timestamp}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotification({
        type: "success",
        message: `Successfully exported ${filteredRecords.length} registration records to CSV.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Failed to export registrations to CSV.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsExporting(false);
    }
  };

  // Distinct positions for position filter
  const distinctPositions = useMemo(() => {
    const pos = new Set<string>();
    allMetricsRegistrations.forEach((r) => {
      if (r.position && r.position.trim()) {
        pos.add(r.position.trim());
      }
    });
    return Array.from(pos).sort();
  }, [allMetricsRegistrations]);

  // Client-side position filtering
  const filteredRegistrations = useMemo(() => {
    if (!positionFilter) return registrations;
    return registrations.filter((r) =>
      r.position.toLowerCase().includes(positionFilter.toLowerCase())
    );
  }, [registrations, positionFilter]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    const source =
      allMetricsRegistrations.length > 0
        ? allMetricsRegistrations
        : registrations;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    source.forEach((r) => {
      if (r.status === "pending") pending++;
      else if (r.status === "approved") approved++;
      else if (r.status === "rejected") rejected++;
    });

    const total = source.length;
    const decided = approved + rejected;
    const acceptanceRate =
      decided > 0 ? Math.round((approved / decided) * 100) : 0;

    return { total, pending, approved, rejected, acceptanceRate };
  }, [allMetricsRegistrations, registrations]);

  const totalCount = pagination?.total ?? registrations.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Chip className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.2em] text-[10px] uppercase px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              TRIAL PIPELINE
            </Chip>
            <span className="text-[11px] font-mono text-[#A4B0A8]">
              {metrics.pending} PENDING REVIEWS • {totalCount} TOTAL APPLICANTS
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            ENROLLMENT REGISTRATIONS.
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B0A8]">
            Review trialist applications, evaluate candidate football backgrounds, and manage admission workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* CSV Export Button */}
          <Button
            onPress={handleExportCsv}
            isDisabled={isExporting || totalCount === 0}
            className="bg-white/[0.04] border border-white/10 hover:border-[#B9F66B]/50 text-white hover:text-[#B9F66B] font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>EXPORTING...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#B9F66B]" />
                <span>EXPORT CSV</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Floating / Inline Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg transition-all animate-fade-in ${
            notification.type === "success"
              ? "bg-[#18251F] border-[#B9F66B]/40 text-[#B9F66B]"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#B9F66B]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            )}
            <p className="text-xs sm:text-sm font-medium text-white">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Pipeline Metrics Highlights Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Applicants */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              TOTAL APPLICANTS
            </span>
            <User className="w-3.5 h-3.5 text-[#A4B0A8]/40" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {metrics.total}
          </span>
          <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
            Candidate submissions
          </span>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-amber-400/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
              PENDING EVALUATION
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 block">
            {metrics.pending}
          </span>
          <span className="text-[10px] text-amber-300/70 block font-mono">
            Requires staff review
          </span>
        </div>

        {/* Accepted / Approved */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-[#B9F66B]/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#B9F66B] uppercase tracking-wider block">
              ACCEPTED / TRIAL
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B9F66B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#B9F66B] block">
            {metrics.approved}
          </span>
          <span className="text-[10px] text-[#B9F66B]/70 block font-mono">
            Approved for intake
          </span>
        </div>

        {/* Declined */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-rose-500/20 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
              DECLINED
            </span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 block">
            {metrics.rejected}
          </span>
          <span className="text-[10px] text-rose-400/70 block font-mono">
            Ineligible this batch
          </span>
        </div>

        {/* Acceptance Rate */}
        <div className="p-4 rounded-xl bg-[#18251F] border border-white/10 space-y-1 col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#A4B0A8] uppercase tracking-wider block">
              ACCEPTANCE RATE
            </span>
            <Award className="w-3.5 h-3.5 text-[#B9F66B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {metrics.acceptanceRate}%
          </span>
          <span className="text-[10px] text-[#A4B0A8]/70 block font-mono">
            Of decided applicants
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Name, Email, or Phone Search (Server-side API search parameter) */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A4B0A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applicants by name, email address, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101A17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A4B0A8]/60 focus:outline-none focus:border-[#B9F66B]/50 transition-colors"
          />
        </div>

        {/* Position Filter, Status Filter Chips & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Position Selector */}
          {distinctPositions.length > 0 && (
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-[#101A17] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#A4B0A8] hover:text-white focus:text-white focus:outline-none focus:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <option value="">All Positions</option>
              {distinctPositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#A4B0A8] mr-1 shrink-0 hidden sm:block" />
            {STATUS_FILTERS.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(st.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  selectedStatus === st.value
                    ? "bg-[#B9F66B] text-[#101A17] font-black shadow-sm"
                    : "bg-[#202E27] text-[#A4B0A8] hover:text-white border border-white/5"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
            className="px-2.5 py-1.5 rounded-xl bg-[#202E27] border border-white/10 text-[10px] font-mono text-[#A4B0A8] hover:text-white transition-colors cursor-pointer"
          >
            {sortOrder === "desc" ? "LATEST" : "OLDEST"}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh list"
            className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-[#A4B0A8] hover:text-white hover:border-[#B9F66B]/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B9F66B]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 4. Registrations List / Table */}
      {error ? (
        /* Error State */
        <div className="p-8 rounded-2xl bg-[#18251F] border border-red-500/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Failed to load applicant registrations
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-md mx-auto">{error}</p>
          </div>
          {isAuthError ? (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B9F66B] text-[#101A17] font-black text-xs uppercase tracking-wider hover:bg-[#a8ec56] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in to Admin</span>
            </Link>
          ) : (
            <Button
              onPress={handleRefresh}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              Retry
            </Button>
          )}
        </div>
      ) : isLoading && registrations.length === 0 ? (
        /* Loading Skeletons */
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#202E27] border border-white/5 animate-pulse flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 w-full">
                <div className="h-5 w-48 bg-white/5 rounded" />
                <div className="h-3 w-80 bg-white/5 rounded" />
              </div>
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <div className="h-8 w-24 bg-white/5 rounded-xl" />
                <div className="h-8 w-24 bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-[#18251F] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#101A17] border border-white/10 flex items-center justify-center mx-auto text-[#A4B0A8]">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {searchTerm || selectedStatus !== "ALL" || positionFilter
                ? "No matching applicants found"
                : "No registration applications received yet"}
            </h3>
            <p className="text-xs text-[#A4B0A8] max-w-sm mx-auto">
              {searchTerm || selectedStatus !== "ALL" || positionFilter
                ? "Try clearing your filters or searching for another applicant name or contact."
                : "New academy enrollment submissions from the public website will appear here automatically for review."}
            </p>
          </div>
          {searchTerm || selectedStatus !== "ALL" || positionFilter ? (
            <Button
              onPress={() => {
                setSearchTerm("");
                setSelectedStatus("ALL");
                setPositionFilter("");
              }}
              className="bg-[#202E27] border border-white/10 text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              Reset Filters
            </Button>
          ) : null}
        </div>
      ) : (
        /* Applicant Cards List */
        <div className="space-y-3">
          {filteredRegistrations.map((reg) => {
            const age = calculateAge(reg.dateOfBirth);

            return (
              <div
                key={reg._id}
                className="p-4 sm:p-5 rounded-2xl bg-[#202E27] border border-white/10 hover:border-[#B9F66B]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left: Applicant Details */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Status Badge */}
                  <div className="w-36 shrink-0">
                    {reg.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        PENDING
                      </span>
                    )}
                    {reg.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B9F66B]/15 text-[#B9F66B] border border-[#B9F66B]/30 text-[10px] font-mono font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
                        ACCEPTED
                      </span>
                    )}
                    {reg.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        REJECTED
                      </span>
                    )}
                  </div>

                  {/* Candidate Bio & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-base font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors">
                        {reg.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#101A17] border border-white/10 text-[10px] font-mono text-[#B9F66B] font-bold">
                        Age {age}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#101A17] border border-white/10 text-[10px] font-mono text-white/90">
                        {reg.position}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A4B0A8]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#B9F66B]/70" />
                        <span className="truncate max-w-[200px]">{reg.email}</span>
                      </div>

                      <span className="text-white/20 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-[#A4B0A8]" />
                        <span>{reg.phone}</span>
                      </div>

                      <span className="text-white/20 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#A4B0A8]" />
                        <span>Applied {formatDate(reg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 pt-2 lg:pt-0 border-t border-white/5 lg:border-t-0 w-full lg:w-auto justify-end">
                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedForDetails(reg)}
                    title="View complete application profile"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white hover:text-[#B9F66B] hover:border-[#B9F66B]/40 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#B9F66B]" />
                    <span>DETAILS</span>
                  </button>

                  {/* Quick Approve (If Pending or Rejected) */}
                  {reg.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(reg, "approved")}
                      title="Approve candidate for academy trials"
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#B9F66B]/15 border border-[#B9F66B]/30 text-xs font-mono text-[#B9F66B] hover:bg-[#B9F66B] hover:text-[#101A17] transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ACCEPT</span>
                    </button>
                  )}

                  {/* Quick Reject (If Pending or Approved) */}
                  {reg.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleOpenStatusChange(reg, "rejected")}
                      title="Decline applicant"
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">DECLINE</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(reg)}
                    title="Delete registration record"
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination & Page Size */}
      {totalCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#18251F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A4B0A8] font-mono">
              Showing{" "}
              <strong className="text-white">
                {Math.min((page - 1) * limit + 1, totalCount)}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(page * limit, totalCount)}
              </strong>{" "}
              of <strong className="text-white">{totalCount}</strong> applicants
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span className="text-[11px] text-[#A4B0A8] font-mono uppercase">
                Per page:
              </span>
              {[8, 12, 24].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setLimit(sz);
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                    limit === sz
                      ? "bg-[#B9F66B] text-[#101A17] font-black"
                      : "text-[#A4B0A8] hover:text-white bg-white/5"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              isDisabled={page <= 1 || isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs font-mono text-[#A4B0A8] px-2">
              Page <strong className="text-white">{page}</strong> of{" "}
              <strong className="text-white">{totalPages}</strong>
            </span>

            <Button
              onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              isDisabled={page >= totalPages || isLoading}
              className="p-2 rounded-xl bg-[#202E27] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B9F66B]/50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 6. Live Database Integration Notice */}
      <div className="p-4 rounded-xl bg-[#18251F]/60 border border-white/5 text-center">
        <p className="text-[11px] font-mono text-[#A4B0A8]/70 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B9F66B]" />
          <span>
            Connected to MongoDB Registrations collection via Express REST API. Status changes update trialist records in real time.
          </span>
        </p>
      </div>

      {/* Complete Registration Details Modal */}
      <RegistrationDetailsModal
        isOpen={Boolean(selectedForDetails)}
        onClose={() => setSelectedForDetails(null)}
        registration={selectedForDetails}
        onStatusChange={(reg, targetStatus) => {
          handleOpenStatusChange(reg, targetStatus);
        }}
        onDelete={(reg) => {
          handleOpenDelete(reg);
        }}
      />

      {/* Status Change Confirmation Modal */}
      <StatusChangeModal
        isOpen={Boolean(statusChangeTarget)}
        onClose={() => setStatusChangeTarget(null)}
        registration={statusChangeTarget?.registration ?? null}
        targetStatus={statusChangeTarget?.targetStatus ?? null}
        onConfirm={handleConfirmStatusChange}
        isUpdating={isUpdatingStatus}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRegistrationModal
        isOpen={Boolean(registrationToDelete)}
        onClose={() => setRegistrationToDelete(null)}
        registration={registrationToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
