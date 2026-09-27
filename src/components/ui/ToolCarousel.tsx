"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { TOOL_LOGOS, type ToolLogo } from "@/lib/toolLogos";

/**
 * The About grid's fourth card: the toolkit files through a beam of light,
 * left to right, and each tool takes its turn lit at the centre.
 *
 * ## The motion, as specified
 *
 * Logos enter from off the top-left, curve **down** into the centre — the low
 * point of the arc, under the beam — where they grow, light up and **hold for
 * two seconds**, then continue **up and out to the right**. The centre is a
 * *position*, not a logo: whatever is standing in it is the hero.
 *
 * This replaced a planetary orbit (tiles circling a fixed Premiere tile), which
 * the user rejected on 2026-09-05 as the wrong motion. **If you are about to
 * make these revolve around a fixed centre, that is the thing that was already
 * rejected.**
 *
 * ## Why it's built this way
 *
 * **Every tool is mounted all the time.** Each one holds a signed slot — 0 is
 * the lit centre, ±2 are the outer visible places, ±3 and ±4 are parked
 * offstage at zero opacity. A step adds one to every slot, so Framer tweens
 * each tile to its next place; the one at +2 glides out to the right and the
 * one at −3 glides in from the left.
 *
 * The lap is closed by the jump from +4 to −4 — right-hand parking to left-hand
 * parking — which is done with **`duration: 0` while the tile is invisible**,
 * so nothing is ever seen flying backwards across the card.
 *
 * This was first built with `AnimatePresence` over a five-tile window, which is
 * the obvious way to do it and was wrong: the tile leaving the window rendered
 * with stale props and sat at an old slot instead of gliding out, so two logos
 * stacked on one spot and the right-hand place was left empty. If you rewrite
 * this, don't reach for AnimatePresence again.
 *
 * React re-renders once per step (every ~2.8s), not per frame; the tweening is
 * Framer's.
 *
 * ## This is a deliberate exception to the no-loops rule
 *
 * AGENTS.md bans motion that isn't tied to scroll, cursor or a one-time beat,
 * and this loops on a timer. **The user asked for it directly, repeatedly.** It
 * stays. Don't revert it to a static arrangement on the strength of that rule —
 * the rule has an owner and they've overridden it here. It does respect
 * `prefers-reduced-motion`: the carousel holds on its first frame.
 */

/**
 * Placeholders the user intends to swap for their real stack. Order is the
 * order they file through, so it's also a reading order.
 */
const TOOLS: ToolLogo[] = [
  TOOL_LOGOS.premiere,
  TOOL_LOGOS.aftereffects,
  TOOL_LOGOS.claude,
  TOOL_LOGOS.photoshop,
  TOOL_LOGOS.chatgpt,
  TOOL_LOGOS.davinci,
  TOOL_LOGOS.lightroom,
  TOOL_LOGOS.figma,
  TOOL_LOGOS.adobe,
];

/**
 * Slots run from −HALF to +HALF, one per tool. |slot| ≤ 2 is on screen — five
 * tiles, as in the reference composition — and the rest wait offstage.
 */
const HALF = Math.floor(TOOLS.length / 2);
const VISIBLE = 2;
/** Where tiles wait: off the card, past the outermost visible slot. */
const OFFSTAGE = 2.9;

const GLIDE_S = 0.8;
const HOLD_MS = 2000;
const CYCLE_MS = HOLD_MS + GLIDE_S * 1000;

/**
 * The arc. `cy` is its **lowest** point (SVG y grows downward), so the tiles
 * rise as they move away from centre — a valley, matching the reference's
 * formation: two tiles high on each side, the lit one low in the middle.
 */
const ARC = { cx: 280, cy: 150, spread: 200, rise: 88 };
const TILE = 68;
const LOGO = 32;

/**
 * Slot → where that tile sits, how big it is, how present it is. Slots beyond
 * the visible range are clamped to the offstage parking place and faded out,
 * so a tile waiting its turn doesn't drift further and further off-canvas.
 */
function place(slot: number) {
  const parked = Math.abs(slot) > VISIBLE;
  const u = (parked ? Math.sign(slot) * OFFSTAGE : slot) / 2;
  const a = Math.min(1, Math.abs(u));
  return {
    x: ARC.cx + ARC.spread * u,
    y: ARC.cy - ARC.rise * u * u,
    // Nearly flat away from the centre, then a distinct step up *at* it: the
    // centre tile should read as featured, not as the near end of a depth ramp.
    scale: 0.78 + 0.22 * (1 - a) ** 2,
    opacity: parked ? 0 : 1 - 0.4 * a,
  };
}

/** How "lit" a tile is. Full at the centre, gone by the next slot along. */
const heat = (slot: number) => Math.max(0, 1 - Math.abs(slot));

/**
 * Dust in the beam: [x, y, radius, opacity]. Hand-placed rather than random so
 * the layout is stable between renders — a `Math.random()` here would differ
 * between the server and client HTML and trip hydration.
 */
const MOTES: [number, number, number, number][] = [
  [262, 34, 1.1, 0.75],
  [297, 41, 0.8, 0.5],
  [279, 55, 1.3, 0.8],
  [251, 62, 0.9, 0.4],
  [308, 66, 1, 0.55],
  [268, 74, 0.7, 0.45],
  [292, 82, 1.2, 0.65],
  [240, 88, 0.8, 0.3],
  [318, 92, 0.9, 0.35],
  [274, 96, 0.9, 0.5],
  [301, 104, 0.7, 0.3],
  [255, 108, 1, 0.4],
  [286, 116, 0.8, 0.35],
  [230, 40, 0.7, 0.25],
  [332, 52, 0.8, 0.28],
];

/** A four-point sparkle, on the same 24×24 grid as the tool marks. */
const SPARKLE = "M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z";

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Signed slot in [−HALF, +HALF]: which place this tool currently occupies. */
function slotOf(step: number, index: number) {
  const raw = mod(step - index, TOOLS.length);
  return raw > HALF ? raw - TOOLS.length : raw;
}

export default function ToolCarousel() {
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStep((s) => s + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const transition = { duration: reduced ? 0 : GLIDE_S, ease: EASE_OUT };
  const centre = TOOLS[mod(step, TOOLS.length)];

  return (
    <svg
      viewBox="0 0 560 280"
      // Anchored to the top, not centred. The card is a slightly different
      // shape from this viewBox at most widths, and centring puts the spare
      // height above the beam — which drops the flare into the middle of the
      // card, where it reads as a lamp rather than as light coming in from
      // over the top edge. Any slack belongs below the composition.
      preserveAspectRatio="xMidYMin meet"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* --- the light, in five layers.
            One gradient at one opacity gives a grey wedge, not a beam. What
            reads as light is: a wide ambient lift, a soft cone, a hard-edged
            hot shaft inside it, an anamorphic flare streaking across the top,
            and a bloom where the two cross. Each is doing a different job;
            deleting any one of them flattens the whole thing. */}

        {/* 1. ambient — the air around the beam is lifted, not just the shaft */}
        <radialGradient id="tools-ambient">
          <stop offset="0%" stopColor="#ff4d1f" stopOpacity="0.13" />
          <stop offset="55%" stopColor="#ff4d1f" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ff4d1f" stopOpacity="0" />
        </radialGradient>

        {/* 2. cone — spreads as it falls, and is still arriving at the tile.
            Fade it to nothing on the way down and it reads as a streak hanging
            in the air rather than as light landing on something. */}
        <linearGradient id="tools-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6a40" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#ff8a5c" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#ff4d1f" stopOpacity="0.05" />
        </linearGradient>

        {/* 3. shaft — near-white where it leaves the flare, champagne by the
            time it lands */}
        <linearGradient id="tools-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ff6a40" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#ff8a5c" stopOpacity="0.18" />
        </linearGradient>

        {/* 4. flare — horizontal, anamorphic. This is the piece that was
            missing: without a streak running *across* the top, a beam reads as
            a torch pointed at the card rather than as light breaking in. */}
        <linearGradient id="tools-flare-wide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d1f" stopOpacity="0" />
          <stop offset="26%" stopColor="#ff8a5c" stopOpacity="0.42" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="74%" stopColor="#ff8a5c" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ff4d1f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tools-flare-core" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fffaf0" stopOpacity="0" />
        </linearGradient>

        {/* 5. bloom at the crossing point, and the pool where it lands */}
        <radialGradient id="tools-bloom">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#ff6a40" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ff8a5c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tools-pool">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#ff6a40" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff6a40" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tools-hero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#33291a" />
          <stop offset="100%" stopColor="#15120c" />
        </linearGradient>
        <linearGradient id="tools-sat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#242424" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="tools-chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2213" />
          <stop offset="100%" stopColor="#171410" />
        </linearGradient>

        {/* Light has no edges. Un-blurred, every shape below is a hard-sided
            polygon that reads as a paper cut-out sitting on the card. Three
            radii because the layers need different softness: the cone is a
            haze, the shaft is nearly sharp. */}
        <filter id="tools-blur-lg" x="-80%" y="-60%" width="260%" height="240%">
          <feGaussianBlur stdDeviation="17" />
        </filter>
        <filter id="tools-blur-md" x="-80%" y="-300%" width="260%" height="700%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="tools-blur-sm" x="-200%" y="-60%" width="500%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Lattice. Sits behind everything at the edge of visible — it gives the
          light something to fall on, which is what stops the tiles reading as
          stickers on a flat panel. */}
      <g stroke="rgba(243,240,234,0.05)">
        {[-10, 170, 350, 530].map((x) =>
          [-16, 116].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="170" height="122" rx="22" />
          )),
        )}
      </g>

      {/* The route, barely there — it makes the travel legible as a path
          rather than as tiles wandering. Sampled from the same parabola the
          tiles ride, so the two can't disagree. */}
      <path
        d={arcPath()}
        stroke="rgba(243,240,234,0.055)"
        strokeDasharray="3 5"
      />

      {/* --- the beam, falling on whatever is standing in the centre --- */}

      {/* the air it travels through */}
      <ellipse cx={ARC.cx} cy="86" rx="235" ry="132" fill="url(#tools-ambient)" />

      {/* the cone: narrow where it enters, spread by the time it lands */}
      <path
        d={`M 268 8 H 292 L 372 ${ARC.cy - 12} H 188 Z`}
        fill="url(#tools-cone)"
        filter="url(#tools-blur-lg)"
      />

      {/* the shaft inside it */}
      <path
        d={`M 275 6 H 285 L 296 ${ARC.cy - 20} H 264 Z`}
        fill="url(#tools-shaft)"
        filter="url(#tools-blur-sm)"
      />

      {/* the flare, streaking across the top */}
      <ellipse
        cx={ARC.cx}
        cy="16"
        rx="196"
        ry="11"
        fill="url(#tools-flare-wide)"
        filter="url(#tools-blur-md)"
      />
      <ellipse
        cx={ARC.cx}
        cy="16"
        rx="92"
        ry="5"
        fill="url(#tools-flare-core)"
        filter="url(#tools-blur-sm)"
      />

      {/* where the flare and the shaft cross */}
      <circle cx={ARC.cx} cy="19" r="40" fill="url(#tools-bloom)" />

      {/* Motes in the light. Scattered rather than strung along the shaft —
          a neat line of dots reads as a dotted border, not as dust. */}
      {MOTES.map(([cx, cy, r, o]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#fffaf0" fillOpacity={o} />
      ))}

      {/* The light pools where the lit tile stands. Tight and bright, hugging
          the tile's base — spread wide it stops looking like a pool and starts
          looking like a shadow rendered the wrong way up. */}
      <ellipse cx={ARC.cx} cy={ARC.cy + TILE / 2 - 4} rx="52" ry="22" fill="url(#tools-pool)" />

      {TOOLS.map((logo, i) => {
        const slot = slotOf(step, i);
        // The lap closes between the two parking places. Doing that jump
        // instantly — and only there, where the tile is invisible — is what
        // keeps anything from being seen travelling backwards.
        const wrapping = Math.abs(slot) >= HALF;
        return (
          <motion.g
            key={logo.slug}
            initial={false}
            animate={place(slot)}
            transition={wrapping ? { duration: 0 } : transition}
          >
              <rect
                x={-TILE / 2}
                y={-TILE / 2}
                width={TILE}
                height={TILE}
                rx="20"
                fill="url(#tools-sat)"
                stroke="rgba(243,240,234,0.12)"
              />

              {/* The lit treatment, faded in only at the centre. Layered over
                  the plain tile rather than swapped for it, because `fill` and
                  `stroke` can't be tweened between two different gradients. */}
              <motion.g animate={{ opacity: heat(slot) }} transition={transition}>
                <rect
                  x={-TILE / 2}
                  y={-TILE / 2}
                  width={TILE}
                  height={TILE}
                  rx="20"
                  fill="url(#tools-hero)"
                  stroke="rgba(255,77,31,0.5)"
                />
                {/* the beam catches the top edge before anything else does */}
                <path
                  d={`M ${-TILE / 2 + 20} ${-TILE / 2 + 0.5} H ${TILE / 2 - 20}`}
                  stroke="rgba(255,250,240,0.55)"
                  strokeWidth="1"
                />
              </motion.g>

              <svg x={-LOGO / 2} y={-LOGO / 2} width={LOGO} height={LOGO} viewBox="0 0 24 24">
                <title>{logo.label}</title>
                <path d={logo.d} fill="rgba(243,240,234,0.72)" />
              </svg>
            </motion.g>
          );
        })}

      {/* The label names whatever is under the light, so it changes with the
          tile rather than sitting there as decoration. */}
      <path d="M 280 186 V 200" stroke="rgba(243,240,234,0.25)" strokeWidth="1" />
      <circle cx="280" cy="202" r="3.5" stroke="rgba(243,240,234,0.35)" fill="#0e0d0b" />
      <g>
        <rect x="192" y="212" width="176" height="34" rx="17" fill="url(#tools-chip)" stroke="rgba(255,77,31,0.4)" />
        <rect x="202" y="220" width="18" height="18" rx="6" fill="rgba(255,77,31,0.16)" />
        <svg x="204" y="222" width="14" height="14" viewBox="0 0 24 24">
          <path d={SPARKLE} fill="#ff4d1f" />
        </svg>
        <AnimatePresence mode="wait" initial={false}>
          <motion.text
            key={centre.slug}
            x="230"
            y="234"
            fill="rgba(243,240,234,0.85)"
            fontSize="12"
            fontFamily="var(--font-manrope), ui-sans-serif, system-ui, sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            {centre.label}
          </motion.text>
        </AnimatePresence>
      </g>

      {/* Rotated labels running off both edges. They're cut by the card's own
          overflow — no fade, same rule as the footer sign-off: if it bleeds, it
          has to actually reach the edge. x is chosen so the *chip* bleeds while
          the words stay whole; a clipped first letter reads as a bug. */}
      <ChipLabel x={-30} y={188} rotate={-7} width={212}>
        Research &amp; structure
      </ChipLabel>
      <ChipLabel x={392} y={188} rotate={7} width={212}>
        Colour &amp; motion
      </ChipLabel>
    </svg>
  );
}

/** The travel path, sampled off the same parabola the tiles use. */
function arcPath() {
  const points = [];
  for (let slot = -2.4; slot <= 2.4; slot += 0.2) {
    const { x, y } = place(slot);
    points.push(`${points.length ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function ChipLabel({
  x,
  y,
  rotate,
  width,
  children,
}: {
  x: number;
  y: number;
  rotate: number;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <g transform={`rotate(${rotate} ${x + width / 2} ${y + 17})`}>
      <rect
        x={x}
        y={y}
        width={width}
        height="34"
        rx="10"
        fill="#131313"
        stroke="rgba(243,240,234,0.08)"
      />
      <text
        x={x + 46}
        y={y + 22}
        fill="rgba(243,240,234,0.4)"
        fontSize="12"
        fontFamily="var(--font-manrope), ui-sans-serif, system-ui, sans-serif"
      >
        {children}
      </text>
    </g>
  );
}
