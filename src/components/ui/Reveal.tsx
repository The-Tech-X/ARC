"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, rackFocus, inViewOnce } from "@/lib/motion";

const VARIANTS = { fadeUp, rackFocus } as const;

/**
 * A one-time scroll-into-view entrance. Wraps the `initial/whileInView/
 * viewport once` boilerplate that would otherwise be repeated in every
 * section.
 *
 * Use for supporting content. Anything that needs to be *scrubbed* by scroll
 * position rather than merely triggered by it should use its own
 * `useScroll({ target: ref })` instead — see the technique documented in
 * AGENTS.md and used in Problem.tsx.
 */
export default function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const Component = motion[as];
  const base = VARIANTS[variant];

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      variants={{
        hidden: base.hidden,
        show: {
          ...base.show,
          transition: { ...base.show.transition, delay },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
