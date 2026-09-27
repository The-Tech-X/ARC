"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROCESS } from "@/content/process";

/**
 * The process drawn as the thing it's a process for: an editing timeline.
 * Clips on a track, a ruler, and a playhead that scroll drives left to right.
 * Each step resolves as the playhead reaches it.
 *
 * Accent is the playhead and nothing else here. It means "you are here" — the
 * same discipline that keeps it meaning "this is the action" elsewhere.
 * Clips brighten toward bone, they don't turn accent.
 */

// Static texture, deterministic rather than random so it's stable across
// renders. Reads as an audio waveform inside each clip; it never animates.
function waveHeight(clip: number, bar: number) {
  return 22 + ((clip * 31 + bar * 17) % 56);
}

function Clip({
  index,
  mark,
  progress,
  threshold,
}: {
  index: number;
  mark: string;
  progress: MotionValue<number>;
  threshold: number;
}) {
  const heat = useTransform(progress, [threshold, threshold + 0.08], [0, 1]);
  const opacity = useTransform(heat, [0, 1], [0.35, 1]);
  const borderOpacity = useTransform(heat, [0, 1], [0.08, 0.3]);
  const borderColor = useTransform(borderOpacity, (v) => `rgba(243,240,234,${v})`);

  return (
    <motion.div
      style={{ opacity, borderColor }}
      className="flex h-full flex-col justify-between rounded border bg-deep-black/60 p-2 sm:p-3"
    >
      <span className="font-body text-[9px] tabular-nums tracking-[0.15em] text-bone/45 sm:text-[10px]">
        {mark}
      </span>
      {/* The container needs an explicit height: the bars are sized in
          percentages, and a percentage height against an auto-height parent
          resolves to zero — which rendered the clips completely empty.
          `flex-1` rather than `w-full` so the bars share the width evenly
          instead of each claiming it and being squashed. */}
      <div aria-hidden="true" className="flex h-9 items-end gap-[2px] sm:h-11">
        {Array.from({ length: 14 }).map((_, bar) => (
          <span
            key={bar}
            className="flex-1 bg-bone/25"
            style={{ height: `${waveHeight(index, bar)}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StepBody({
  step,
  progress,
  threshold,
}: {
  step: (typeof PROCESS)[number];
  progress: MotionValue<number>;
  threshold: number;
}) {
  const heat = useTransform(progress, [threshold, threshold + 0.08], [0, 1]);
  const opacity = useTransform(heat, [0, 1], [0.3, 1]);
  const y = useTransform(heat, [0, 1], [10, 0]);

  return (
    <motion.div style={{ opacity, y }}>
      <h3 className="font-heading text-lg font-bold text-bone sm:text-xl">
        {step.title}
      </h3>
      <p className="mt-3 font-body text-sm leading-relaxed text-bone/55">
        {step.body}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.75"],
  });

  const playheadLeft = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how" className="relative bg-deep-black py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <SectionHeading eyebrow="How It Works">
          Four steps. No <Highlight>mystery</Highlight>.
        </SectionHeading>

        <div ref={ref} className="mt-16 lg:mt-20">
          {/* The track */}
          <div className="relative">
            <div className="grid h-24 grid-cols-4 gap-1.5 sm:h-28 sm:gap-2">
              {PROCESS.map((step, index) => (
                <Clip
                  key={step.mark}
                  index={index}
                  mark={step.mark}
                  progress={scrollYProgress}
                  threshold={index / PROCESS.length}
                />
              ))}
            </div>

            {/* Playhead. Scroll is its only driver — it holds still when you
                do, which is the whole point. */}
            <motion.div
              aria-hidden="true"
              style={{ left: playheadLeft }}
              className="pointer-events-none absolute -top-2 bottom-[-0.5rem] w-px bg-signal"
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-signal" />
            </motion.div>
          </div>

          {/* Ruler */}
          <div aria-hidden="true" className="mt-2 flex justify-between">
            {Array.from({ length: 25 }).map((_, tick) => (
              <span
                key={tick}
                className={`w-px bg-bone/15 ${tick % 4 === 0 ? "h-2" : "h-1"}`}
              />
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS.map((step, index) => (
              <StepBody
                key={step.mark}
                step={step}
                progress={scrollYProgress}
                threshold={index / PROCESS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
