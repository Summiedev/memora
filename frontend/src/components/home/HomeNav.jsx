import { useEffect, useState } from "react";

const HomeNav = () => {
  const [onPaper, setOnPaper] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setOnPaper(window.scrollY > window.innerHeight * 0.72);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = onPaper ? "var(--ink-text)" : "var(--cream-text)";
  const dimColor = onPaper ? "var(--ink-text-dim)" : "var(--cream-text-dim)";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 sm:px-10 py-5 flex items-center justify-between transition-colors duration-500">
      <a href="/" className="mh-display mh-italic text-xl" style={{ color: textColor }}>
        Memora
      </a>
      <div className="flex items-center gap-6">
        <a href="/login" className="mh-type hidden sm:inline" style={{ color: dimColor }}>
          Sign in
        </a>
        <a
          href="/register"
          className={`mh-btn ${onPaper ? "mh-btn-outline-dark" : "mh-btn-outline"}`}
          style={{ padding: "0.55rem 1.2rem", fontSize: "0.82rem" }}
        >
          Start
        </a>
      </div>
    </nav>
  );
};

export default HomeNav;
