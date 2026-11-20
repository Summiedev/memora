import ArchiveFilmstrip from "../components/home/ArchiveFilmstrip";
import BeginSection from "../components/home/BeginSection";
import HomeHero from "../components/home/HomeHero";
import HomeNav from "../components/home/HomeNav";
import SharedCircle from "../components/home/SharedCircle";
import VaultSection from "../components/home/VaultSection";
import { useLayoutEffect } from "react";
import "./homepage.css";

const HomePage = () => {
  useLayoutEffect(() => {
    const root = document.querySelector(".memora-home");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || reducedMotion.matches) return undefined;

    const targets = [...root.querySelectorAll("[data-reveal]")];
    root.dataset.motionReady = "true";
    const reveal = (element) => { element.dataset.revealed = "true"; };
    const frame = requestAnimationFrame(() => {
      targets.filter((element) => element.dataset.reveal === "hero").forEach(reveal);
    });
    if (!("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return () => {
        cancelAnimationFrame(frame);
        delete root.dataset.motionReady;
      };
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    targets.filter((element) => element.dataset.reveal !== "hero").forEach((element) => observer.observe(element));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      delete root.dataset.motionReady;
    };
  }, []);

  return (
    <div className="memora-home">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <HomeNav />
      <main id="main-content"><HomeHero /><VaultSection /><ArchiveFilmstrip /><SharedCircle /><BeginSection /></main>
    </div>
  );
};

export default HomePage;
