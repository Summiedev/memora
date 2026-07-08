import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const frames = [
  {
    type: "diary",
    label: "diary — 14:02",
    text: "Today felt long, but good.",
  },
  {
    type: "photo",
    label: "img_0483",
    gradient: "radial-gradient(120% 100% at 30% 20%, #f0b96e 0%, #b9613f 45%, #3d2724 90%)",
  },
  {
    type: "mood",
    label: "mood log",
    text: "quietly hopeful",
  },
  {
    type: "capsule",
    label: "sealed",
    text: "opens in 4 years",
  },
  {
    type: "photo",
    label: "img_0491",
    gradient: "radial-gradient(120% 100% at 70% 25%, #d8c9a3 0%, #7c8b73 50%, #24302a 90%)",
  },
  {
    type: "shared",
    label: "sent",
    text: "to Aisha, unopened",
  },
  {
    type: "diary",
    label: "diary — 23:41",
    text: "Couldn't sleep. Wrote instead.",
  },
];

const Sprockets = () => (
  <div className="mh-sprockets">
    {Array.from({ length: 26 }).map((_, i) => (
      <span key={i} />
    ))}
  </div>
);

const Frame = ({ f }) => (
  <div
    className="mh-frame relative flex-shrink-0 w-[220px] sm:w-[260px] h-[300px] sm:h-[340px] flex flex-col justify-between p-4"
    style={{ background: f.gradient ? undefined : "var(--ink-soft)" }}
  >
    {f.gradient && <div className="absolute inset-0" style={{ background: f.gradient }} />}
    <p className="mh-type relative z-10" style={{ color: "var(--paper-deep)" }}>
      {f.label}
    </p>
    {f.text && (
      <p
        className={`relative z-10 ${f.type === "mood" ? "mh-display mh-italic text-xl" : "text-base"}`}
        style={{
          color: "var(--paper)",
          fontFamily: f.type === "diary" ? "'Caveat', cursive" : undefined,
          fontSize: f.type === "diary" ? "1.6rem" : undefined,
        }}
      >
        {f.text}
      </p>
    )}
  </div>
);

const ArchiveFilmstrip = () => {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["2%", "-62%"]);

  return (
    <section ref={ref} className="mh-reel relative" style={{ height: "260vh" }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="px-6 sm:px-10 mb-10">
          <p className="mh-type" style={{ color: "var(--safelight)" }}>
            The archive
          </p>
          <h2 className="mh-display mt-4 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.08]" style={{ color: "var(--cream-text)" }}>
            Every day becomes a frame.
          </h2>
          <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed" style={{ color: "var(--cream-text-dim)" }}>
            Diary pages, photographs, feelings — frame by frame,
            the reel of an ordinary life.
          </p>
        </div>

        <Sprockets />
        <motion.div style={{ x }} className="flex gap-6 sm:gap-8 px-6 sm:px-10 py-6">
          {frames.map((f, i) => (
            <Frame key={i} f={f} />
          ))}
        </motion.div>
        <Sprockets />
      </div>
    </section>
  );
};

export default ArchiveFilmstrip;
