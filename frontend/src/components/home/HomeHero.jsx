import { motion } from "framer-motion";

const HomeHero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 sm:px-10 pt-28 pb-16">
      <div className="mh-grain" />

      <div className="relative z-10 mx-auto w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
        {/* Copy */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mh-type"
            style={{ color: "var(--safelight)" }}
          >
            Memora — an archive, not a feed
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mh-display mt-5 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.04]"
            style={{ color: "var(--cream-text)" }}
          >
            Some things are worth
            <br />
            <span className="mh-italic">developing slowly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-6 max-w-md text-[1.05rem] leading-relaxed"
            style={{ color: "var(--cream-text-dim)" }}
          >
            Write it down. Lock it away. Let time do something
            words alone can't. Memora holds what you're not ready
            to look at yet, and what you'll want to, later.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a href="/register" className="mh-btn mh-btn-solid">
              Start a memory
            </a>
            <a href="/login" className="mh-btn mh-btn-outline">
              Sign in
            </a>
          </motion.div>
        </div>

        {/* The developing print */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div
            className="relative"
            style={{
              background: "var(--paper)",
              padding: "14px 14px 46px 14px",
              boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
            }}
          >
            <div className="mh-plate relative w-full aspect-[4/5] overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 30% 15%, #f4c98b 0%, #d98a4d 28%, #93513a 55%, #3c2a2c 80%, #1a1210 100%)",
                }}
              />
              <div
                className="absolute inset-x-0"
                style={{
                  top: "58%",
                  height: "1px",
                  background: "rgba(241,232,214,0.35)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(19,16,9,0) 45%, rgba(19,16,9,0.55) 100%)",
                }}
              />
            </div>
            <p
              className="mh-type absolute left-[14px] right-[14px] bottom-[16px] text-center"
              style={{ color: "var(--ink-text-dim)" }}
            >
              exposure no. 1 — undated
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="relative z-10 mx-auto mt-16 flex flex-col items-center gap-2"
      >
        <span
          className="block w-px h-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(241,232,214,0.5), rgba(241,232,214,0))",
          }}
        />
        <span className="mh-type" style={{ color: "var(--cream-text-dim)" }}>
          scroll
        </span>
      </motion.div>
    </section>
  );
};

export default HomeHero;
