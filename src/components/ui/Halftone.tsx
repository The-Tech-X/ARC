"use client";

import { useEffect, useRef } from "react";

/**
 * The site's printed texture: a **dithered halftone** (replaced the dot/tile
 * `Mosaic` on 2026-10-01, from a user reference: a hero whose whole tonal
 * range is built from tiny square dots, gathered in soft clouds).
 *
 * How the tone is made, which is what makes it read as halftone rather than as
 * a dot pattern:
 * 1. A **tone field**: the `spots` (soft ellipses, where the texture lives)
 *    multiplied by low-frequency cloud noise, so it gathers in blotches
 *    instead of sitting as an even disc.
 * 2. An **8×8 ordered (Bayer) dither, roughened with per-cell noise**, turns
 *    tone into dots: a cell gets a dot only where its tone beats that cell's
 *    threshold, so darker areas fill in and lighter ones thin to a scatter,
 *    with the cross-hatch of a retro digital screen and some printed grit.
 * 3. Each dot is a small **square**, a little larger where the tone is darker.
 *
 * It is texture, never content: static (drawn once, again only on resize),
 * behind everything, `aria-hidden`, no pointer events. Where it's used is
 * listed in AGENTS.md. It is deliberately not on every section, because a
 * texture everywhere stops being one.
 *
 * `tone="light"` is for bone sections (ink dots instead of bone ones).
 * `soft` is the gentler first version (lower contrast, fainter, pure Bayer
 * with no grit): the user preferred it in Pricing and the Final CTA, where the
 * strong one read as "too many dots".
 */

export type HalftoneSpot = {
  /** Centre, in % of the box. */
  x: number;
  y: number;
  /** Radii, in % of the box's width and height. */
  rx: number;
  ry: number;
  /** Peak tone, 0–1. Defaults to 1. */
  strength?: number;
};

type Props = {
  spots: HalftoneSpot[];
  tone?: "dark" | "light";
  /** Changes the cloud pattern, so two sections don't repeat each other. */
  seed?: number;
  /** The gentler variant: fewer, fainter dots. */
  soft?: boolean;
  className?: string;
};

/** The two looks. `soft` is the first version, kept exactly as it was. */
const LOOK = {
  strong: { cloud: 220, gain: 2.5, cut: 0.72, size: [1, 1.7], grit: 0.4, dark: [0.1, 0.42], light: [0.12, 0.5] },
  soft: { cloud: 260, gain: 1.9, cut: 0.35, size: [1.1, 1.3], grit: 0, dark: [0.08, 0.26], light: [0.1, 0.32] },
} as const;

/** Cell pitch in CSS px. Kept fine: the user prefers small dots (2026-10-01). */
const CELL = 4;

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20,
  62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

/** Seeded value noise on an integer lattice, smoothly interpolated. */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = smooth(x - xi);
    const v = smooth(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  // three octaves: broad clouds with ragged edges
  return (x: number, y: number) =>
    (value(x, y) * 0.6 + value(x * 2.1, y * 2.1) * 0.28 + value(x * 4.3, y * 4.3) * 0.12);
}

/** Per-cell white noise in [0, 1), seeded. */
function makeGrain(seed: number) {
  return (x: number, y: number) => {
    let h = (x * 1597334677 + y * 3812015801 + seed * 2654435761) | 0;
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
}

export default function Halftone({ spots, tone = "dark", seed = 3, soft = false, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Spots arrive as a fresh array literal on every render; key the effect on
  // their content so it doesn't redraw for nothing.
  const spotsKey = JSON.stringify(spots);

  useEffect(() => {
    const cv = ref.current;
    const box = cv?.parentElement;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const list: HalftoneSpot[] = JSON.parse(spotsKey);
    const noise = makeNoise(seed);
    const grain = makeGrain(seed);
    const ink = tone === "light" ? "14,13,11" : "243,240,234";
    const look = LOOK[soft ? "soft" : "strong"];
    const alpha = tone === "light" ? look.light : look.dark;

    let raf = 0;
    const draw = () => {
      raf = 0;
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      // Bucket dots by alpha step so the canvas switches fillStyle a handful
      // of times instead of once per dot.
      const STEPS = 6;
      const buckets: number[][] = Array.from({ length: STEPS }, () => []);

      for (let r = 0; r < rows; r++) {
        const y = r * CELL + CELL / 2;
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2;
          let base = 0;
          for (const s of list) {
            const dx = (x / w - s.x / 100) / (s.rx / 100);
            const dy = (y / h - s.y / 100) / (s.ry / 100);
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= 1) continue;
            const f = 1 - d * d * (3 - 2 * d); // smooth falloff to the rim
            base = Math.max(base, f * (s.strength ?? 1));
          }
          if (base <= 0) continue;
          const cloud = noise(x / look.cloud, y / look.cloud);
          // contrast the clouds so they gather rather than wash evenly
          const t = Math.min(1, Math.max(0, base * (cloud * look.gain - look.cut)));
          // Threshold: mostly the Bayer matrix, partly per-cell noise. Pure
          // Bayer reads as a screen door; the noise gives it the grit of the
          // reference while keeping the retro cross-hatch underneath.
          const th = BAYER[(r & 7) * 8 + (c & 7)] * (1 - look.grit) + grain(c, r) * look.grit;
          if (t <= th) continue;
          const b = Math.min(STEPS - 1, Math.floor(t * STEPS));
          buckets[b].push(x, y, look.size[0] + look.size[1] * t);
        }
      }

      buckets.forEach((dots, b) => {
        if (!dots.length) return;
        const t = (b + 0.5) / STEPS;
        ctx.fillStyle = `rgba(${ink},${alpha[0] + (alpha[1] - alpha[0]) * t})`;
        for (let i = 0; i < dots.length; i += 3) {
          const s = dots[i + 2];
          ctx.fillRect(dots[i] - s / 2, dots[i + 1] - s / 2, s, s);
        }
      });
    };

    draw();
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(draw);
    });
    ro.observe(box);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [spotsKey, seed, tone, soft]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
