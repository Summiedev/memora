/**
 * Memora — Animation Constants
 * Centralised motion tokens for the entire application.
 * Every animation should reference these values.
 */
export const SPRING = {
  /** Soft, gentle spring — for cards, modals, panels */
  GENTLE: { type: "spring", stiffness: 140, damping: 20, mass: 0.8 },
  /** Bouncy, playful — for buttons, badges, taps */
  BOUNCE: { type: "spring", stiffness: 300, damping: 12, mass: 0.6 },
  /** Snappy, responsive — for menus, dropdowns, toggles */
  SNAPPY: { type: "spring", stiffness: 400, damping: 28, mass: 0.5 },
  /** Slow, dreamy — for backgrounds, ambient motion */
  DREAMY: { type: "spring", stiffness: 60, damping: 16, mass: 1.2 },
};

export const TRANSITION = {
  /** Standard fade-in */
  FADE: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  /** Slide up entrance */
  SLIDE_UP: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  /** Scale entrance */
  SCALE_IN: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
};

export const VARIANTS = {
  /** Staggered children entrance */
  STAGGER: {
    container: { animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } },
    item: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0, transition: SPRING.GENTLE },
    },
  },
  /** Fade in from bottom */
  FADE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  /** Scale in */
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: SPRING.GENTLE },
  },
  /** Modal backdrop */
  BACKDROP: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
  },
};

/**
 * Hover + tap interaction presets for motion components
 */
export const INTERACTIONS = {
  /** Card hover — gentle lift */
  CARD_HOVER: { whileHover: { y: -4, scale: 1.02 }, whileTap: { scale: 0.98 } },
  /** Button hover — slight scale */
  BTN_HOVER: { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 } },
  /** Icon hover — subtle rotation */
  ICON_HOVER: { whileHover: { rotate: 6, scale: 1.1 }, whileTap: { scale: 0.9 } },
  /** Avatar hover */
  AVATAR_HOVER: { whileHover: { scale: 1.08, rotate: -3 }, whileTap: { scale: 0.95 } },
};