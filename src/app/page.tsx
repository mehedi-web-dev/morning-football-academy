import HeroSection from "../components/home/HeroSection";
import ClubStats from "../components/home/ClubStats";
import UpcomingMatches from "../components/home/UpcomingMatches";
import SquadSection from "../components/home/SquadSection";
import PlayerSpotlight from "../components/home/PlayerSpotlight";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <ClubStats />
      <UpcomingMatches />
      <SquadSection />
      <PlayerSpotlight />
    </div>
  );
}
