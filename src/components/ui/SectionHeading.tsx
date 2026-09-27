"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, rackFocus, staggerContainer, inViewOnce } from "@/lib/motion";

/**
 * The eyebrow + headline pair that opens most sections. This pattern was
 * copy-pasted across Portfolio, ArcSystem and others; centralising it keeps
 * the type scale and the entrance timing identical everywhere.
 *
 * The headline takes `children` rather than a string so callers can wrap the
 * one emphasised word in <Highlight> themselves — the accent is on a strict
 * allow-list and this component shouldn't be deciding where it goes.
 *
 * Signal system: the eyebrow is set in the typewriter face (the section's
 * name only — a "Scene 01" numbering was tried and cut by the user on
 * 2026-09-27), the headline in tall condensed capitals. `tone="light"` is for
 * the bone sections (Pricing).
 */
export default function SectionHeading({
  eyebrow,
  children,
  align = "left",
  tone = "dark",
  className = "",
}: {
  eyebrow: string;
  children: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <motion.div
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}
    >
      <motion.span
        variants={fadeUp}
        className={`mb-6 block font-type text-sm sm:text-base ${light ? "text-deep-black/60" : "text-bone/60"}`}
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={rackFocus}
        className={`font-heading text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl lg:text-7xl ${light ? "text-deep-black" : "text-bone"}`}
      >
        {children}
      </motion.h2>
    </motion.div>
  );
}
