import HomeNav from "../components/home/HomeNav";
import HomeHero from "../components/home/HomeHero";
import VaultSection from "../components/home/VaultSection";
import ArchiveFilmstrip from "../components/home/ArchiveFilmstrip";
import SharedCircle from "../components/home/SharedCircle";
import BeginSection from "../components/home/BeginSection";

import "./homepage.css";

const HomePage = () => {
  return (
    <div className="memora-home relative">
      <HomeNav />
      <HomeHero />
      <VaultSection />
      <ArchiveFilmstrip />
      <SharedCircle />
      <BeginSection />
    </div>
  );
};

export default HomePage;
