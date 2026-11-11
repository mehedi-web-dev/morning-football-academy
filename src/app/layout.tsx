import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "./globals.css";

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
