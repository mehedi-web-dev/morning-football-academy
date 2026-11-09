import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Morning Football Academy | Official Football Club",
    template: "%s | Morning Football Academy",
  },
  description:
    "Welcome to Morning Football Academy. Discover our players, fixtures, results, news, and football journey.",
  keywords: [
    "Morning Football Academy",
    "Football Club",
    "Football Players",
    "Football Academy",
  ],
  authors: [{ name: "Morning Football Academy" }],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased flex flex-col bg-[#0A0A0A] text-white`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
