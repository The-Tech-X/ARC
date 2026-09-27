import {
  MARK_STOPS,
  WORDMARK_PATHS,
  WORDMARK_STROKE_WIDTH,
  WORDMARK_VIEWBOX,
} from "@/lib/wordmark";

/**
 * The logo, drawn. Size it with a height class (`h-6 w-auto`) — the aspect
 * ratio comes from the viewBox, which is the mark's exact ink box.
 *
 * This is the *logo*; `Highlight` is for emphasised *words* ("ARC Media", an
 * emphasised word in a headline). Don't set the mark in type: the real letters
 * are thin geometric strokes with a stemless R and a crossbar-less A, and no
 * weight of Satoshi is close to them.
 *
 * Pass `title` where the mark is the only thing identifying a link; leave it
 * off where visible text already names it, so screen readers don't hear "ARC"
 * twice.
 *
 * The gradient id is fixed rather than generated. Two of these on one page
 * would emit duplicate ids, but both definitions are identical so the render
 * is unaffected — and a fixed id keeps this a server component (`useId` would
 * force it to the client for no benefit).
 */
export default function Wordmark({
  className = "",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        {/* userSpaceOnUse, not objectBoundingBox: the R's arm and the A's bars
            include perfectly horizontal and vertical segments, and a bounding
            box with zero height or width degenerates. Spans the full ink box
            so every letter is shaded by the same light. */}
        <linearGradient
          id="arc-wordmark-fill"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="244"
        >
          {MARK_STOPS.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      <g
        stroke="url(#arc-wordmark-fill)"
        strokeWidth={WORDMARK_STROKE_WIDTH}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        {WORDMARK_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
