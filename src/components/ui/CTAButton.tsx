"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

const GOLD_BUTTON_GRADIENT = "linear-gradient(180deg, #f1dfae 0%, #d4af37 55%, #c7a565 100%)";

const sizes = {
  sm: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

export default function CTAButton({
  href,
  children,
  size = "sm",
  className = "",
  magnetic = false,
}: {
  href: string;
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
  magnetic?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 });

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ backgroundImage: GOLD_BUTTON_GRADIENT, x: springX, y: springY }}
      className={`group inline-flex items-center gap-2 rounded-full font-body font-semibold text-deep-black transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.45)] ${sizes[size]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
