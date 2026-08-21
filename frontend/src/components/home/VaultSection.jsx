import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const VaultSection = () => {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"],
  });

  const flapRotate = useTransform(scrollYProgress, [0, 1], prefersReduced ? [-158, -158] : [0, -158]);
  const letterY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [-56, -56] : [22, -56]);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 px-5 sm:px-10">
      <div className="mh-blob w-[18rem] sm:w-[22rem] h-[18rem] sm:h-[22rem] top-10 -right-16 opacity-20" style={{ background: "radial-gradient(circle,#fbcfe8,transparent)" }} />

      <div className="relative z-10 mx-auto max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
        <div className="mh-envelope-scene mx-auto w-full max-w-[340px] sm:max-w-[360px]">
          <div className="relative" style={{ aspectRatio: "3 / 2" }}>
            <motion.div
              style={{ y: letterY, background: "var(--paper)" }}
              className="absolute left-[6%] right-[6%] top-[-38%] h-[90%] rounded-t-xl shadow-[0_20px_40px_rgba(139,92,246,0.22)]"
            >
              <div className="p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-400">opens 12 . 25 . 2031</p>
                <p className="mh-script text-purple-800 mt-3 text-xl sm:text-2xl leading-snug">
                  "Read this when you've forgotten what today felt like."
                </p>
              </div>
            </motion.div>

            <div
              className="absolute inset-0 rounded-xl"
              style={{ background: "linear-gradient(160deg,#f3e8ff,#e0f2fe)", zIndex: 2, border: "2px solid rgba(139,92,246,0.15)" }}
            />

            <motion.div
              className="mh-flap absolute inset-x-0 top-0 h-full rounded-t-xl"
              style={{ rotateX: flapRotate, background: "linear-gradient(160deg,#fbcfe8,#ddd6fe)", zIndex: 3 }}
            />

          </div>
        </div>

        <div className="text-center lg:text-left">
          <p className="mh-kicker mx-auto lg:mx-0">time capsules</p>
          <h2 className="chewy mt-5 text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] text-purple-800">
            Some letters are
            <br />
            meant to wait.
          </h2>
          <p className="mt-5 mx-auto lg:mx-0 max-w-md text-base sm:text-lg leading-relaxed text-purple-500 quicksand font-medium">
            Write something now, seal it with a date, and let it sit. A year from now, a decade later, or on a morning you did not know would matter yet.
          </p>
          <p className="mt-4 mx-auto lg:mx-0 max-w-md text-sm leading-relaxed text-purple-400 quicksand font-semibold">
            The point is not to rush the moment. It is to give it a place to wait until it can be felt fully.
          </p>
          <p className="mt-7 text-sm font-bold text-pink-500 quicksand">Locked until the date you choose</p>
        </div>
      </div>
    </section>
  );
};

export default VaultSection;
