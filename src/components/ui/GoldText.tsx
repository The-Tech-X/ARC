"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Matches the logo's actual foil treatment: light catches the top of each
// stroke and deepens slightly toward the bottom — vertical, not diagonal —
// and stays inside a light "warm champagne" band, never drifting into dark
// bronze/amber.
const BASE_GRADIENT = "linear-gradient(180deg, #f1dfae 0%, #d4af37 55%, #c7a565 100%)";

// A thin, near-white highlight band that sweeps horizontally over the base
// gradient, like light glinting across foil — layered on top rather than
// replacing the base shading, so the metal quality holds throughout.
const SHIMMER_SWEEP =
  "linear-gradient(100deg, transparent 0%, transparent 40%, rgba(255,255,255,0.6) 48%, rgba(255,255,255,0.6) 50%, transparent 58%, transparent 100%)";

export default function GoldText({
  children,
  className = "",
  shimmer = false,
  shimmerRepeat = true,
}: {
  children: ReactNode;
  className?: string;
  shimmer?: boolean;
  shimmerRepeat?: boolean;
}) {
  if (!shimmer) {
    return (
      <span
        className={`bg-clip-text text-transparent ${className}`}
        style={{ backgroundImage: BASE_GRADIENT }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: BASE_GRADIENT }}
      >
        {children}
      </span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 bg-clip-text text-transparent"
        style={{ backgroundImage: SHIMMER_SWEEP, backgroundSize: "300% 100%" }}
        initial={{ backgroundPositionX: "-40%" }}
        animate={{
          backgroundPositionX: shimmerRepeat ? ["0%", "300%"] : "160%",
        }}
        transition={
          shimmerRepeat
            ? { duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
            : { duration: 1.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {children}
      </motion.span>
    </span>
  );
}
