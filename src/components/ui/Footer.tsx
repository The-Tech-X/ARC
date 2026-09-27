"use client";

import Link from "next/link";
import Highlight from "@/components/ui/Highlight";
import { site } from "@/content/site";
import { WORDMARK_PATHS, WORDMARK_STROKE_WIDTH } from "@/lib/wordmark";

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-deep-black pt-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:grid-cols-3 sm:px-12 lg:px-20">
        <div>
          <p className="font-heading text-lg font-bold">
            <Highlight plain>{site.legalName}</Highlight>
          </p>
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-bone/50">
            {site.pillars.join(" · ")}
          </p>
          <p className="mt-6 font-body text-sm text-bone/40">{site.location}</p>
        </div>

        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-bone/35">
            Contact
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-5 inline-block font-body text-sm text-bone/70 transition-colors duration-300 hover:text-bone"
          >
            {site.email}
          </a>
          <ul className="mt-6 flex flex-col gap-2">
            {site.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-draw font-body text-sm text-bone/50 hover:text-bone"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:text-right">
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-bone/35">
            Site
          </p>
          <ul className="mt-5 flex flex-col gap-2 sm:items-end">
            <li>
              <Link
                href="/about"
                className="link-draw font-body text-sm text-bone/50 hover:text-bone"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/book"
                className="link-draw font-body text-sm text-bone/50 hover:text-bone"
              >
                Book a Call
              </Link>
            </li>
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-draw font-body text-sm text-bone/50 hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Back-to-top lives inside the footer rather than floating at the
              edge of the page — a bare line running alongside the native
              scrollbar was tried once and read as a second scrollbar. */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group mt-8 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-bone/40 transition-colors duration-300 hover:text-bone"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              ↑
            </span>
            Back to top
          </button>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl items-center justify-between px-6 pb-6 font-body text-[11px] text-bone/25 sm:px-12 lg:px-20">
        <span>
          © {new Date().getFullYear()} {site.legalName}
        </span>
        <span>{site.tagline}</span>
      </div>

      <SignOff />
    </footer>
  );
}

/**
 * The sign-off: the logo as architecture — spanning the full viewport width,
 * edge to edge, with its lower portion running off the bottom of the page.
 *
 * This is the real mark now (`src/lib/wordmark.ts`), not "ARC" set in Satoshi
 * Black. Three earlier attempts failed and the failures are worth keeping:
 *
 * 1. Oversized text anchored to its container's *bottom* under
 *    `overflow-hidden` cropped the **tops** off the letters — the A's apex,
 *    the R's bowl, the C's curve, i.e. the parts that identify them.
 * 2. The logomark strokes, but constrained to `max-w-5xl` with side padding
 *    and fading to transparent at the bottom. That was neither one thing nor
 *    the other: it didn't reach the page edges, so the fade had nothing to
 *    dissolve *into*, and it read as a large half-erased outline floating in
 *    the middle of the footer.
 * 3. Satoshi Black, full-bleed, sized by measured font metrics with
 *    `textLength`. It worked, but it was a drawing of the logo in the wrong
 *    letterforms — a heavy typeface standing in for a thin geometric mark.
 *
 * The rule that came out of #2: **a full-bleed element has to actually touch
 * the edges.** Once it does, the page boundary itself does the cropping and
 * the cut is honest — no fade needed to disguise it. So there is no max width,
 * no horizontal padding, and no gradient-to-transparent.
 *
 * What the mark buys over the type: the viewBox *is* the ink box, so it fills
 * the viewport exactly at every breakpoint by construction — no font metrics,
 * no `textLength`, no dependence on whether the webfont has loaded. The whole
 * block of derived constants that used to live here is gone.
 *
 * Opacities are higher than they were for the filled type. At this scale the
 * strokes are ~20px wide but they're still strokes, and a stroke carries far
 * less visual weight than a solid letterform at the same opacity.
 *
 * It does not animate. It's texture, not an event: there's no moment here that
 * motion would be reporting on, and the page already closes its narrative with
 * the arc in the Final CTA.
 */

// How much of the mark stays above the page edge; the rest is cut by the
// bottom of the page. Around half keeps every letter plainly readable — the
// A's apex, the R's bowl and the C's arc all survive — while staying a band
// rather than a slab.
const VISIBLE = 0.55;
const SIGNOFF_HEIGHT = Math.round(244 * VISIBLE);

function SignOff() {
  return (
    <div aria-hidden="true" className="mt-4 w-full">
      <svg
        viewBox={`0 0 850 ${SIGNOFF_HEIGHT}`}
        className="block w-full"
        fill="none"
      >
        <defs>
          {/* Spans the letterforms (cap line to baseline) rather than the
              viewBox, so the shading is tied to the mark no matter how much of
              it is showing. A flat fill at this opacity reads as a dull slab,
              so instead there's a narrow catch of light near the top and a
              fall-off below it — the surface looks lit rather than painted,
              Bone, not the accent: the sign-off is texture, not an action.
              Narrow band, never a wide pale plateau. Opacity is baked into the stops so the
              mark dims into the cut and the page edge stays soft. */}
          <linearGradient
            id="arc-signoff-light"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2="242"
          >
            <stop offset="0%" stopColor="#f3f0ea" stopOpacity="0.07" />
            <stop offset="16%" stopColor="#f3f0ea" stopOpacity="0.2" />
            <stop offset="45%" stopColor="#f3f0ea" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f3f0ea" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <g
          stroke="url(#arc-signoff-light)"
          strokeWidth={WORDMARK_STROKE_WIDTH}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          {WORDMARK_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </div>
  );
}
