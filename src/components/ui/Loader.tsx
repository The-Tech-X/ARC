"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { site } from "@/content/site";
import {
  MARK_STOPS,
  WORDMARK_LETTERS,
  WORDMARK_STROKE_WIDTH,
  WORDMARK_VIEWBOX,
} from "@/lib/wordmark";

/**
 * The intro: the mark writes itself, then opens into what it stands for.
 *
 * Three stages, each one ending. Nothing here loops:
 *   write   (1.2s) — all three letters draw at once, each with a point of
 *                    light at the pen tip
 *   expand  (1.3s) — the outer letters move apart and Attention / Retention /
 *                    Conversion rise in underneath
 *   exit    (0.7s) — overlay dissolves; the Hero is already animating under it
 *
 * **The three letters are strictly parallel** — same start, same duration, same
 * easing. An earlier version had the A ascend first and ignite the R and C off
 * its apex; that made the A the subject and the other two its consequence, and
 * the user asked for the three to be equal. If you find yourself adding a delay
 * per letter, that is the thing being undone.
 *
 * Each letter is a single continuous path (`WORDMARK_PATHS`, not the split
 * strokes), so `pathLength` animates one unbroken pen movement per letter — up
 * the A and back down, around the R, around the C — which is what makes it read
 * as writing rather than as three lines fading up.
 */

const WRITE_MS = 1200;
/** Spread, words, and the beat of stillness before the exit. */
const EXPAND_MS = 1300;
const EXIT_MS = 700;

/** How far the outer letters travel apart, in mark units (850 wide). */
const SPREAD = 60;

/**
 * Length of the bright pen-tip segment, as a fraction of each letter's path.
 * The paths are within ~15% of the same length, so one value looks even across
 * all three.
 */
const PEN = 0.05;

const LETTERS = WORDMARK_LETTERS.map((letter, i) => ({
  ...letter,
  word: site.acronym[i],
  // -SPREAD, 0, +SPREAD: the A goes left, the C right, the R holds the centre.
  shift: (i - 1) * SPREAD,
}));

type Stage = "write" | "expand" | "exit";

export default function Loader({
  onReveal,
  onDone,
}: {
  /** Fires as the overlay begins dissolving, so the Hero starts underneath. */
  onReveal: () => void;
  /** Fires once the overlay is fully gone and can be unmounted. */
  onDone: () => void;
}) {
  const [stage, setStage] = useState<Stage>("write");

  // One value drives all three letters, which is what guarantees they stay in
  // step — three separate animations would drift.
  const progress = useMotionValue(0);

  /**
   * The pen light is a short dash chased along the same path. With
   * `pathLength={1}` on the element, dash units are fractions of the path, so
   * a dash of PEN with offset `PEN - p` puts its leading edge exactly at p —
   * i.e. at the point the stroke is currently being drawn to.
   */
  const penOffset = useTransform(progress, (p) => PEN - p);

  useEffect(() => {
    let expandTimer: ReturnType<typeof setTimeout>;
    let doneTimer: ReturnType<typeof setTimeout>;

    const controls = animate(progress, 1, {
      duration: WRITE_MS / 1000,
      ease: [0.4, 0, 0.2, 1],
    });

    controls.then(() => {
      setStage("expand");
      expandTimer = setTimeout(() => {
        setStage("exit");
        onReveal();
        doneTimer = setTimeout(onDone, EXIT_MS);
      }, EXPAND_MS);
    });

    return () => {
      controls.stop();
      clearTimeout(expandTimer);
      clearTimeout(doneTimer);
    };
  }, [progress, onReveal, onDone]);

  const writing = stage === "write";
  const opened = stage !== "write";

  return (
    <motion.div
      // `arc-intro-overlay` is the hook the inline script in layout.tsx uses
      // to hide this before hydration on repeat visits — see globals.css.
      className="arc-intro-overlay fixed inset-0 z-[200] flex items-center justify-center bg-deep-black"
      aria-hidden="true"
      // Explicit initial: without it Framer reads the starting opacity from
      // computed style, which isn't resolved yet on the very first frame and
      // warns about animating from `undefined`.
      initial={{ opacity: 1, scale: 1 }}
      animate={stage === "exit" ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: EASE_OUT }}
    >
      {/* Sized on the mark; the words are positioned against the same box, so
          they stay under their letter at every width. `overflow-visible` is
          load-bearing — the letters move outside the viewBox when they spread,
          and the pen light's glow spills past the strokes. */}
      <div className="relative w-[70vw] max-w-[560px]">
        <svg viewBox={WORDMARK_VIEWBOX} className="block w-full overflow-visible" fill="none">
          <defs>
            {/* userSpaceOnUse is required here: the R's arm is perfectly
                horizontal, and objectBoundingBox degenerates on a zero-height
                bounding box — the stroke vanishes entirely. */}
            <linearGradient
              id="arc-loader-fill"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2="244"
            >
              {MARK_STOPS.map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>

          <g
            strokeWidth={WORDMARK_STROKE_WIDTH}
            strokeLinecap="butt"
            strokeLinejoin="miter"
          >
            {LETTERS.map(({ path, shift }) => (
              <motion.g
                key={path}
                initial={{ x: 0 }}
                animate={{ x: opened ? shift : 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              >
                <motion.path
                  d={path}
                  stroke="url(#arc-loader-fill)"
                  style={{ pathLength: progress }}
                />

                {/* The light doing the writing. Round cap so the tip is a
                    point of light rather than a chip of one; drop-shadow
                    rather than an SVG filter so the glow costs one composited
                    layer instead of a filter region per letter. */}
                <motion.path
                  d={path}
                  stroke="#ff6a40"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={`${PEN} 1`}
                  style={{
                    strokeDashoffset: penOffset,
                    filter: "drop-shadow(0 0 7px rgba(255,106,64,0.85))",
                  }}
                  animate={{ opacity: writing ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                />
              </motion.g>
            ))}
          </g>
        </svg>

        {/* What the letters stand for, each under its own letter and travelling
            with it. Zero-height layer: the words are absolutely positioned, so
            they can't push the mark off centre as they arrive. */}
        <div className="absolute inset-x-0 top-full">
          {LETTERS.map(({ word, centre, shift }, i) => (
            <div
              key={word}
              // The Tailwind -translate-x-1/2 has to live on this wrapper, not
              // on the animated span: Framer Motion owns `transform` on any
              // element it animates and would overwrite the class.
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${((centre + shift) / 850) * 100}%` }}
            >
              <motion.span
                className="mt-4 block font-body text-[9px] uppercase tracking-[0.3em] text-bone/55 sm:mt-6 sm:text-[11px]"
                initial={{ opacity: 0, y: 8 }}
                animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.5, delay: opened ? 0.25 + i * 0.08 : 0, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
