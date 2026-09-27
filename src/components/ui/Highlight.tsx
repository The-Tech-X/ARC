import type { CSSProperties, ReactNode } from "react";

/**
 * The one emphasised word in a headline — the Signal system's replacement for
 * the old GoldText (retired 2026-09-27). The word is set in the typewriter
 * face against the condensed Archivo around it: the contrast of letterform
 * does the work, the accent colour confirms it. The typewriter says "the story
 * is written first", which is the studio's first service.
 *
 * Rules (AGENTS.md → Visual identity):
 * - One per headline. It means "this is the word that matters".
 * - Source casing is kept (so "ARC" stays "ARC"); only the first letter is
 *   forced up, so a lower-case word reads "Move" inside an upper-case line.
 * - `light` on bone surfaces: the plain accent is too light to read there.
 * - `plain` keeps the surrounding font and only takes the colour — for
 *   numbers and names, where a typewriter face would be a costume.
 *
 * All of this is plain text, so it stays selectable and screen-readable.
 */

/** Shared with TypedWord so the animated Hero word matches every static one. */
export const TYPEWRITER_STYLE: CSSProperties = {
  letterSpacing: "-0.04em",
  // Special Elite has one weight. A same-colour stroke thickens it just enough
  // to sit beside heavy Archivo without reading as an outline. The user asked
  // for this lighter than the 0.022em first shown — keep it subtle.
  WebkitTextStroke: "0.014em currentColor",
};

export default function Highlight({
  children,
  light = false,
  plain = false,
  className = "",
}: {
  children: ReactNode;
  light?: boolean;
  plain?: boolean;
  className?: string;
}) {
  const colour = light ? "text-signal-deep" : "text-signal";

  if (plain) return <span className={`${colour} ${className}`}>{children}</span>;

  return (
    <span
      className={`inline-block font-type normal-case first-letter:uppercase ${colour} ${className}`}
      style={TYPEWRITER_STYLE}
    >
      {children}
    </span>
  );
}
