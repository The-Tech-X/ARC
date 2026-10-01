"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ASCENT_MARK, ascentInkBox } from "@/lib/wordmark";

/**
 * The first About card, "One hand, end to end": the A on a tile, under a light
 * drawn as a **dithered halftone**: a grid of dots whose size follows the
 * light's intensity, each nudged by a fixed per-dot noise value so the falloff
 * breaks up the way a printed halftone does instead of fading smoothly. A
 * static grain sits over the whole well. (A stage line labelled "Script / Shoot /
 * Edit / Post" was tried here on 2026-10-01 and cut: it repeated the copy.)
 *
 * ## Motion
 *
 * - **One-time entrance:** when the card scrolls in, the light strikes, with a
 *   short flicker like a lamp coming up, and the A writes itself under it.
 * - **Interaction-tied:** the light follows the pointer across the well, the
 *   beam slanting from a source above, and eases back over the tile when the
 *   pointer leaves.
 * - **The blink (timed, a sanctioned exception, asked for by the user on
 *   2026-10-01):** every `BLINK_GAP` (randomised, so it never ticks like a
 *   metronome) a scatter of the lit dots sparkles, each brightening and fading
 *   on its own stagger, then the light is still again. It pauses while the card
 *   is off-screen or the tab is hidden. Like the toolkit carousel, it breaks
 *   the no-timer-loops rule because the user asked for it; don't remove it on
 *   the strength of that rule.
 * - The canvas redraws only while the light is moving, striking or blinking.
 *   Between those the rAF loop is stopped.
 * - Reduced motion: one static frame, light at rest, A already written, no
 *   blink.
 *
 * Accent: the A. The light is a warm tint of it, which is what a lit thing
 * throws, but it never reaches full Signal.
 */

const STROKE = 12;
const TILE = 96;
/** The tile's centre, as a fraction of the well. */
const TILE_Y = 0.54;
const GAP = 5;
const MAX_R = 1.7;
/** How far the light leans toward the pointer: enough to follow, never so far the A goes dark. */
const FOLLOW = 0.55;
const STRIKE = [0, 0.75, 0.2, 0.9, 0.55, 1];
const STRIKE_MS = 900;
/** Wait between blinks: min, plus up to the random extra. */
const BLINK_GAP = [2200, 2200];
/** Share of dots that take part in a blink. */
const BLINK_SHARE = 0.08;
/** Each dot's flash, and the spread of their start times across a blink. */
const BLINK_FLASH = 450;
const BLINK_SPREAD = 350;

/** A cheap integer hash to [0, 1), so a blink picks its dots without storing them. */
function hash(a: number, b: number, seed: number) {
  let h = (a * 374761393 + b * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export default function OneHandMark() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { once: true, amount: 0.6 });
  const reduced = !!useReducedMotion();
  const on = inView || reduced;
  const a = ascentInkBox(STROKE);

  // All drawing state lives in a ref: it changes every frame and nothing in
  // React needs to re-render for it.
  const state = useRef({
    w: 0,
    h: 0,
    light: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    power: 0,
    strikeStart: -1,
    raf: 0,
    /** -1: no blink. 0: start on the next frame. Otherwise its start time. */
    blinkStart: -1,
    blinkSeed: 1,
    blinkAt: 0,
    now: 0,
    visible: false,
    noise: [] as number[],
    kick: () => {},
  });

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    const rest = () => ({ x: s.w / 2, y: s.h * TILE_Y });

    const draw = () => {
      const { w, h, light, power } = s;
      ctx.clearRect(0, 0, w, h);
      if (power <= 0) return;
      const cx = w / 2;
      const cy = h * TILE_Y;
      // The source sits above the card, drifting a little toward the light,
      // so the beam slants rather than teleporting.
      const sx = cx + (light.x - cx) * 0.35;
      const sy = -30;
      const bx = light.x - sx;
      const by = light.y - sy;
      const bl = bx * bx + by * by;
      const cols = Math.ceil(w / GAP) + 1;
      const rows = Math.ceil(h / GAP) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GAP + (r % 2 ? GAP / 2 : 0);
          const y = r * GAP;
          // skip what the tile covers
          if (Math.abs(x - cx) < TILE / 2 - 2 && Math.abs(y - cy) < TILE / 2 - 2) continue;
          // pool: where the light lands
          const dx = x - light.x;
          const dy = y - light.y;
          const pool = Math.exp(-(dx * dx + dy * dy) / (2 * 64 * 64));
          // beam: distance to the source→light segment, widening as it falls
          const t = Math.max(0, Math.min(1, ((x - sx) * bx + (y - sy) * by) / bl));
          const px = sx + bx * t - x;
          const py = sy + by * t - y;
          const width = 10 + 46 * t;
          const beam = Math.exp(-(px * px + py * py) / (2 * width * width)) * (0.22 + 0.45 * t);
          const n = s.noise[(r * 131 + c) % s.noise.length];
          let i = Math.min(1, (pool * 0.85 + beam) * power) + (n - 0.5) * 0.24 - 0.1;
          let spark = 0;
          // the blink: only dots in or near the light, each on its own offset
          if (s.blinkStart > 0 && i > -0.12) {
            const hv = hash(r, c, s.blinkSeed);
            if (hv < BLINK_SHARE) {
              const p = (s.now - s.blinkStart - (hv / BLINK_SHARE) * BLINK_SPREAD) / BLINK_FLASH;
              if (p > 0 && p < 1) spark = Math.sin(Math.PI * p);
            }
          }
          i = Math.min(1, i + spark * 0.65);
          if (i <= 0) continue;
          const rad = MAX_R * Math.sqrt(i);
          if (rad < 0.35) continue;
          // a sparking dot runs hotter, toward the white of the filament
          ctx.fillStyle = `rgba(255,${Math.round(98 + 60 * i + 70 * spark)},${Math.round(60 + 50 * i + 90 * spark)},${0.12 + 0.4 * i + 0.3 * spark})`;
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const scheduleBlink = () => {
      clearTimeout(s.blinkAt);
      s.blinkAt = window.setTimeout(
        () => {
          // off-screen or hidden: skip this one, try again after another gap
          if (!s.visible || document.hidden) return scheduleBlink();
          s.blinkStart = 0;
          s.blinkSeed = (s.blinkSeed * 48271) % 2147483647;
          kick();
        },
        BLINK_GAP[0] + Math.random() * BLINK_GAP[1],
      );
    };

    const tick = (now: number) => {
      s.raf = 0;
      s.now = now;
      let moving = false;
      if (s.blinkStart >= 0) {
        if (s.blinkStart === 0) s.blinkStart = now;
        if (now - s.blinkStart < BLINK_SPREAD + BLINK_FLASH) moving = true;
        else {
          s.blinkStart = -1;
          scheduleBlink();
        }
      }
      if (s.strikeStart >= 0) {
        if (s.strikeStart === 0) s.strikeStart = now;
        const p = Math.min(1, (now - s.strikeStart) / STRIKE_MS);
        const k = p * (STRIKE.length - 1);
        const j = Math.floor(k);
        s.power = STRIKE[j] + (STRIKE[Math.min(j + 1, STRIKE.length - 1)] - STRIKE[j]) * (k - j);
        if (p < 1) moving = true;
        else {
          s.strikeStart = -1;
          // the light is up: the blinks start from here
          if (!reduced) scheduleBlink();
        }
      }
      const dx = s.target.x - s.light.x;
      const dy = s.target.y - s.light.y;
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
        s.light.x += dx * 0.12;
        s.light.y += dy * 0.12;
        moving = true;
      } else {
        s.light.x = s.target.x;
        s.light.y = s.target.y;
      }
      draw();
      if (moving) s.raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };
    s.kick = kick;

    // Fixed per-dot noise, seeded so the dither is the same on every visit.
    let seed = 7;
    s.noise = Array.from({ length: 997 }, () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = el.clientWidth;
      s.h = el.clientHeight;
      cv.width = s.w * dpr;
      cv.height = s.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.light = rest();
      s.target = rest();
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
    });
    io.observe(el);

    if (reduced) {
      s.power = 1;
      draw();
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    const move = (e: PointerEvent) => {
      if (s.power === 0 && s.strikeStart < 0) return;
      const b = el.getBoundingClientRect();
      const r = rest();
      s.target = {
        x: r.x + (e.clientX - b.left - r.x) * FOLLOW,
        y: r.y + (e.clientY - b.top - r.y) * FOLLOW,
      };
      kick();
    };
    const leave = () => {
      s.target = rest();
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      ro.disconnect();
      io.disconnect();
      clearTimeout(s.blinkAt);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [reduced]);

  // The strike, once, when the card comes into view.
  useEffect(() => {
    if (!inView || reduced) return;
    const s = state.current;
    s.strikeStart = 0; // the next tick stamps the real start time
    s.kick();
  }, [inView, reduced]);

  return (
    <div
      ref={wrap}
      className="absolute inset-0"
      // the light and grain dissolve before the well's edges, so there's
      // never a line where the drawing stops and the card's text begins
      style={{
        maskImage: "radial-gradient(closest-side at 50% 54%, #000 55%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side at 50% 54%, #000 55%, transparent 100%)",
      }}
    >
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* grain: static, over the light, so the halftone reads as printed */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.1] mix-blend-overlay" aria-hidden="true">
        <filter id="hand-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.3" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hand-grain)" />
      </svg>

      {/* the tile, centred where the canvas expects it */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[calc(50%+3px)]"
        style={{ top: `${TILE_Y * 100}%`, width: TILE, height: TILE }}
      >
        <svg viewBox="0 0 96 96" className="h-full w-full overflow-visible" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hand-tile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d2824" />
              <stop offset="100%" stopColor="#100e0d" />
            </linearGradient>
            <linearGradient id="hand-rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d1f" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#ff4d1f" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f3f0ea" stopOpacity="0.06" />
            </linearGradient>
            <filter id="hand-a-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="hand-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.7" />
            </filter>
          </defs>
          <rect x="0" y="0" width="96" height="96" rx="24" fill="url(#hand-tile)" filter="url(#hand-shadow)" />
          <rect x="0.5" y="0.5" width="95" height="95" rx="23.5" stroke="url(#hand-rim)" />
          <path d="M 26 1 H 70" stroke="rgba(243,240,234,0.4)" strokeLinecap="round" />

          <svg x="21" y="20" width="54" height="56" viewBox={`${a.x} ${a.y} ${a.w} ${a.h}`}>
            <path d={ASCENT_MARK} stroke="rgba(243,240,234,0.07)" strokeWidth={STROKE} strokeLinejoin="miter" />
            <motion.path
              d={ASCENT_MARK}
              stroke="#ff8a5c"
              strokeWidth={STROKE * 2}
              strokeLinejoin="miter"
              filter="url(#hand-a-glow)"
              initial={{ opacity: 0 }}
              animate={on ? { opacity: 0.45 } : {}}
              transition={{ delay: reduced ? 0 : 1.3, duration: reduced ? 0 : 0.8 }}
            />
            <motion.path
              d={ASCENT_MARK}
              stroke="#ff4d1f"
              strokeWidth={STROKE}
              strokeLinejoin="miter"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={on ? { pathLength: 1 } : {}}
              transition={{ delay: reduced ? 0 : 0.55, duration: reduced ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
            />
          </svg>
        </svg>
      </div>
    </div>
  );
}
