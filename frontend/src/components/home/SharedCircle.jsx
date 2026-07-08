import { motion } from "framer-motion";
import { Heart, Sparkles, Send } from "lucide-react";

const SharedCircle = () => {
  return (
    <section className="relative py-24 sm:py-36 px-6 sm:px-10 overflow-hidden">
      <div className="mh-blob w-[24rem] h-[24rem] top-0 -left-24 opacity-25" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="max-w-md">
          <div className="mh-tag">
            <Heart size={16} className="text-blue-400" />
            <span className="mh-eyebrow text-blue-500">shared memories</span>
          </div>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] text-purple-800">
            Lighter, when
            <br />
            they're shared.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-purple-500 quicksand font-medium">
            Send a capsule to someone who was there. Keep a diary together.
            Some memories were never meant to be kept alone — Memora holds
            the space between "back then" and "right now."
          </p>
        </div>

        <div className="relative mt-16 h-[300px] sm:h-[360px]">
          <svg viewBox="0 0 600 320" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <motion.path
              d="M 120 90 C 250 30, 350 280, 480 220"
              fill="none"
              stroke="#c4b5fd"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 14"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.9 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 16, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6 }}
            className="mh-polaroid absolute left-[4%] top-[6%] w-[130px] sm:w-[160px] aspect-[4/5]"
          >
            <div className="absolute inset-[10px] bottom-[30px] rounded-md" style={{ background: "linear-gradient(150deg,#fbcfe8,#f472b6 55%,#831843)" }} />
            <div className="mh-polaroid-cap">
              <span className="mh-hand text-purple-400 flex items-center justify-center gap-1">
                <Heart size={12} className="text-pink-400" /> you
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 6 }}
            whileInView={{ opacity: 1, y: 0, rotate: 6 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mh-polaroid absolute right-[6%] bottom-[4%] w-[130px] sm:w-[160px] aspect-[4/5]"
          >
            <div className="absolute inset-[10px] bottom-[30px] rounded-md" style={{ background: "linear-gradient(150deg,#bfdbfe,#60a5fa 55%,#1e3a8a)" }} />
            <div className="mh-polaroid-cap">
              <span className="mh-hand text-purple-400 flex items-center justify-center gap-1">
                them <Sparkles size={10} className="text-blue-400" />
              </span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-[38%] -translate-x-1/2"
          >
            <Send size={24} className="text-purple-300" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SharedCircle;