"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";


const sizes = {
  sm: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

/**
 * The magnetic transform lives on a wrapper div and the link sits inside it,
 * rather than animating an anchor directly. That keeps Framer Motion's
 * ownership of `transform` off the element Next's Link controls, and means
 * internal routes get real client-side navigation instead of a full reload.
 */
export default function CTAButton({
  href,
  children,
  size = "sm",
  className = "",
  wrapperClassName = "inline-block",
  magnetic = false,
}: {
  href: string;
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
  /** Display of the outer wrapper — pass "block" for a full-width button. */
  wrapperClassName?: string;
  magnetic?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
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
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={wrapperClassName}
    >
      <Link
        href={href}
        className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-signal font-body font-semibold text-deep-black transition-[background-color,box-shadow,transform] duration-300 hover:bg-[#ff6a40] active:scale-[0.97] hover:shadow-[0_0_40px_rgba(255,77,31,0.45)] ${sizes[size]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
