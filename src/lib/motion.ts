// Shared motion language. These were duplicated verbatim in Hero and
// Portfolio; every section now imports them so the page has one entrance
// vocabulary rather than several that drift apart.
//
// Every variant here is a ONE-TIME entrance. Nothing in this file loops.
// Per the motion rule in AGENTS.md: if you can't name why it moves and when
// it stops, it doesn't belong.

/** The house easing curve — a hard decelerate. Used everywhere. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Quiet entrance. The default for anything that isn't the focal element. */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
} as const;

/**
 * The house signature: a camera pulling focus. Blur and scale settle
 * together so the element resolves rather than slides. Established in the
 * Hero headline, reused for anything that deserves emphasis.
 */
export const rackFocus = {
  hidden: { opacity: 0, y: 16, scale: 1.03, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: EASE_OUT },
  },
} as const;

/** Parent variant for staggering children. */
export function staggerContainer(staggerChildren = 0.15, delayChildren = 0) {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  } as const;
}

/**
 * Standard whileInView config. `once: true` matters — a reveal that replays
 * every time you scroll past is decoration, not an entrance.
 */
export const inViewOnce = { once: true, margin: "-80px" } as const;
