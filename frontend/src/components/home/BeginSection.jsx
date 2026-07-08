import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

const BeginSection = () => {
  return (
    <section className="relative px-6 sm:px-10 pt-20 pb-14 sm:pt-28 sm:pb-16 overflow-hidden">
      <div className="mh-blob w-[26rem] h-[26rem] top-0 left-1/2 -translate-x-1/2 opacity-30" style={{ background: "radial-gradient(circle,#f9a8d4,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mh-tag mx-auto w-fit">
          <Sparkles size={16} className="text-purple-400" />
          <span className="mh-eyebrow text-purple-500">shared memories</span>
        </div>

        <h2 className="chewy mt-6 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.08] text-purple-800">
          Some memories are
          <br />
          better when shared.
        </h2>

        <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-purple-500 quicksand font-medium">
          Send a capsule to someone who was there, or keep a diary together when one person needs the words and the other needs the memory. Memora gives the whole story a place to sit, whether it is private, shared, or somewhere in between.
        </p>

        <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-purple-400 quicksand font-semibold">
          Start with a note, add a photo, seal a date, or invite someone in. The app stays with the memory so it still makes sense later.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -3 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="mh-polaroid mx-auto mt-12 w-full max-w-[220px] aspect-[4/5]"
        >
          <div
            className="absolute inset-[12px] bottom-[34px] rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(150deg,#fdf4ff,#f3e8ff,#e0f2fe)" }}
          >
            <span className="mh-hand text-purple-300 text-2xl">write here…</span>
          </div>
          <div className="mh-polaroid-cap">
            <span className="mh-hand text-pink-400">page one</span>
          </div>
          <span className="mh-tape -top-3 left-1/2 -translate-x-1/2 w-16 rotate-[3deg]" style={{ background: "rgba(147,197,253,0.55)" }} />
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a href="/register" className="mh-btn mh-btn-solid">
            <Heart size={16} className="text-pink-200" /> Create your first capsule
          </a>
          <a href="/login" className="mh-btn mh-btn-outline">
            Already have memories waiting? Sign in
          </a>
        </div>
      </div>

      <footer className="mh-seam relative z-10 mt-20 sm:mt-28 pt-8 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="chewy text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-1.5">
          Memora - a place to keep what matters <Heart size={14} className="text-pink-400 inline" />
        </p>
        <div className="flex gap-6 text-sm font-semibold text-purple-400 quicksand">
          <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
        </div>
      </footer>
    </section>
  );
};

export default BeginSection;
