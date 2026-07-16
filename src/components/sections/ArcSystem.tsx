"use client";

import { motion } from "framer-motion";
import GoldText from "@/components/ui/GoldText";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const ICONS = {
  plan: (
    <>
      <path d="M6 2h9l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4h4" />
      <path d="M8 12h6M8 16h4" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M15 6h5v5" />
    </>
  ),
  shoot: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7l1.5-3h5L16 7" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  edit: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.5 7.5L20 18M20 6L8.5 16.5" />
    </>
  ),
  post: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </>
  ),
  analyze: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

// The standard CSS "fake isometric" trick: rotate + skewX on a flat
// container turns it into a proper 30° isometric plane. No 3D transforms,
// no per-point projection math.
const ISO_TRANSFORM = "rotate(-30deg) skewX(30deg)";
// Exact inverse (verified by matrix multiplication and by measuring
// rendered badge dimensions — 44x44, ratio 1.0 exactly) — applied to each
// node so its icon/label render as normal, undistorted shapes while still
// sitting correctly on the tilted floor.
const COUNTER_TRANSFORM = "skewX(-30deg) rotate(30deg)";

const STEPS = [
  { id: "01", label: "Plan the Script", x: 130, y: 260, icon: ICONS.plan },
  { id: "02", label: "Track the Trends", x: 130, y: 140, icon: ICONS.trend },
  { id: "03", label: "Shoot", x: 300, y: 140, icon: ICONS.shoot },
  { id: "04", label: "Edit", x: 300, y: 260, icon: ICONS.edit },
  { id: "05", label: "Post", x: 470, y: 260, icon: ICONS.post },
  { id: "06", label: "Analyze", x: 470, y: 140, icon: ICONS.analyze },
];

const ZONES = [
  { x: 80, y: 95, width: 110, height: 195, label: "Strategy" },
  { x: 250, y: 95, width: 110, height: 195, label: "Production" },
  { x: 420, y: 95, width: 110, height: 195, label: "Growth" },
];

// Each connector is a single straight horizontal-or-vertical segment
// between two consecutive steps — no loop back, just 01 through 06 in
// order, matching how the grid itself is laid out.
const CONNECTORS = [
  { from: STEPS[0], to: STEPS[1], delay: 0 },
  { from: STEPS[1], to: STEPS[2], delay: 0.35 },
  { from: STEPS[2], to: STEPS[3], delay: 0.7 },
  { from: STEPS[3], to: STEPS[4], delay: 1.05 },
  { from: STEPS[4], to: STEPS[5], delay: 1.4 },
];

// A single <line> per connector, gradient defined in real (userSpaceOnUse)
// coordinates matching that exact segment — not objectBoundingBox, which
// degenerates for vertical lines (near-zero width) and was why the flow
// direction read as inconsistent/backwards. The sweep distance scales with
// the segment's own length so it always travels convincingly from the
// start node toward the end node, never the reverse.
function FlowLine({
  x1,
  y1,
  x2,
  y2,
  delay,
  id,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  id: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sweep = len * 0.7;

  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor="rgba(212,175,55,0.3)" />
          <stop offset="38%" stopColor="rgba(212,175,55,0.3)" />
          <stop offset="50%" stopColor="#f8ecc4" />
          <stop offset="62%" stopColor="rgba(212,175,55,0.3)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0.3)" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            additive="sum"
            begin={`${delay}s`}
            from={`${-ux * sweep} ${-uy * sweep}`}
            to={`${ux * sweep} ${uy * sweep}`}
            dur="1.8s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function Node({ x, y, label, icon }: { x: number; y: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* grounding shadow — lives in the same flat plane as the grid, so
          the parent's isometric transform makes it read as resting on the
          tilted floor, instead of the node looking pasted on top of it. */}
      <div
        aria-hidden="true"
        className="absolute rounded-full bg-black/40 blur-[3px]"
        style={{ left: -22, top: -8, width: 44, height: 16 }}
      />
      <div
        style={{
          transform: COUNTER_TRANSFORM,
          marginLeft: -56,
          marginTop: -34,
          width: 112,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-charcoal text-ivory">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icon}
            </svg>
          </span>
          <span className="whitespace-nowrap font-body text-[10px] uppercase tracking-[0.1em] text-ivory/50">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function ZonePanel({
  x,
  y,
  width,
  height,
  label,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}) {
  return (
    <div
      className="absolute rounded-sm border border-gold/20 bg-gold/[0.03]"
      style={{ left: x, top: y, width, height }}
    >
      <div
        style={{
          transform: COUNTER_TRANSFORM,
          position: "absolute",
          left: width / 2,
          top: -14,
          marginLeft: -46,
          width: 92,
        }}
      >
        <span className="block whitespace-nowrap rounded-full border border-gold/30 bg-charcoal px-3 py-1 text-center font-body text-[9px] uppercase tracking-[0.2em] text-gold/70">
          {label}
        </span>
      </div>
    </div>
  );
}

const STAGE_WIDTH = 620;
const STAGE_HEIGHT = 400;

// Fills whatever box its parent gives it — sizing and edge-fading are the
// caller's job (see ArcSystem below), since this now doubles as an in-flow
// block on mobile and an absolute background layer on desktop.
function PipelineDiagram() {
  return (
    <div className="relative h-full w-full">
      {/* Scales the whole composition to fit its container instead of
          cropping it — the transform below only ever sees a fixed-size
          box, so scaling here doesn't disturb the isometric math. */}
      <div
        className="absolute left-1/2 top-1/2 origin-center scale-[0.6] sm:scale-[0.95] lg:scale-100"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          marginLeft: -STAGE_WIDTH / 2,
          marginTop: -STAGE_HEIGHT / 2,
        }}
      >
        <div
          className="h-full w-full"
          style={{
            transform: ISO_TRANSFORM,
            backgroundImage:
              "linear-gradient(to right, rgba(242,241,238,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,241,238,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        >
          {ZONES.map((z) => (
            <ZonePanel key={z.label} {...z} />
          ))}

          <svg
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            className="absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            {CONNECTORS.map((c, i) => (
              <FlowLine
                key={i}
                x1={c.from.x}
                y1={c.from.y}
                x2={c.to.x}
                y2={c.to.y}
                delay={c.delay}
                id={`arc-flow-${i}`}
              />
            ))}
          </svg>

          {STEPS.map((step) => (
            <Node key={step.id} x={step.x} y={step.y} label={`${step.id} — ${step.label}`} icon={step.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}

const LIST_ITEMS = [
  {
    label: "Strategy",
    icon: ICONS.trend,
    description: "What to post, and why — planned around real trends.",
  },
  {
    label: "Production",
    icon: ICONS.shoot,
    description: "Scripted, shot, and cut by a real crew.",
  },
  {
    label: "Growth",
    icon: ICONS.analyze,
    description: "Published everywhere, measured, and improved.",
  },
];

export default function ArcSystem() {
  return (
    <section id="system" className="relative overflow-hidden bg-charcoal pb-28 pt-36 sm:pb-36 sm:pt-44">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
          className="max-w-xl"
        >
          <motion.span
            variants={fadeUp}
            className="mb-6 block font-body text-xs uppercase tracking-[0.35em] text-ivory/40"
          >
            How ARC Works
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl font-bold leading-tight text-ivory sm:text-5xl"
          >
            Not a vendor. A <GoldText>system</GoldText>.
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-6 font-body text-lg text-ivory/70">
            Six steps. Three layers. Nothing falls through the cracks.
          </motion.p>

          <motion.ul variants={container} className="mt-10 flex flex-col gap-5">
            {LIST_ITEMS.map((item) => (
              <motion.li key={item.label} variants={fadeUp} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-ivory">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </span>
                <span>
                  <span className="block font-heading text-base font-bold text-ivory">{item.label}</span>
                  <span className="mt-0.5 block font-body text-sm text-ivory/60">{item.description}</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Background layer — sits behind the text above (z-0 vs z-10), sized
          generously (~60% of the section on large screens) rather than
          squeezed into a grid column, with a radial mask fading all its
          edges to transparent so nothing ever reads as hard-cropped, no
          matter how the diagram bleeds toward the section's edges. Placed
          after the text in DOM order so mobile (where it isn't absolutely
          positioned) stacks it below the heading, not above. */}
      <div
        className="relative mt-16 h-[320px] w-full sm:h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:top-0 lg:mt-0 lg:h-auto lg:w-[60%]"
        style={{
          maskImage:
            "radial-gradient(ellipse 68% 62% at 55% 50%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 68% 62% at 55% 50%, black 50%, transparent 100%)",
        }}
      >
        <PipelineDiagram />
      </div>
    </section>
  );
}
