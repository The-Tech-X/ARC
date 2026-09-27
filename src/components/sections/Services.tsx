"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import { ZONES, type Service, type ServiceIcon } from "@/content/services";

/**
 * The services map (2026-09-27). It reuses the isometric grid the old
 * "How ARC Works" diagram was built on — the user liked the grid — but maps
 * WHAT ARC does instead of repeating the process, which How It Works already
 * covers. Nine services on a tilted floor, grouped into the three stages the
 * site uses (Strategy → Production → Growth), zones linked left to right.
 *
 * Interaction-tied: hovering or focusing a service lights its node and the
 * readout in the text column names it and says what it covers. Nodes are
 * real buttons, so the map works from the keyboard. Below `lg` the diagram
 * would be too small to read, so the same data renders as a grouped list.
 *
 * Isometric mechanics carried over unchanged from ArcSystem (see AGENTS.md →
 * "How the isometric diagram actually works" before touching them):
 * rotate+skewX on the floor, the exact inverse on each node, one outer SVG
 * for connectors, userSpaceOnUse gradients.
 */

const ISO_TRANSFORM = "rotate(-30deg) skewX(30deg)";
const COUNTER_TRANSFORM = "skewX(-30deg) rotate(30deg)";

const ICONS: Record<ServiceIcon, ReactNode> = {
  strategy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  script: (
    <>
      <path d="M6 2h9l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4h4M8 12h6M8 16h4" />
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
  ugc: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M12 8l1 2.2 2.2 1-2.2 1L12 14.4l-1-2.2-2.2-1 2.2-1z" />
    </>
  ),
  motion: (
    <>
      <path d="M3 12c3-6 6-6 9 0s6 6 9 0" />
      <path d="M3 18c3-4 6-4 9 0" />
    </>
  ),
  ads: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l6 5V5L7 10H4a1 1 0 0 0-1 1z" />
      <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  social: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  web: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M2.5 8.5h19M6 6.3h.01M8.5 6.3h.01" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: ServiceIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------- geometry
// Flat (pre-transform) coordinates. Strategy and Growth are single columns;
// Production — four services — is a 2×2 block, so no two labels crowd.
// Compact on purpose (2026-09-27, "looks so small"): tighter zone gaps let
// the whole stage be scaled up without running off the viewport.
const STAGE_WIDTH = 720;
const STAGE_HEIGHT = 460;
const ZONE_Y = 60;
const ZONE_H = 340;
const MID_Y = ZONE_Y + ZONE_H / 2;

const ZONE_BOXES = [
  { x: 40, width: 150, slots: [[115, 165], [115, 295]] },
  { x: 240, width: 240, slots: [[300, 165], [420, 165], [300, 295], [420, 295]] },
  { x: 530, width: 150, slots: [[605, 120], [605, 230], [605, 340]] },
] as const;

const CONNECTORS = [
  { x1: 190, x2: 240, delay: 0 },
  { x1: 480, x2: 530, delay: 0.6 },
];

/** How far the floor grid runs past the stage on every side before fading. */
const GRID_BLEED = 700;

function FlowLine({ x1, x2, y, delay, id }: { x1: number; x2: number; y: number; delay: number; id: string }) {
  const sweep = (x2 - x1) * 0.9;
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y} x2={x2} y2={y}>
          <stop offset="0%" stopColor="rgba(255,77,31,0.3)" />
          <stop offset="40%" stopColor="rgba(255,77,31,0.3)" />
          <stop offset="50%" stopColor="#ffd2bf" />
          <stop offset="60%" stopColor="rgba(255,77,31,0.3)" />
          <stop offset="100%" stopColor="rgba(255,77,31,0.3)" />
          <animateTransform attributeName="gradientTransform" type="translate" additive="sum" begin={`${delay}s`} from={`${-sweep} 0`} to={`${sweep} 0`} dur="1.8s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function Node({
  x,
  y,
  service,
  active,
  dimmed,
  onActivate,
}: {
  x: number;
  y: number;
  service: Service;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div aria-hidden className="absolute rounded-full bg-black/40 blur-[3px]" style={{ left: -26, top: -9, width: 52, height: 18 }} />
      <div style={{ transform: COUNTER_TRANSFORM, marginLeft: -66, marginTop: -40, width: 132 }}>
        <button
          type="button"
          onMouseEnter={onActivate}
          onFocus={onActivate}
          onClick={onActivate}
          aria-label={`${service.name}: ${service.line}`}
          className={`group flex w-full flex-col items-center gap-2 rounded-lg transition-opacity duration-300 ${dimmed ? "opacity-45" : "opacity-100"}`}
        >
          <span
            className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform,box-shadow] duration-300 ${
              active
                ? "scale-110 border-signal bg-signal text-deep-black shadow-[0_0_24px_rgba(255,77,31,0.45)]"
                : "border-signal/50 bg-charcoal text-bone group-hover:border-signal"
            }`}
          >
            <Icon name={service.icon} size={22} />
          </span>
          <span className={`text-balance text-center font-body text-[11px] uppercase leading-tight tracking-[0.1em] transition-colors duration-300 ${active ? "text-bone" : "text-bone/55"}`}>
            {service.name}
          </span>
        </button>
      </div>
    </div>
  );
}

function ZonePanel({ x, width, label }: { x: number; width: number; label: string }) {
  return (
    <div className="absolute rounded-sm border border-signal/20 bg-signal/[0.03]" style={{ left: x, top: ZONE_Y, width, height: ZONE_H }}>
      <div style={{ transform: COUNTER_TRANSFORM, position: "absolute", left: width / 2, top: -14, marginLeft: -46, width: 92 }}>
        <span className="block whitespace-nowrap rounded-full border border-signal/30 bg-charcoal px-3 py-1 text-center font-body text-[10px] uppercase tracking-[0.2em] text-signal/80">
          {label}
        </span>
      </div>
    </div>
  );
}

function ServicesMap({ active, setActive }: { active: string | null; setActive: (name: string) => void }) {
  return (
    <div className="relative h-full w-full">
      {/* The isometric floor projects ~1.2× wider than its flat width, so the
          stage is scaled to keep every node inside the viewport and off the
          text column, and centred right of the layer's middle. Measured:
          re-measure after any geometry change (see AGENTS.md). */}
      <div
        className="absolute left-[55%] top-1/2 origin-center scale-[0.72] xl:scale-[1.0]"
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, marginLeft: -STAGE_WIDTH / 2, marginTop: -STAGE_HEIGHT / 2 }}
      >
        <div className="h-full w-full" style={{ transform: ISO_TRANSFORM }}>
          {/* The floor: a grid far larger than the stage, faded radially in
              the same flat plane, so the tilt carries the fade with it and
              the grid dissolves into the section instead of ending on a
              visible edge. Offset by a whole number of cells so the lines
              still meet the zone panels square. */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: -GRID_BLEED,
              top: -GRID_BLEED,
              width: STAGE_WIDTH + GRID_BLEED * 2,
              height: STAGE_HEIGHT + GRID_BLEED * 2,
              backgroundImage:
                "linear-gradient(to right, rgba(243,240,234,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(243,240,234,0.08) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              backgroundPosition: `${GRID_BLEED % 40}px ${GRID_BLEED % 40}px`,
              maskImage: "radial-gradient(ellipse 27% 26% at 50% 50%, black 30%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 27% 26% at 50% 50%, black 30%, transparent 100%)",
            }}
          />
          {ZONES.map((zone, z) => (
            <ZonePanel key={zone.name} x={ZONE_BOXES[z].x} width={ZONE_BOXES[z].width} label={zone.name} />
          ))}
          <svg width={STAGE_WIDTH} height={STAGE_HEIGHT} className="absolute inset-0 overflow-visible" aria-hidden>
            {CONNECTORS.map((c, i) => (
              <FlowLine key={i} x1={c.x1} x2={c.x2} y={MID_Y} delay={c.delay} id={`svc-flow-${i}`} />
            ))}
          </svg>
          {ZONES.map((zone, z) =>
            zone.services.map((service, s) => {
              const [x, y] = ZONE_BOXES[z].slots[s];
              return (
                <Node
                  key={service.name}
                  x={x}
                  y={y}
                  service={service}
                  active={active === service.name}
                  dimmed={active !== null && active !== service.name}
                  onActivate={() => setActive(service.name)}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };

export default function Services() {
  const [active, setActive] = useState<string | null>(null);
  const all = ZONES.flatMap((z) => z.services.map((s) => ({ ...s, zone: z.name })));
  const current = all.find((s) => s.name === active);

  return (
    <section id="services" className="relative overflow-hidden bg-charcoal pb-28 pt-36 sm:pb-36 sm:pt-44 lg:min-h-[880px]">
      {/* The text column sits above the map (z-10), but the wrapper spans the
          full width — so it passes pointer events through, and only the
          column itself takes them. Otherwise it would cover the nodes. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="pointer-events-auto max-w-md lg:max-w-sm xl:max-w-md"
        >
          <motion.span variants={reveal} className="mb-6 block font-type text-sm text-bone/60 sm:text-base">
            Services
          </motion.span>
          <motion.h2 variants={reveal} className="font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-6xl lg:text-7xl">
            One studio. Every <Highlight>piece</Highlight>.
          </motion.h2>
          <motion.p variants={reveal} className="mt-6 font-body text-lg text-bone/70">
            Nine services across three stages — so the brief, the shoot and the ads never get lost between vendors.
          </motion.p>

          {/* Desktop readout: names whichever service is lit on the map. */}
          <motion.div variants={reveal} className="mt-10 hidden min-h-[124px] border-l border-signal/40 pl-5 lg:block" aria-live="polite">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div key={current.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  <p className="font-body text-[11px] uppercase tracking-[0.25em] text-bone/40">{current.zone}</p>
                  <p className="mt-2 font-type text-2xl text-bone">{current.name}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-bone/65">{current.line}</p>
                </motion.div>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-1 font-type text-base text-bone/45">
                  Point at any service on the map →
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Below lg: the same nine, as a grouped list. */}
        <div className="pointer-events-auto mt-14 flex flex-col gap-10 lg:hidden">
          {ZONES.map((zone) => (
            <div key={zone.name}>
              <p className="flex items-baseline gap-3 border-b border-bone/10 pb-3">
                <span className="font-body text-[11px] uppercase tracking-[0.25em] text-signal/80">{zone.name}</span>
                <span className="font-body text-xs text-bone/40">{zone.summary}</span>
              </p>
              <ul className="mt-2">
                {zone.services.map((s) => (
                  <li key={s.name} className="flex items-start gap-4 border-b border-bone/[0.06] py-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-signal/40 text-bone">
                      <Icon name={s.icon} size={16} />
                    </span>
                    <span>
                      <span className="block font-body text-base font-semibold text-bone">{s.name}</span>
                      <span className="mt-0.5 block font-body text-sm text-bone/60">{s.line}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* The map: a background layer on lg, edge-faded, sized generously
          rather than squeezed into a column (see AGENTS.md, bug #7). */}
      {/* No hard mask on this layer any more: the floor fades itself, and a
          rectangular layer mask was what gave the grid a straight edge. */}
      <div className="absolute inset-y-0 right-0 hidden w-[64%] lg:block">
        <ServicesMap active={active} setActive={setActive} />
      </div>
    </section>
  );
}
