"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import GoldText from "@/components/ui/GoldText";
import CTAButton from "@/components/ui/CTAButton";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const rackFocus = {
  hidden: { opacity: 0, y: 16, scale: 1.03, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const PHONE_ICONS = {
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  comment: <path d="M4 5h16v11H8.5L4 19.5V5z" />,
  share: (
    <>
      <path d="M21 3L10.5 13.5" />
      <path d="M21 3l-6.5 18-4-8.5L2 8.5 21 3z" />
    </>
  ),
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
};

// Entrance is intentionally separate from Hero's headline `container`
// stagger rather than nested inside it — it's a self-contained visual, so
// coordinating its timing with a hand-picked delay is simpler and safer
// than tuning shared stagger math.
const phoneReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 },
  },
};

// Counts up once on mount rather than on scroll-into-view (unlike
// ProofStrip's stats) — the phone is above the fold and visible
// immediately, so there's no "scroll to it" moment to key off.
function useCountUp(target: number, delay: number) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [count, target, delay]);

  return display;
}

// The "+342" delta is what gives the rising number a reason: it reads as
// "here's the growth that just happened," not a number ticking for its
// own sake. It fades in once, right as the count lands, then settles to a
// dim resting state — no loop.
function useDeltaOpacity(delay: number) {
  const opacity = useMotionValue(0);
  useEffect(() => {
    const controls = animate(opacity, [0, 1, 1, 0.55], {
      duration: 1,
      delay,
      times: [0, 0.15, 0.7, 1],
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [opacity, delay]);
  return opacity;
}

function StatRow({
  icon,
  target,
  delay,
  deltaOpacity,
}: {
  icon: React.ReactNode;
  target: number;
  delay: number;
  deltaOpacity?: MotionValue<number>;
}) {
  const display = useCountUp(target, delay);

  return (
    <div className="flex items-center gap-1.5">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-ivory/60"
      >
        {icon}
      </svg>
      <motion.span className="tabular-nums font-body text-[11px] font-semibold text-ivory/90">
        {display}
      </motion.span>
      {deltaOpacity && (
        <motion.span
          style={{ opacity: deltaOpacity }}
          className="rounded-full bg-gold/15 px-1.5 py-0.5 font-body text-[9px] font-semibold text-gold"
        >
          ▲ +342
        </motion.span>
      )}
    </div>
  );
}

// A single grounded, gently tilted phone showing a mock Instagram-style
// post — generic UI chrome (heart/comment/share icons, avatar, caption),
// not Meta's actual logo/wordmark. The post media is an abstract gradient
// placeholder, same convention as the Portfolio case-study cards, until
// there's real client content to show here.
function PhoneMock() {
  const likesDelta = useDeltaOpacity(1.6 + 2 + 0.05);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={phoneReveal}
      className="relative mx-auto w-[210px] sm:w-[240px] lg:mx-0 lg:ml-auto lg:w-[270px]"
      style={{ perspective: 1200 }}
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-5 left-1/2 h-8 w-36 -translate-x-1/2 rounded-full bg-black/50 blur-2xl"
      />

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-5, -3, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative rounded-[2.2rem] border border-ivory/10 bg-charcoal p-1.5 shadow-2xl"
          style={{ transform: "rotateY(-10deg) rotateX(6deg) rotateZ(-4deg)" }}
        >
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-3 h-3.5 w-16 -translate-x-1/2 rounded-full bg-deep-black"
          />

          <div className="overflow-hidden rounded-[1.8rem] bg-deep-black px-3 pb-3 pt-8">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[#f1dfae] via-gold to-[#8a6d2f]" />
              <span className="font-body text-[11px] font-semibold text-ivory">
                arc.creators
              </span>
              <span className="ml-auto font-body text-ivory/30">•••</span>
            </div>

            <div className="relative mt-2.5 aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-blue via-charcoal to-gold/25">
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-ivory backdrop-blur">
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    {PHONE_ICONS.play}
                  </svg>
                </span>
              </span>
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1 py-0.5 font-body text-[8px] text-ivory/80">
                0:32
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-3.5">
              <StatRow icon={PHONE_ICONS.heart} target={128402} delay={1.6} deltaOpacity={likesDelta} />
              <StatRow icon={PHONE_ICONS.comment} target={4910} delay={1.8} />
              <StatRow icon={PHONE_ICONS.share} target={21003} delay={2.0} />
            </div>

            <p className="mt-2 font-body text-[10px] leading-snug text-ivory/55">
              <span className="font-semibold text-ivory/75">arc.creators</span>{" "}
              Your next post, blowing up.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LinesGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(242,241,238,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,241,238,0.06) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 100%)",
      }}
    />
  );
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
    >
      <filter id="hero-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="2"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  );
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 65% 45%, transparent 35%, rgba(0,0,0,0.6) 100%)",
      }}
    />
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-deep-black"
    >
      <LinesGrid />
      <Vignette />
      <GrainOverlay />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-28 sm:px-12 sm:pt-24 lg:px-20 lg:pt-0">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeUp}
              className="mb-6 block font-body text-xs uppercase tracking-[0.35em] text-ivory/40"
            >
              Content Strategy · Production · Motion
            </motion.span>

            <motion.h1 variants={rackFocus} className="flex flex-col text-ivory">
              <span className="font-heading text-2xl font-medium leading-tight text-ivory/80 sm:text-4xl lg:text-5xl">
                Stories that
              </span>
              <span className="font-heading text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl lg:text-[8.5rem]">
                <GoldText shimmer shimmerRepeat={false}>
                  MOVE
                </GoldText>
              </span>
              <span className="font-heading text-2xl font-medium leading-tight text-ivory/80 sm:text-4xl lg:text-5xl">
                brands.
              </span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8"
            >
              <CTAButton href="#book-a-call" size="lg" magnetic>
                Book a Call
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </CTAButton>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-ivory/40">
                40+ creators scaled · 100M+ views generated
              </p>
            </motion.div>
          </motion.div>

          <PhoneMock />
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="relative z-10 mb-10 self-center"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-10 w-px bg-gradient-to-b from-ivory/0 via-ivory/40 to-ivory/0" />
      </motion.div>
    </section>
  );
}
