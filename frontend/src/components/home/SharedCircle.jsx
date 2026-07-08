import { motion } from "framer-motion";

const SharedCircle = () => {
  return (
    <section className="relative py-28 sm:py-40 px-6 sm:px-10" style={{ color: "var(--ink-text)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="max-w-md">
          <p className="mh-type" style={{ color: "var(--safelight)" }}>
            Shared memories
          </p>
          <h2 className="mh-display mt-4 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.08]">
            Lighter, when
            <br />
            they're shared.
          </h2>
          <p className="mt-6 text-[1.05rem] leading-relaxed" style={{ color: "var(--ink-text-dim)" }}>
            Send a capsule to someone who was there. Talk in the
            space between then and now. Some memories were never
            meant to be kept alone.
          </p>
        </div>

        <div className="relative mt-16 h-[320px] sm:h-[380px]">
          <svg
            viewBox="0 0 600 320"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 120 90 C 250 30, 350 280, 480 220"
              fill="none"
              stroke="var(--safelight)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          <div
            className="mh-photo-chip absolute left-[6%] top-[10%] w-[130px] h-[160px] sm:w-[160px] sm:h-[200px]"
            style={{
              background:
                "radial-gradient(120% 100% at 30% 20%, #f0b96e 0%, #b9613f 50%, #34211f 95%)",
            }}
          />
          <div
            className="mh-photo-chip absolute right-[8%] bottom-[6%] w-[130px] h-[160px] sm:w-[160px] sm:h-[200px]"
            style={{
              background:
                "radial-gradient(120% 100% at 70% 25%, #d8c9a3 0%, #7c8b73 55%, #202a24 95%)",
            }}
          />

          <p
            className="mh-type absolute left-[6%] top-[calc(10%+164px)] sm:top-[calc(10%+204px)]"
            style={{ color: "var(--ink-text-dim)" }}
          >
            you
          </p>
          <p
            className="mh-type absolute right-[8%] bottom-[calc(6%+164px)] sm:bottom-[calc(6%+204px)] text-right"
            style={{ color: "var(--ink-text-dim)" }}
          >
            them
          </p>
        </div>
      </div>
    </section>
  );
};

export default SharedCircle;
