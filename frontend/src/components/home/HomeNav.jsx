import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const HomeNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 px-5 sm:px-10 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-md px-5 py-2 border border-pink-100" : "px-2 py-1"
        }`}
      >
        <a href="/" className="flex items-center gap-2 group select-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="chewy text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Memora
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors quicksand"
          >
            Sign in
          </a>
          <a href="/register" className="mh-btn mh-btn-solid" style={{ padding: "0.6rem 1.35rem", fontSize: "0.85rem" }}>
            Start free ✦
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default HomeNav;
