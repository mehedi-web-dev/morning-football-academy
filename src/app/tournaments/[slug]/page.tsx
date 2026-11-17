import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient, TournamentDocument } from "../../../lib/api-client";
import { formatBnDate } from "../../../lib/bn-utils";
import TournamentDetailClient from "../../../components/tournaments/TournamentDetailClient";

export const instant = false;

interface TournamentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TournamentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient.tournaments.getBySlug(slug);
    const tournament = res.data;

    if (!tournament) {
      return {
        title: "টুর্নামেন্ট পাওয়া যায়নি | Morning Football Academy",
      };
    }

    const titleStr = `${tournament.name} (${tournament.season})`;
    const dateRange = tournament.startDate
      ? `${formatBnDate(tournament.startDate)}${
          tournament.endDate ? ` – ${formatBnDate(tournament.endDate)}` : ""
        }`
      : "";

    return {
      title: `${titleStr} | Morning Football Academy টুর্নামেন্ট`,
      description: `মর্নিং ফুটবল একাডেমি আয়োজিত ${tournament.name} (${tournament.season})-এর অফিসিয়াল ফিক্সচার, পয়েন্ট টেবিল, স্কোয়াড ও গোল্ডেন বুট ফলাফল।${
        tournament.venue ? ` ভেন্যু: ${tournament.venue}।` : ""
      }${dateRange ? ` সময়কাল: ${dateRange}।` : ""}`,
      openGraph: {
        title: `${titleStr} | Morning Football Academy`,
        description: `মর্নিং ফুটবল একাডেমি অফিসিয়াল টুর্নামেন্ট কনসোল ও লাইভ ফলাফল।`,
        type: "website",
      },
    };
  } catch {
    return {
      title: "টুর্নামেন্ট পাওয়া যায়নি | Morning Football Academy",
    };
  }
}

export default async function TournamentDetailPage({
  params,
}: TournamentDetailPageProps) {
  const { slug } = await params;

  let tournament: TournamentDocument | null = null;
  try {
    const res = await apiClient.tournaments.getBySlug(slug);
    tournament = res.data || null;
  } catch (err: unknown) {
    console.error("Error loading tournament details:", err);
    tournament = null;
  }

  if (!tournament) {
    notFound();
  }

  return <TournamentDetailClient tournament={tournament} />;
}
