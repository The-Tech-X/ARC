/**
 * The ARC logomark as stroke geometry, measured off the real logo file
 * (`docs/references/brand/ARC Logo.png`) rather than eyeballed.
 *
 * The mark is thin geometric strokes, not a heavy typeface, and each letter is
 * defined as much by what's *missing* as by what's there:
 *
 * - **A** — no crossbar. A pure ascending peak, two bars mitred at the apex.
 * - **R** — **no vertical stem.** This is the detail that is easiest to get
 *   wrong and the one that most identifies the mark: the R is a horizontal top
 *   arm, a semicircular bowl, a short return along the bottom of the bowl, and
 *   a diagonal leg — one continuous stroke, with nothing down the left side.
 * - **C** — a wide open arc, 272° of a circle, cut radially at both terminals.
 *
 * Setting "ARC" in a black-weight font is an approximation of it, and a poor
 * one; use these paths wherever the mark is rendered as the *logo*.
 *
 * ## Coordinate system
 *
 * The viewBox is the mark's exact ink box: every extremity touches an edge.
 * Cap line at y=0, baseline at y=242, and the C overshoots to y=244 at the
 * bottom the way a round letter should.
 *
 * Numbers are in source-image pixels, translated so the ink box starts at the
 * origin — so they can be compared directly against a fresh measurement of the
 * logo file if it is ever re-cut. How they were derived, in case that happens:
 * the letterform contours were isolated with a local-contrast pass
 * (`blur(4) - original`, which lights up the dark outline around each stroke),
 * then lines were fitted to the straight edges and circles to the curved ones.
 * The reconstruction was checked back against the extracted contours before
 * these values were committed.
 *
 * Shared by the intro loader, the nav mark and the generated icons so there is
 * one definition rather than several that drift apart.
 */

export const WORDMARK_VIEWBOX = "0 0 850 244";

/** Cap line to baseline. The C's 2-unit overshoot sits below this. */
export const WORDMARK_CAP_HEIGHT = 242;

/**
 * The weight the logo file itself is drawn at — 9.5% of the cap height. Kept
 * because it's a measurement, and because the smallest favicon needs it: a
 * hairline disappears at 16px.
 */
export const LOGO_MEASURED_STROKE_WIDTH = 23;

/**
 * The weight the mark is *rendered* at, ~5% of the cap height. Deliberately
 * lighter than the logo file (see above) — the user asked for the thin cut on
 * 2026-09-05, on the grounds that flat gold strokes at the measured weight read
 * as heavy on black, where the real sign has a glow to soften them.
 *
 * Render the mark with this everywhere and nothing else, so the nav, the intro
 * and the OG card are the same mark. The one exception is icons small enough
 * that this would fall below about a pixel; `scripts/generate-brand-assets.ts`
 * handles that, and is the only place allowed to.
 */
export const WORDMARK_STROKE_WIDTH = 12;

/** Width ÷ height, for sizing the mark from either dimension. */
export const WORDMARK_ASPECT = 850 / 244;

/**
 * The A's left bar, foot to apex — the ascent the brand is named for. Straight,
 * so any point along it is plain linear interpolation: no getPointAtLength, no
 * measuring a mounted path.
 */
export const ASCENT = { x1: 13.2, y1: 242, x2: 122.5, y2: 26.3 } as const;

/** The apex of the A, where the ascent lands. */
export const SUMMIT = { x: ASCENT.x2, y: ASCENT.y2 } as const;

export const WORDMARK_STROKES = {
  aLeft: `M ${ASCENT.x1} ${ASCENT.y1} L ${ASCENT.x2} ${ASCENT.y2}`,
  aRight: `M ${ASCENT.x2} ${ASCENT.y2} L 231 242`,

  // R, in three drawable pieces of one continuous stroke. Each break is at a
  // point where the path is horizontal on both sides, so butt caps meet flush
  // and splitting it is invisible. The mitre inside `rLeg` is not optional —
  // it's what forms the sharp point where the leg leaves the bowl.
  rArm: "M 338 11.5 H 473",
  rBowl: "M 473 11.5 A 63.5 63.5 0 0 1 473 138",
  rLeg: "M 473 138 H 429.3 L 540 242",

  // Centre (761.5, 122), radius 110, cut at ±44° from due east.
  c: "M 840.6 45.6 A 110 110 0 1 0 840.6 198.4",
} as const;

/**
 * The same three letters, each as one continuous path. **Use these for static
 * rendering.** Drawn this way the A's apex is a mitre and the R's corner is a
 * join; drawn as the separate strokes above, those points are butt caps that
 * meet at an angle and leave a visible notch at display size.
 *
 * The split version exists only because the intro draws the mark a stroke at a
 * time.
 */
export const WORDMARK_PATHS = [
  `M ${ASCENT.x1} ${ASCENT.y1} L ${ASCENT.x2} ${ASCENT.y2} L 231 242`,
  "M 338 11.5 H 473 A 63.5 63.5 0 0 1 473 138 H 429.3 L 540 242",
  WORDMARK_STROKES.c,
] as const;

/** The A alone, for square icons. */
export const ASCENT_MARK = WORDMARK_PATHS[0];

/**
 * The three letters with the x of each one's ink centre, for hanging something
 * — a word, a number — underneath a specific letter.
 *
 * Centres are measured at `WORDMARK_STROKE_WIDTH`. They shift by well under a
 * unit at other weights, which is invisible; nothing here needs to be exact to
 * the tenth.
 */
export const WORDMARK_LETTERS = [
  { path: WORDMARK_PATHS[0], centre: 122 },
  { path: WORDMARK_PATHS[1], centre: 441 },
  { path: WORDMARK_PATHS[2], centre: 745 },
] as const;

/**
 * The A's ink bounds at a given stroke weight. Both the mitre at the apex and
 * the angled butt caps at the feet stick out past the centreline, by an amount
 * that changes with the weight — so a square icon can only be centred on the
 * letter if this is computed rather than hardcoded.
 *
 * The three constants are the A's geometry: its bars sit at dx/dy = 0.5067, so
 * a half-width h spreads 1.121h horizontally, the apex mitre runs 2.213h above
 * the vertex, and each foot's cap drops 0.452h below the baseline.
 */
export function ascentInkBox(stroke: number = WORDMARK_STROKE_WIDTH) {
  const h = stroke / 2;
  const x = ASCENT.x1 - 1.121 * h;
  const y = SUMMIT.y - 2.213 * h;
  return { x, y, w: 231 + 1.121 * h - x, h: 242 + 0.452 * h - y };
}

/** Left to right, the order the mark is written in. */
export const WORDMARK_ORDER = [
  WORDMARK_STROKES.aLeft,
  WORDMARK_STROKES.aRight,
  WORDMARK_STROKES.rArm,
  WORDMARK_STROKES.rBowl,
  WORDMARK_STROKES.rLeg,
  WORDMARK_STROKES.c,
] as const;

/**
 * The mark's colour, as SVG gradient stops. Since the Signal system
 * (2026-09-27) the logo is bone, not gold: the orange accent means "act here",
 * and the logo isn't an action. A barely-there vertical fall-off keeps a lit
 * stroke from reading as flat paint; it should never look like a gradient.
 */
export const MARK_STOPS = [
  { offset: "0%", color: "#f3f0ea" },
  { offset: "100%", color: "#e4ded3" },
] as const;
