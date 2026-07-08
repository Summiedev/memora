import { motion } from "framer-motion";
import { BookOpen, Heart, Sparkles, Lock } from "lucide-react";

const FloatIcon = ({ Icon, style, delay = 0, size = 24 }) => (
  <div className="mh-float" style={{ ...style, animationDelay: `${delay}s` }}>
    <Icon size={size} className="text-purple-300 drop-shadow-sm" />
  </div>
);

const HomeHero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-5 sm:px-10 pt-20 pb-12 sm:pt-28 sm:pb-16 overflow-hidden">
      <div className="mh-blob w-[22rem] sm:w-[26rem] h-[22rem] sm:h-[26rem] -top-24 -left-20 opacity-35" style={{ background: "radial-gradient(circle,#f9a8d4,transparent)" }} />
      <div className="mh-blob w-[20rem] sm:w-[24rem] h-[20rem] sm:h-[24rem] top-1/3 -right-24 opacity-24" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <FloatIcon Icon={Sparkles} style={{ top: "14%", left: "5%" }} size={20} />
      <FloatIcon Icon={Heart} style={{ top: "26%", right: "8%" }} delay={0.6} size={18} />

      <div className="relative z-10 mx-auto w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mh-tag mx-auto lg:mx-0"
          >
            <BookOpen size={16} className="text-pink-400" />
            <span className="mh-eyebrow text-pink-500">for the moments you want to keep</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="chewy mt-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] text-purple-800"
          >
            Keep today close,
            <br />
            <span className="gradient-text">return when it matters.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 mx-auto lg:mx-0 max-w-md text-base sm:text-lg leading-relaxed text-purple-500 quicksand font-medium"
          >
            Memora keeps diary pages, photos, moods, and sealed capsules in one calm place, so the important stuff stays easy to find later.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.47 }}
            className="mt-4 mx-auto lg:mx-0 max-w-md text-sm leading-relaxed text-purple-400 quicksand font-semibold"
          >
            Write freely now. Memora keeps the meaning intact until you are ready to return.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
          >
            <a href="/register" className="mh-btn mh-btn-solid w-full sm:w-auto justify-center">
              <Heart size={16} className="text-pink-200" /> Start your first page
            </a>
            <a href="/login" className="mh-btn mh-btn-outline w-full sm:w-auto justify-center">
              Sign in
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6 text-sm text-purple-300 font-semibold quicksand"
          >
            Private by default · your memories stay yours
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none h-[320px] sm:h-[420px] lg:h-[440px]"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -8 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute left-1 top-5 sm:left-2 sm:top-6 w-[72%] sm:w-[68%] rounded-[1.75rem] bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-100 shadow-lg p-5 sm:p-6"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Lock size={12} className="text-violet-400" />
              <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Capsule sealed</p>
            </div>
            <p className="chewy text-purple-800 text-2xl sm:text-[1.75rem] leading-tight">
              Open this later.
            </p>
            <p className="mt-3 text-sm sm:text-base text-purple-500 quicksand font-medium leading-relaxed">
              A message, a photo, or a memory can wait here until the right day arrives.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 border border-violet-100 px-3 py-1.5 text-xs font-bold text-violet-600 quicksand">
              <Sparkles size={12} className="text-pink-400" /> opens in 2 years
            </div>
          </motion.div>

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mh-polaroid absolute right-1 sm:right-4 bottom-2 w-[64%] sm:w-[60%] aspect-[4/5]"
          >
            <div
              className="absolute inset-[12px] bottom-[34px] rounded-md"
              style={{ background: "linear-gradient(150deg,#fbcfe8,#c4b5fd 55%,#93c5fd)" }}
            />
            <div className="mh-polaroid-cap">
              <span className="mh-hand text-purple-500 text-lg flex items-center justify-center gap-1">
                <Heart size={14} className="text-pink-400" /> your memory
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
