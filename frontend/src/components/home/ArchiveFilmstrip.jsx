import { motion } from "framer-motion";
const items = [
  {
    title: "Diary entries",
    text: "Write the quick notes, the long thoughts, and the little details you would otherwise forget by tomorrow.",
  },
  {
    title: "Photos and albums",
    text: "Drop in a picture, organize a moment, and keep the story attached to what you saw.",
  },
  {
    title: "Mood logs",
    text: "Track how a day felt, not just what happened, so your timeline keeps the emotional context too.",
  },
];

const CapsuleCard = () => (
  <div className="rounded-[2rem] border-2 border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5 sm:p-6 shadow-md">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-400 quicksand">capsule</p>
    <div className="mt-4 rounded-[1.5rem] border border-violet-100 bg-white/80 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400 quicksand">sealed memory</p>
        <p className="text-[10px] font-bold text-violet-500 quicksand">opens later</p>
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r from-pink-200 via-violet-200 to-blue-200" />
      <p className="mt-4 text-base sm:text-lg text-purple-700 chewy">Something saved for the right day.</p>
      <p className="mt-2 text-sm text-purple-500 quicksand font-medium leading-relaxed">
        A private moment, a future reminder, or a gift for someone else, locked until you choose.
      </p>
    </div>
  </div>
);

const ArchiveFilmstrip = () => {
  return (
    <section className="relative py-16 sm:py-24 px-5 sm:px-10 overflow-hidden">
      <div className="mh-blob w-[20rem] sm:w-[24rem] h-[20rem] sm:h-[24rem] top-0 -left-24 opacity-22" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="mh-kicker">memory lane</p>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.1] text-purple-800">
            Everything you keep
            <br />
            has a place to live.
          </h2>
          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-purple-500 quicksand font-medium">
            Memora brings diaries, photo albums, mood logs, capsules, and shared memories into one timeline, so you can move through your archive without losing the thread.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-purple-400 quicksand font-semibold">
            It should feel like opening a familiar drawer, not searching through a folder list.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <CapsuleCard />
          {items.map((item, index) => {
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="mh-card p-5 sm:p-6"
              >
                <h3 className="mt-4 chewy text-2xl text-purple-800">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-purple-500 quicksand font-medium">{item.text}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border-2 border-violet-100 bg-white/80 backdrop-blur-sm px-5 py-5 sm:px-6 sm:py-6 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-400 quicksand">inside the app</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                className="border-b border-violet-100 pb-2 text-sm font-semibold text-purple-600 quicksand"
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
