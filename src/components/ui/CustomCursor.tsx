"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

export default function CustomCursor() {
  // Fine-pointer devices only. Read through the shared media-query hook
  // rather than mirrored into state from an effect — same external store,
  // same reason.
  const enabled = useMediaQuery("(pointer: fine)");
  const [isPointer, setIsPointer] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      setIsPointer(!!target.closest("a, button"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-signal"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      animate={
        isPointer
          ? { width: 44, height: 44, backgroundColor: "rgba(255,77,31,0.1)", borderWidth: 1 }
          : { width: 8, height: 8, backgroundColor: "#ff4d1f", borderWidth: 0 }
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
    />
  );
}
