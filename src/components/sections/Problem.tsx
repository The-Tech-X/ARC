"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import GoldText from "@/components/ui/GoldText";

function useReveal(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.55"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  return { opacity, y };
}

function useDimmed(own: MotionValue<number>, dimFactor: MotionValue<number>) {
  return useTransform([own, dimFactor], ([o, d]: number[]) => o * d);
}

const quietLine =
  "font-heading text-xl font-medium leading-snug text-ivory/60 sm:text-3xl";

export default function Problem() {
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const emptyLineRef = useRef<HTMLParagraphElement>(null);
  const emptyWordRef = useRef<HTMLSpanElement>(null);
  const aloneLineRef = useRef<HTMLDivElement>(null);
  const aloneWordRef = useRef<HTMLSpanElement>(null);
  const gapLineRef = useRef<HTMLParagraphElement>(null);
  const closingRef = useRef<HTMLParagraphElement>(null);

  const eyebrow = useReveal(eyebrowRef);
  const emptyLine = useReveal(emptyLineRef);
  const gapLine = useReveal(gapLineRef);
  const closing = useReveal(closingRef);

  // "empty" — the quiet line. A slow, barely-there dim. No spotlight, no
  // competing for attention with what's coming.
  const { scrollYProgress: emptyWordProgress } = useScroll({
    target: emptyWordRef,
    offset: ["center 0.75", "center 0.45"],
  });
  const emptyOpacity = useTransform(emptyWordProgress, [0, 1], [0.55, 0.35]);
  const emptyTracking = useTransform(
    emptyWordProgress,
    [0, 1],
    ["0.02em", "0.12em"]
  );

  // "alone." — the loud line. Snaps into place over a short scroll
  // distance, then keeps slowly growing as you linger past it. Pushed off
  // the shared left margin everything else sits on, so it visibly breaks
  // away from the column rather than just sitting bigger inside it.
  const { scrollYProgress: aloneSnap } = useScroll({
    target: aloneWordRef,
    offset: ["center 0.8", "center 0.68"],
  });
  const { scrollYProgress: aloneLinger } = useScroll({
    target: aloneWordRef,
    offset: ["center 0.68", "center 0.2"],
  });
  const aloneOpacity = useTransform(aloneSnap, [0, 1], [0, 1]);
  const aloneSnapScale = useTransform(aloneSnap, [0, 1], [0.82, 1.04]);
  const aloneLingerScale = useTransform(aloneLinger, [0, 1], [1, 1.22]);
  const aloneScale = useTransform(
    [aloneSnapScale, aloneLingerScale],
    ([snap, linger]: number[]) => snap * linger
  );

  const { scrollYProgress: aloneLineTransit } = useScroll({
    target: aloneLineRef,
    offset: ["start 0.9", "end 0.1"],
  });
  const dimFactor = useTransform(
    aloneLineTransit,
    [0, 0.3, 0.5, 1],
    [1, 0.22, 0.22, 1]
  );

  // "gap." — the rupture. A tight scroll window, sudden split: the two
  // halves of the sentence drift apart in opposite directions and a void
  // fades in between them, instead of the words just spacing out.
  const { scrollYProgress: gapRupture } = useScroll({
    target: gapLineRef,
    offset: ["center 0.68", "center 0.58"],
  });
  const gapLeftShift = useTransform(gapRupture, [0, 1], [0, -28]);
  const gapRightShift = useTransform(gapRupture, [0, 1], [0, 28]);
  const gapVoidOpacity = useTransform(gapRupture, [0, 1], [0, 1]);

  return (
    <section
      id="problem"
      className="relative overflow-hidden bg-charcoal py-32 sm:py-44"
    >
      <div className="mx-auto max-w-4xl px-6 sm:px-12 lg:px-20">
        <div className="flex flex-col gap-16 sm:gap-24">
          <motion.span
            ref={eyebrowRef}
            style={{ opacity: useDimmed(eyebrow.opacity, dimFactor), y: eyebrow.y }}
            className="block font-body text-xs uppercase tracking-[0.35em] text-ivory/40"
          >
            The Cost Of Doing It Alone
          </motion.span>

          <motion.p
            ref={emptyLineRef}
            style={{
              opacity: useDimmed(emptyLine.opacity, dimFactor),
              y: emptyLine.y,
            }}
            className={quietLine}
          >
            Content calendars that go{" "}
            <motion.span
              ref={emptyWordRef}
              style={{ opacity: emptyOpacity, letterSpacing: emptyTracking }}
            >
              empty
            </motion.span>{" "}
            by Wednesday.
          </motion.p>

          <div ref={aloneLineRef} className="py-4">
            <p className={quietLine}>Filming, editing, posting —</p>
            <motion.span
              ref={aloneWordRef}
              style={{ opacity: aloneOpacity, scale: aloneScale }}
              className="ml-8 mt-3 inline-block origin-left text-6xl font-black text-ivory sm:ml-24 sm:text-8xl lg:ml-40"
            >
              alone.
            </motion.span>
          </div>

          <motion.p
            ref={gapLineRef}
            style={{ opacity: useDimmed(gapLine.opacity, dimFactor), y: gapLine.y }}
            className={`flex flex-wrap items-baseline ${quietLine}`}
          >
            <motion.span style={{ x: gapLeftShift }}>
              Algorithms that punish every
            </motion.span>
            <motion.span
              aria-hidden="true"
              style={{ opacity: gapVoidOpacity }}
              className="mx-3 inline-block h-px w-10 bg-ivory/20 sm:w-16"
            />
            <motion.span style={{ x: gapRightShift }}>gap.</motion.span>
          </motion.p>

          <motion.p
            ref={closingRef}
            style={{ opacity: useDimmed(closing.opacity, dimFactor), y: closing.y }}
            className="font-heading text-xl font-medium text-ivory sm:text-2xl"
          >
            That&apos;s the gap{" "}
            <GoldText shimmer shimmerRepeat={false}>
              ARC
            </GoldText>{" "}
            exists to close.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
