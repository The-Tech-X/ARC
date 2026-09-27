import type { CSSProperties } from "react";

/**
 * The site's printed texture (added 2026-09-27 from two user references):
 *
 * - `dots`  — patches of halftone dot-mosaic: a fine dot screen, masked by
 *   low-frequency noise so the dots gather in soft blotches instead of an
 *   even screen (reference 1's background).
 * - `tiles` — a square tile grid whose tiles are faintly mottled, like
 *   stone (reference 2).
 *
 * It is texture, never content: static (no motion, so no motion rule to
 * answer to), behind everything (`aria-hidden`, no pointer events), and
 * always faded out by `fade` so it never sits hard against a section edge
 * or under body copy. Use it sparingly — sections that carry it are listed
 * in AGENTS.md; a texture on every section stops being one.
 *
 * `tone="light"` is for bone sections (ink dots instead of bone ones).
 * Pure CSS + inline SVG data URIs, so it costs no image requests.
 */

type Props = {
  variant: "dots" | "tiles";
  tone?: "dark" | "light";
  /** Where the texture is visible: a CSS mask gradient. */
  fade?: string;
  /** Changes the blotch pattern, so two sections don't repeat each other. */
  seed?: number;
  className?: string;
};

const svg = (markup: string) => `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;

/** Soft blotches: alpha from thresholded low-frequency noise. */
const blotches = (seed: number) =>
  svg(
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='3' seed='${seed}'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0 0 0.35 0.9 1'/><feFuncR type='linear' slope='0'/><feFuncG type='linear' slope='0'/><feFuncB type='linear' slope='0'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );

/** Stone mottling for the tiles, in the tone's ink. */
const mottle = (light: boolean) =>
  svg(
    `<svg xmlns='http://www.w3.org/2000/svg' width='700' height='700'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='9'/><feColorMatrix type='matrix' values='0 0 0 0 ${light ? 0 : 1}  0 0 0 0 ${light ? 0 : 1}  0 0 0 0 ${light ? 0 : 1}  0 0 0 ${light ? 0.06 : 0.08} 0'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
  );

const DEFAULT_FADE = "radial-gradient(ellipse 85% 80% at 50% 50%, black 35%, transparent 90%)";

export default function Mosaic({ variant, tone = "dark", fade = DEFAULT_FADE, seed = 3, className = "" }: Props) {
  const light = tone === "light";
  const ink = light ? "14,13,11" : "243,240,234";

  if (variant === "dots") {
    const style: CSSProperties = {
      backgroundImage: `radial-gradient(circle, rgba(${ink},${light ? 0.22 : 0.2}) 0 0.9px, transparent 1.3px)`,
      backgroundSize: "5px 5px",
      maskImage: `${blotches(seed)}, ${fade}`,
      WebkitMaskImage: `${blotches(seed)}, ${fade}`,
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
      maskSize: "900px 900px, 100% 100%",
      WebkitMaskSize: "900px 900px, 100% 100%",
    };
    return <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} style={style} />;
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: mottle(light), backgroundSize: "700px 700px" }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(${ink},0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(${ink},0.06) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
