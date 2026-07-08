import { motion } from "framer-motion";
import { BookOpen, Image, Heart, Lock, Sparkles } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Diary entries",
    text: "Write the quick notes, the long thoughts, and the little details you would otherwise forget by tomorrow.",
  },
  {
    icon: Image,
    title: "Photos and albums",
    text: "Drop in a picture, organize a moment, and keep the story attached to what you saw.",
  },
  {
    icon: Sparkles,
    title: "Mood logs",
    text: "Track how a day felt, not just what happened, so your timeline keeps the emotional context too.",
  },
  {
    icon: Lock,
    title: "Time capsules",
    text: "Seal a memory for later and let it reopen on the date you choose.",
  },
];

const ArchiveFilmstrip = () => {
  return (
    <section className="relative py-20 sm:py-28 px-6 sm:px-10 overflow-hidden">
      <div className="mh-blob w-[24rem] h-[24rem] top-0 -left-24 opacity-25" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="mh-tag">
            <BookOpen size={16} className="text-teal-400" />
            <span className="mh-eyebrow text-teal-500">memory lane</span>
          </div>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.1] text-purple-800">
            Everything you keep
            <br />
            has a place to live.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-purple-500 quicksand font-medium">
            Memora brings diaries, photo albums, mood checks, capsules, and shared memories into one timeline, so you can move through your archive without losing the thread.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-purple-400 quicksand font-semibold">
            That means the app is not just holding content. It is helping you see the shape of your life as it grows.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="mh-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-pink-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-400 quicksand">feature</p>
                </div>
                <h3 className="mt-4 chewy text-2xl text-purple-800">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-purple-500 quicksand font-medium">{item.text}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border-2 border-violet-100 bg-white/80 backdrop-blur-sm px-5 py-5 sm:px-6 sm:py-6 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-400 quicksand">inside the app</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              "Diary pages",
              "Photo albums",
              "Mood tracker",
              "Capsules",
              "Shared diary",
              "Memory comments",
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-purple-600 quicksand"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchiveFilmstrip;
