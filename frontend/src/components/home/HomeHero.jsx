import { motion } from "framer-motion";
import { BookOpen, Heart, Sparkles, Lock } from "lucide-react";

const FloatIcon = ({ Icon, style, delay = 0, size = 24 }) => (
  <div className="mh-float" style={{ ...style, animationDelay: `${delay}s` }}>
    <Icon size={size} className="text-purple-300 drop-shadow-sm" />
  </div>
);

const HomeHero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 sm:px-10 pt-28 pb-16 overflow-hidden">
      <div className="mh-blob w-[26rem] h-[26rem] -top-24 -left-20 opacity-40" style={{ background: "radial-gradient(circle,#f9a8d4,transparent)" }} />
      <div className="mh-blob w-[24rem] h-[24rem] top-1/3 -right-24 opacity-24" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <FloatIcon Icon={Sparkles} style={{ top: "18%", left: "7%" }} size={22} />
      <FloatIcon Icon={Heart} style={{ top: "28%", right: "10%" }} delay={0.6} size={20} />

      <div className="relative z-10 mx-auto w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mh-tag"
          >
            <BookOpen size={16} className="text-pink-400" />
            <span className="mh-eyebrow text-pink-500">for the moments you want to keep</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="chewy mt-6 text-[clamp(2.6rem,6vw,4.5rem)] leading-[1.05] text-purple-800"
          >
            Keep today close,
            <br />
            <span className="gradient-text">return when it matters.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-purple-500 quicksand font-medium"
          >
            Memora helps you save diary pages, photos, moods, and sealed letters in one calm space, so the small things do not disappear into the noise of the day.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.47 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-purple-400 quicksand font-semibold"
          >
            Write freely now. Memora keeps the meaning intact until you are ready to return.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a href="/register" className="mh-btn mh-btn-solid">
              <Heart size={16} className="text-pink-200" /> Start your first page
            </a>
            <a href="/login" className="mh-btn mh-btn-outline">
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
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none h-[380px] sm:h-[440px]"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -9 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute left-2 top-6 w-[68%] rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 shadow-lg p-5"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={12} className="text-blue-400" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Diary · today</p>
            </div>
            <p className="dancing-script text-blue-700 leading-snug" style={{ fontSize: "1.15rem" }}>
              "Today felt like one of the good ones. Writing this down so I never forget it."
            </p>
          </motion.div>

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mh-polaroid absolute right-2 sm:right-4 bottom-2 w-[64%] sm:w-[60%] aspect-[4/5]"
          >
            <div
              className="absolute inset-[12px] bottom-[34px] rounded-md"
              style={{ background: "linear-gradient(150deg,#fbcfe8,#c4b5fd 55%,#93c5fd)" }}
            />
            <div className="mh-polaroid-cap">
              <span className="mh-hand text-purple-500 text-lg flex items-center justify-center gap-1">
                <Heart size={14} className="text-pink-400" /> our little trip
              </span>
            </div>
            <span
              className="mh-tape -top-3 left-1/2 -translate-x-1/2 w-16 rotate-[-4deg]"
              style={{ background: "rgba(253, 224, 71, 0.55)" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-right-3 flex items-center gap-2 bg-white rounded-2xl shadow-lg border-2 border-pink-100 px-4 py-2.5"
          >
            <Lock size={16} className="text-pink-400" />
            <div className="text-left">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-wide leading-none">Capsule sealed</p>
              <p className="text-xs font-bold text-purple-600 leading-tight mt-0.5">opens in 2 years</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
