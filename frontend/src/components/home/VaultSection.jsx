import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const VaultSection = () => {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"],
  });

  const flapRotate = useTransform(scrollYProgress, [0, 1], prefersReduced ? [-160, -160] : [0, -160]);
  const flapOpacityBack = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0.94]);
  const letterY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [-58, -58] : [26, -58]);
  const sealScale = useTransform(scrollYProgress, [0, 0.35, 0.5], [1, 1, 0]);
  const sealOpacity = useTransform(scrollYProgress, [0, 0.35, 0.5], [1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative py-28 sm:py-40 px-6 sm:px-10"
      style={{ color: "var(--ink-text)" }}
    >
      <div className="mx-auto max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-center">
        {/* Envelope */}
        <div className="mh-envelope-scene mx-auto w-full max-w-[360px]">
          <div className="relative" style={{ aspectRatio: "3 / 2" }}>
            {/* letter peeking out */}
            <motion.div
              style={{ y: letterY, background: "var(--paper)" }}
              className="absolute left-[6%] right-[6%] top-[-38%] h-[90%] shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
            >
              <div className="p-5 sm:p-6">
                <p className="mh-type" style={{ color: "var(--safelight)" }}>
                  opens 12 . 25 . 2031
                </p>
                <p className="mh-display mh-italic mt-3 text-lg sm:text-xl leading-snug">
                  “Read this when you've
                  forgotten what today felt like.”
                </p>
              </div>
            </motion.div>

            {/* envelope pocket */}
            <div
              className="absolute inset-0"
              style={{ background: "var(--paper-deep)", zIndex: 2 }}
            />

            {/* flap */}
            <motion.div
              className="mh-flap absolute inset-x-0 top-0 h-full"
              style={{
                rotateX: flapRotate,
                opacity: flapOpacityBack,
                background: "var(--paper)",
                zIndex: 3,
              }}
            />

            {/* wax seal */}
            <motion.div
              style={{
                scale: sealScale,
                opacity: sealOpacity,
                zIndex: 4,
              }}
              className="mh-seal absolute w-12 h-12 rounded-full left-1/2 top-[30%] -translate-x-1/2"
            />
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="mh-type" style={{ color: "var(--safelight)" }}>
            Time capsules
          </p>
          <h2 className="mh-display mt-4 text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.08]">
            Some letters are
            <br />
            meant to wait.
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed" style={{ color: "var(--ink-text-dim)" }}>
            Write something now, and choose when it gets read.
            A year from now. A decade. The morning after a
            wedding you haven't had yet. Yours to open, or
            someone else's.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VaultSection;
