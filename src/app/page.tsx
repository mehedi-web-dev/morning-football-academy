import HeroSection from "../components/home/HeroSection";
import ClubStats from "../components/home/ClubStats";
import UpcomingMatches from "../components/home/UpcomingMatches";
import SquadSection from "../components/home/SquadSection";
import PlayerSpotlight from "../components/home/PlayerSpotlight";
import NewsSection from "../components/home/NewsSection";
import GallerySection from "../components/home/GallerySection";
import JoinAcademy from "../components/home/JoinAcademy";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <ClubStats />
      <UpcomingMatches />
      <SquadSection />
      <PlayerSpotlight />
      <NewsSection />
      <GallerySection />
      <JoinAcademy />
    </div>
  );
}
