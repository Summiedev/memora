import { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const BeginSection = () => {
  const frameRef = useRef(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(280px circle at ${mx}% ${my}%, rgba(176,68,31,0.55), transparent 70%)`;

  const handleMove = (e) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <section className="relative px-6 sm:px-10 pt-28 pb-16 sm:pt-40 sm:pb-20">
      <div className="mh-grain" />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mh-type" style={{ color: "var(--safelight)" }}>
          Begin
        </p>
        <h2
          className="mh-display mt-5 text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.06]"
          style={{ color: "var(--cream-text)" }}
        >
          Your next memory
          <br />
          <span className="mh-italic">is still blank.</span>
        </h2>

        <div
          ref={frameRef}
          onMouseMove={handleMove}
          className="mh-glow-frame mx-auto mt-12 w-full max-w-[260px] aspect-[4/5]"
        >
          <motion.div className="absolute inset-0" style={{ background: glow }} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a href="/register" className="mh-btn mh-btn-solid">
            Create your first capsule
          </a>
          <a href="/login" className="mh-btn mh-btn-outline">
            Already have memories waiting? Sign in
          </a>
        </div>
      </div>

      <footer
        className="relative z-10 mt-28 sm:mt-36 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(241,232,214,0.12)" }}
      >
        <p className="mh-type" style={{ color: "var(--cream-text-dim)" }}>
          Memora — a place to keep what matters
        </p>
        <div className="flex gap-6">
          <a href="#" className="mh-type" style={{ color: "var(--cream-text-dim)" }}>
            Privacy
          </a>
          <a href="#" className="mh-type" style={{ color: "var(--cream-text-dim)" }}>
            Terms
          </a>
        </div>
      </footer>
    </section>
  );
};

export default BeginSection;
