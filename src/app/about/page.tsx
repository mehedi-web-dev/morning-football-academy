import type { Metadata } from "next";
import AboutHero from "../../components/about/AboutHero";
import OurStory from "../../components/about/OurStory";
import MissionVision from "../../components/about/MissionVision";
import CoreValues from "../../components/about/CoreValues";
import FootballPhilosophy from "../../components/about/FootballPhilosophy";
import AboutCTA from "../../components/about/AboutCTA";

export const metadata: Metadata = {
  title: "About Us | Morning Football Academy",
  description:
    "Discover Morning Football Academy. Built on passion, united by football. Explore our mission, vision, core values, and holistic player development philosophy.",
  keywords: [
    "About Morning Football Academy",
    "Football Club Values",
    "Youth Football Development",
    "Football Academy Philosophy",
    "Football Coaching",
  ],
};

/**
 * About Page
 * Comprehensive presentation of Morning Football Academy story, values, mission, and philosophy
 */
export default function AboutPage() {
  return (
    <div className="w-full">
      <AboutHero />
      <OurStory />
      <MissionVision />
      <CoreValues />
      <FootballPhilosophy />
      <AboutCTA />
    </div>
  );
}
