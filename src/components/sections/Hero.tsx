"use client";

import { motion } from "framer-motion";
import TypedWord from "@/components/ui/TypedWord";
import ArcOfStories from "@/components/ui/ArcOfStories";
import CTAButton from "@/components/ui/CTAButton";
import { useIntroDone } from "@/components/providers/IntroProvider";
import { fadeUp, rackFocus, staggerContainer } from "@/lib/motion";
import Halftone from "@/components/ui/Halftone";

const container = staggerContainer(0.15, 0.3);

function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
    >
      <filter id="hero-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="2"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  );
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 65% 45%, transparent 35%, rgba(0,0,0,0.6) 100%)",
      }}
    />
  );
}

export default function Hero() {
  // The intro overlay owns the first ~2.4s. Starting the entrance before it
  // clears would play the whole thing behind a black screen.
  const introDone = useIntroDone();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-deep-black"
    >
      {/* The printed texture: a dithered-halftone cloud behind the arc, and
          a fainter one drifting in from the top-left. See Halftone.tsx. */}
      <Halftone
        seed={2}
        spots={[
          { x: 72, y: 50, rx: 42, ry: 60 },
          { x: 6, y: 4, rx: 34, ry: 40, strength: 0.6 },
        ]}
      />
      <Vignette />
      <GrainOverlay />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-28 sm:px-12 sm:pt-24 lg:px-20 lg:pt-0">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate={introDone ? "show" : "hidden"}
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeUp}
              className="mb-6 flex items-center gap-3 font-type text-sm text-bone/60 sm:text-base"
            >
              {/* The REC light: the accent's origin, and the page's first mark. */}
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-signal shadow-[0_0_12px_var(--color-signal)]" />
              Strategy · Production · Growth
            </motion.span>

            {/* Tall condensed capitals around one typed word. "Move" is set
                wider than "BRANDS." so it is the largest thing on screen, and
                its padding is measured so the gaps above and below it match.
                It types itself in once, as the intro clears (TypedWord). */}
            <motion.h1 variants={rackFocus} className="flex flex-col items-start uppercase text-bone">
              <span className="text-5xl font-bold leading-[0.9] text-bone/75 sm:text-7xl">
                Stories that
              </span>
              <TypedWord
                text="Move"
                start={introDone}
                className="-mb-[0.1em] whitespace-nowrap pt-[0.2em] text-[6.5rem] leading-[0.8] sm:text-[10.5rem] lg:text-[10rem] xl:text-[12rem]"
              />
              <span className="text-7xl font-extrabold leading-[0.9] sm:text-9xl">
                Brands.
              </span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <CTAButton href="/book" size="lg" magnetic>
                Book a Call
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </CTAButton>
              {/* Craft, not metrics. This slot used to carry invented
                  results numbers; there are none to claim. */}
              <p className="whitespace-nowrap font-body text-xs uppercase tracking-[0.2em] text-bone/40">
                Scripted · Shot · Edited — end to end
              </p>
            </motion.div>
          </motion.div>

          {/* The Arc of Stories: story frames on ARC's arc. It sweeps in
              as "Move" lands, then the cursor turns it. Replaced the phone
              mock-up on 2026-09-27. */}
          <ArcOfStories start={introDone} />
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="relative z-10 mb-10 self-center"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-10 w-px bg-gradient-to-b from-bone/0 via-bone/40 to-bone/0" />
      </motion.div>
    </section>
  );
}
