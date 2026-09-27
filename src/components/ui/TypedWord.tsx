"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TYPEWRITER_STYLE } from "@/components/ui/Highlight";

/**
 * The Hero's "Move", typed in once: letters strike in one at a time behind a
 * caret, the caret fades, and the word holds still. Chosen by the user on
 * 2026-09-27 (preview "0b").
 *
 * Motion category: one-time entrance (AGENTS.md → Motion philosophy). It
 * starts when `start` turns true — the Hero passes `useIntroDone()`, so it
 * plays as the loader clears rather than unseen behind it — and never repeats.
 * Under reduced motion the finished word is shown and nothing moves.
 *
 * Special Elite is monospaced, so the caret's position is just a count of
 * advances; nothing is measured.
 */

// Uneven gaps between strikes read as a person typing, not a metronome.
const STRIKES_MS = [0, 170, 310, 490];
const START_MS = 350;
const CARET_HOLD_MS = 500;
const ADVANCE = "calc(1ch - 0.04em)"; // 1ch less TYPEWRITER_STYLE's tracking

export default function TypedWord({
  text,
  start,
  className = "",
}: {
  text: string;
  start: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [caretGone, setCaretGone] = useState(false);

  useEffect(() => {
    if (!start || reduced) return;
    const at = (i: number) => START_MS + (STRIKES_MS[i] ?? i * 160);
    const timers = [...text].map((_, i) => setTimeout(() => setTyped(i + 1), at(i)));
    timers.push(setTimeout(() => setCaretGone(true), at(text.length - 1) + CARET_HOLD_MS));
    return () => timers.forEach(clearTimeout);
  }, [start, reduced, text]);

  const shown = reduced ? text.length : typed;

  return (
    <span
      className={`relative inline-block font-type normal-case text-signal ${className}`}
      style={TYPEWRITER_STYLE}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={false}
            animate={{ opacity: i < shown ? 1 : 0, y: i < shown ? 0 : "-0.06em" }}
            transition={{ duration: 0.09, ease: "easeOut" }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute bottom-[0.12em] w-[0.07em] rounded-[1px] bg-signal"
          style={{ height: "0.72em", left: `calc(${shown} * ${ADVANCE})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: start && !caretGone ? 1 : 0 }}
          transition={{ duration: caretGone ? 0.35 : 0 }}
        />
      )}
    </span>
  );
}
