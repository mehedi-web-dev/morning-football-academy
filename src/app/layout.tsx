import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://morning-football-academy.vercel.app"
  ),
  title: {
    default: "Morning Football Academy | অফিসিয়াল ফুটবল একাডেমি",
    template: "%s | Morning Football Academy",
  },
  description:
    "Morning Football Academy-তে স্বাগতম। আমাদের প্রতিভাবান খেলোয়াড়বৃন্দ, ম্যাচ সূচি, ফলাফল, ক্লাব সংবাদ ও ফুটবল একাডেমির যাবতীয় তথ্য জানুন।",
  keywords: [
    "Morning Football Academy",
    "মর্নিং ফুটবল একাডেমি",
    "ফুটবল একাডেমি",
    "ফুটবল ক্লাব",
    "বাংলাদেশ ফুটবল একাডেমি",
    "ফুটবল প্রশিক্ষণ",
  ],
  authors: [{ name: "Morning Football Academy" }],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-screen antialiased flex flex-col bg-[#0A0A0A] text-white"
      >
        <Suspense fallback={<header className="h-20 bg-[#0A0A0A]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
