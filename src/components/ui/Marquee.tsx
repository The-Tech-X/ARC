"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Marquee({
  children,
  duration = 22,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`relative flex w-full overflow-hidden ${className}`}>
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex shrink-0 items-center gap-10 pr-10">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-10 pr-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
