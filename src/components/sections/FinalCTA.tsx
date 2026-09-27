"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import CTAButton from "@/components/ui/CTAButton";
import { inViewOnce, EASE_OUT } from "@/lib/motion";
import Mosaic from "@/components/ui/Mosaic";

/**
 * The arc closes here.
 *
 * The arc was cut from the Hero because it looped for no reason. This is a
 * different thing and it earns its place: the page opens on Attention and
 * ends on Conversion, and the mark completes exactly at that moment. It is
 * scrubbed by scroll — it holds wherever you stop — and the travelling light
 * is the same point that ascended the logomark in the intro, arriving at the
 * other end of the page. One motif, two beats, no loop.
 */

// A shallow dome across the section. Quadratic, so the light's position is
// evaluated analytically — no getPointAtLength, no measuring a live path.
const P0 = { x: 0, y: 280 };
const P1 = { x: 600, y: -120 };
const P2 = { x: 1200, y: 280 };

function quadraticAt(t: number, a: number, b: number, c: number) {
  const inv = 1 - t;
  return inv * inv * a + 2 * inv * t * b + t * t * c;
}

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.55"],
  });

  const lightX = useTransform(scrollYProgress, (t) => quadraticAt(t, P0.x, P1.x, P2.x));
  const lightY = useTransform(scrollYProgress, (t) => quadraticAt(t, P0.y, P1.y, P2.y));
  const lightOpacity = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      id="final-cta"
      className="relative overflow-hidden bg-deep-black py-32 sm:py-44"
    >
      {/* Dot-mosaic gathering under the arc's apex, where the page closes. */}
      <Mosaic variant="dots" seed={8} fade="radial-gradient(ellipse 55% 60% at 50% 45%, black 20%, transparent 80%)" />
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 300"
        // Anchored to the TOP of its box, not the bottom. The viewBox is
        // 1200 wide, so on a narrow viewport `meet` scales it to about a
        // third and the arc is only ~100px tall; pinned to the bottom of a
        // 60%-height box that put the curve straight through the subline,
        // with the travelling light sitting on the text. Anchoring top keeps
        // the arc above the headline at every width.
        //
        // Not `preserveAspectRatio="none"` — that would fill the box neatly
        // but stretch the light and its halo into ellipses.
        preserveAspectRatio="xMidYMin meet"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="arc-close-light" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300">
            <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e63e12" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="arc-close-halo">
            <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff8a5c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.path
          d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
          stroke="url(#arc-close-light)"
          strokeWidth="1.5"
          style={{ pathLength: scrollYProgress }}
        />

        <motion.g style={{ x: lightX, y: lightY, opacity: lightOpacity }}>
          <circle r="22" fill="url(#arc-close-halo)" />
          <circle r="2.5" fill="#ff6a40" />
        </motion.g>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inViewOnce}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center sm:px-12"
      >
        <h2 className="font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-7xl lg:text-8xl">
          Let&apos;s make something that{" "}
          <Highlight>moves</Highlight>
          .
        </h2>

        <p className="mt-6 font-body text-sm uppercase tracking-[0.25em] text-bone/40">
          One call · Twenty minutes · No pitch deck
        </p>

        <div className="mt-12">
          <CTAButton href="/book" size="lg" magnetic>
            Book a Call
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </CTAButton>
        </div>
      </motion.div>
    </section>
  );
}
