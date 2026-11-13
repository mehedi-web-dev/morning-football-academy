import type { Metadata } from "next";
import AboutHero from "../../components/about/AboutHero";
import OurStory from "../../components/about/OurStory";
import MissionVision from "../../components/about/MissionVision";
import CoreValues from "../../components/about/CoreValues";
import FootballPhilosophy from "../../components/about/FootballPhilosophy";
import AboutCTA from "../../components/about/AboutCTA";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | Morning Football Academy",
  description:
    "Morning Football Academy সম্পর্কে বিস্তারিত জানুন। গভীর নিষ্ঠা, ফুটবলের প্রতি ভালোবাসা এবং দলগত ঐক্য নিয়ে গঠিত। আমাদের লক্ষ্য, ভিশন, মূল মূল্যবোধ এবং সার্বিক খেলোয়াড় বিকাশ দর্শন জানুন।",
  keywords: [
    "আমাদের সম্পর্কে",
    "Morning Football Academy",
    "ফুটবল একাডেমি",
    "ফুটবল প্রশিক্ষণ দর্শন",
    "তরুণ ফুটবল বিকাশ",
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
