import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient, FriendlySeriesDetailResponse } from "../../../lib/api-client";
import { formatBnDate, getBnFriendlySeriesFormat } from "../../../lib/bn-utils";
import FriendlySeriesDetailClient from "../../../components/friendly-series/FriendlySeriesDetailClient";

export const instant = false;

interface FriendlySeriesDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: FriendlySeriesDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient.friendlySeries.getBySlug(slug);
    const detail = res.data;

    if (!detail || !detail.series) {
      return {
        title: "ফ্রেন্ডলি সিরিজ পাওয়া যায়নি | Morning Football Academy",
      };
    }

    const { series, teamA, teamB } = detail;
    const titleStr = `${series.name} (${teamA?.name || "দল ১"} বনাম ${teamB?.name || "দল ২"})`;
    const formatStr = getBnFriendlySeriesFormat(series.format);
    const dateRange = series.startDate
      ? `${formatBnDate(series.startDate)}${
          series.endDate ? ` – ${formatBnDate(series.endDate)}` : ""
        }`
      : "";

    return {
      title: `${titleStr} | Morning Football Academy ফ্রেন্ডলি সিরিজ`,
      description: `মর্নিং ফুটবল একাডেমি আয়োজিত ${series.name} (${formatStr})। ${teamA?.name || "দল ১"} ও ${teamB?.name || "দল ২"}-এর মধ্যকার লাইভ স্কোর ও ফলাফল।${
        series.venue ? ` ভেন্যু: ${series.venue}।` : ""
      }${dateRange ? ` সময়কাল: ${dateRange}।` : ""}`,
      openGraph: {
        title: `${titleStr} | Morning Football Academy`,
        description: `মর্নিং ফুটবল একাডেমি ফ্রেন্ডলি সিরিজ স্কোরবোর্ড ও ম্যাচ ফলাফল।`,
        type: "website",
      },
    };
  } catch {
    return {
      title: "ফ্রেন্ডলি সিরিজ পাওয়া যায়নি | Morning Football Academy",
    };
  }
}

export default async function FriendlySeriesDetailPage({
  params,
}: FriendlySeriesDetailPageProps) {
  const { slug } = await params;

  let detail: FriendlySeriesDetailResponse | null = null;
  try {
    const res = await apiClient.friendlySeries.getBySlug(slug);
    detail = res.data || null;
  } catch (err: unknown) {
    console.error("Error loading friendly series details:", err);
    detail = null;
  }

  if (!detail || !detail.series) {
    notFound();
  }

  return <FriendlySeriesDetailClient initialData={detail} />;
}