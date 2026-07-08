import { motion } from "framer-motion";
import { Heart, Sparkles, Send } from "lucide-react";

const highlights = [
  {
    title: "Shared diary",
    text: "Write a page together when one memory needs more than one voice.",
  },
  {
    title: "Capsules to someone else",
    text: "Send a sealed memory to a friend and let it open on a date you choose.",
  },
  {
    title: "Private comments",
    text: "Keep a conversation attached to the memory so the context stays intact.",
  },
];

const SharedCircle = () => {
  return (
    <section className="relative py-20 sm:py-28 px-6 sm:px-10 overflow-hidden">
      <div className="mh-blob w-[24rem] h-[24rem] top-0 -left-24 opacity-20" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-6xl grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div className="max-w-xl">
          <div className="mh-tag">
            <Heart size={16} className="text-blue-400" />
            <span className="mh-eyebrow text-blue-500">shared memories</span>
          </div>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] text-purple-800">
            Some memories are
            <br />
            easier together.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-purple-500 quicksand font-medium max-w-lg">
            Memora lets you share a capsule, keep a diary together, or attach a note to a memory so the story still feels complete when you open it later.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="mh-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-pink-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-purple-400 quicksand">shared</p>
              </div>
              <h3 className="mt-4 chewy text-2xl text-purple-800">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-purple-500 quicksand font-medium">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SharedCircle;
