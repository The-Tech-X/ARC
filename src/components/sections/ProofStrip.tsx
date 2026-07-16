"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import GoldText from "@/components/ui/GoldText";

const STATS = [
  { target: 40, decimals: 0, suffix: "+", label: "Creators scaled" },
  { target: 100, decimals: 0, suffix: "M+", label: "Views generated" },
  { target: 3.2, decimals: 1, suffix: "x", label: "Avg. engagement lift" },
];

function StatNumber({
  target,
  decimals,
  suffix,
}: {
  target: number;
  decimals: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, count, target]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export default function ProofStrip() {
  return (
    <section
      id="proof"
      className="relative bg-deep-black py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 sm:grid-cols-3 sm:gap-8 sm:px-12 lg:px-20">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-heading text-5xl font-bold sm:text-6xl">
              <GoldText>
                <StatNumber
                  target={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </GoldText>
            </div>
            <p className="mt-3 font-body text-sm uppercase tracking-[0.2em] text-ivory/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
