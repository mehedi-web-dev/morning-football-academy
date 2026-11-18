import HeroSection from "../components/home/HeroSection";
import ClubStats from "../components/home/ClubStats";
import UpcomingMatches from "../components/home/UpcomingMatches";
import LatestFriendlySeries from "../components/home/LatestFriendlySeries";
import SquadSection from "../components/home/SquadSection";
import PlayerSpotlight from "../components/home/PlayerSpotlight";
import GallerySection from "../components/home/GallerySection";
import JoinAcademy from "../components/home/JoinAcademy";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <ClubStats />
      <UpcomingMatches />
      <LatestFriendlySeries />
      <SquadSection />
      <PlayerSpotlight />
      <GallerySection />
      <JoinAcademy />
    </div>
  );
}
