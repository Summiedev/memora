import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import HomeNav from "../components/home/HomeNav";
import HomeHero from "../components/home/HomeHero";
import VaultSection from "../components/home/VaultSection";
import ArchiveFilmstrip from "../components/home/ArchiveFilmstrip";
import SharedCircle from "../components/home/SharedCircle";
import BeginSection from "../components/home/BeginSection";

import "./homepage.css";

const HomePage = () => {
  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: pageRef });

  const background = useTransform(
    scrollYProgress,
    [0, 0.13, 0.18, 0.3, 0.305, 0.69, 0.7, 0.85, 0.9, 1],
    [
      "#131009",
      "#131009",
      "#f1e8d6",
      "#f1e8d6",
      "#131009",
      "#131009",
      "#f1e8d6",
      "#f1e8d6",
      "#131009",
      "#131009",
    ]
  );

  return (
    <motion.div ref={pageRef} className="memora-home relative" style={{ background }}>
      <HomeNav />
      <HomeHero />
      <VaultSection />
      <ArchiveFilmstrip />
      <SharedCircle />
      <BeginSection />
    </motion.div>
  );
};

export default HomePage;
