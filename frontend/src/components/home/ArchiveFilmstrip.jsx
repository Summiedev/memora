import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BookOpen, Image, Heart, Lock, Sparkles } from "lucide-react";

const cards = [
  {
    type: "diary",
    label: "diary · 2:02pm",
    text: "Today felt long, but good.",
    bg: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
    border: "border-blue-100",
    accent: "text-blue-400",
  },
  {
    type: "photo",
    label: "img_0483",
    gradient: "linear-gradient(150deg,#fde68a,#fb923c 55%,#7c2d12)",
    tape: "rgba(244,114,182,0.55)",
  },
  {
    type: "mood",
    label: "mood log",
    text: "quietly hopeful",
    bg: "linear-gradient(135deg,#fdf4ff,#fce7f3)",
    border: "border-pink-100",
    accent: "text-pink-400",
  },
  {
    type: "capsule",
    label: "sealed",
    text: "opens in 4 years",
    bg: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
    border: "border-violet-100",
    accent: "text-violet-500",
  },
  {
    type: "photo",
    label: "img_0491",
    gradient: "linear-gradient(150deg,#bae6fd,#38bdf8 55%,#1e3a8a)",
    tape: "rgba(196,181,253,0.6)",
  },
  {
    type: "shared",
    label: "sent",
    text: "to Aisha, unopened",
    bg: "linear-gradient(135deg,#ecfeff,#f0fdfa)",
    border: "border-teal-100",
    accent: "text-teal-500",
  },
  {
    type: "diary",
    label: "diary · 11:41pm",
    text: "Couldn't sleep. Wrote instead.",
    bg: "linear-gradient(135deg,#fff7ed,#fef2f2)",
    border: "border-amber-100",
    accent: "text-amber-500",
  },
];

const Card = ({ c }) => {
  if (c.type === "photo") {
    return (
      <div className="mh-polaroid relative flex-shrink-0 w-[190px] sm:w-[230px] aspect-[4/5]">
        <div className="absolute inset-[12px] bottom-[34px] rounded-md" style={{ background: c.gradient }} />
        <div className="mh-polaroid-cap">
          <span className="mh-hand text-purple-400 text-base">{c.label}</span>
        </div>
        <span className="mh-tape -top-3 left-1/2 -translate-x-1/2 w-14 rotate-[-3deg]" style={{ background: c.tape }} />
      </div>
    );
  }
  return (
    <div
      className={`relative flex-shrink-0 w-[210px] sm:w-[250px] h-[280px] sm:h-[300px] rounded-3xl border-2 ${c.border} shadow-md p-5 flex flex-col justify-between`}
      style={{ background: c.bg }}
    >
      <div className="flex items-center gap-1.5">
        {c.type === "diary" && <BookOpen size={12} className={c.accent} />}
        {c.type === "mood" && <Sparkles size={12} className={c.accent} />}
        {c.type === "capsule" && <Lock size={12} className={c.accent} />}
        {c.type === "shared" && <Heart size={12} className={c.accent} />}
        <p className={`text-[10px] font-black uppercase tracking-widest ${c.accent}`}>{c.label}</p>
      </div>
      <p
        className={c.type === "diary" ? "dancing-script text-purple-700" : "quicksand text-lg font-bold text-purple-700"}
        style={c.type === "diary" ? { fontSize: "1.4rem", lineHeight: 1.35 } : {}}
      >
        {c.text}
      </p>
    </div>
  );
};

const ArchiveFilmstrip = () => {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const x = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["2%", "-58%"]);

  return (
    <section ref={ref} className="relative" style={{ height: "240vh" }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-b from-transparent via-purple-50/40 to-transparent">
        <div className="px-6 sm:px-10 mb-10 relative z-10">
          <div className="mh-tag">
            <Image size={16} className="text-teal-400" />
            <span className="mh-eyebrow text-teal-500">memory lane</span>
          </div>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] text-purple-800">
            Every day becomes a page.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-purple-500 quicksand font-medium">
            Diary entries, photos, moods, sealed capsules — page by page, the
            scrapbook of an ordinary, lovely life.
          </p>
        </div>

        <motion.div style={{ x }} className="flex gap-5 sm:gap-7 px-6 sm:px-10 py-6 relative z-10">
          {cards.map((c, i) => (
            <Card key={i} c={c} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ArchiveFilmstrip;