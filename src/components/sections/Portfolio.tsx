"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GoldText from "@/components/ui/GoldText";

const CASES = [
  {
    index: "01",
    niche: "Lifestyle Creator",
    metric: "+180% reach in 60 days",
    tint: "from-charcoal to-deep-black",
  },
  {
    index: "02",
    niche: "DTC Founder",
    metric: "50K → 210K followers in 5 months",
    tint: "from-[#2a2418] to-deep-black",
  },
  {
    index: "03",
    niche: "B2B Personal Brand",
    metric: "3.2x average watch time",
    tint: "from-[#1c2430] to-deep-black",
  },
];

function CaseCard({ item }: { item: (typeof CASES)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div ref={ref} style={{ opacity, scale, filter }} className="flex-1">
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br ${item.tint}`}
      >
        <span className="absolute inset-0 flex items-center justify-center font-heading text-8xl font-bold text-ivory/[0.06]">
          {item.index}
        </span>
        <span className="absolute left-6 top-6 font-body text-xs uppercase tracking-[0.2em] text-ivory/30">
          Case Study — Placeholder
        </span>
      </div>
      <p className="mt-5 font-body text-sm uppercase tracking-[0.2em] text-ivory/40">
        {item.niche}
      </p>
      <p className="mt-2 font-heading text-xl font-bold text-ivory">
        {item.metric}
      </p>
    </motion.div>
  );
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative bg-deep-black py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <div className="max-w-2xl">
          <span className="mb-6 block font-body text-xs uppercase tracking-[0.35em] text-ivory/40">
            Selected Work
          </span>
          <h2 className="font-heading text-4xl font-bold leading-tight text-ivory sm:text-5xl lg:text-6xl">
            Proof, not <GoldText>promises</GoldText>.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8 lg:mt-20">
          {CASES.map((item) => (
            <CaseCard key={item.index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
