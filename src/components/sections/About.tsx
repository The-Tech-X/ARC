import type { ReactNode } from "react";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ABOUT_CARDS, ABOUT_STORY, type AboutCard } from "@/content/about";
import ToolCarousel from "@/components/ui/ToolCarousel";
import { ASCENT_MARK, ascentInkBox } from "@/lib/wordmark";

/**
 * About — a bento grid, first thing under the Hero.
 *
 * Replaced `Problem.tsx` ("empty / alone.") on 2026-09-05. That section made
 * the same argument by shouting it; this one makes it by showing the method,
 * which is the register the rest of the page is in.
 *
 * ## Layout
 *
 * A five-column grid on desktop, so the rows can be 2/3 and then 3/2 — the
 * asymmetry is the point of a bento, and an even 2×2 reads as a table of
 * features instead. It collapses to one column below `lg`, where each card
 * keeps its visual-then-text structure.
 *
 * ## Accent discipline
 *
 * Each visual gets **exactly one** accent element — the one thing the card is
 * about: the mark itself, the days something ships, the moment the viewer is
 * won. Everything else is ivory at low alpha. This is the AGENTS.md rule ("this
 * = the thing that matters"), not decoration; if you add a second accent accent
 * to a visual, the first one stops meaning anything.
 *
 * The visuals are SVG rather than imagery on purpose: there is no stock photo
 * here that would be honest about this work, and the placeholder convention
 * used elsewhere (`work.ts`) would look unfinished at this size.
 *
 * Cards enter once on scroll via `Reveal` and then hold. The one thing that
 * keeps moving is the toolkit carousel in the fourth card — a deliberate,
 * user-requested exception to the no-loops rule, documented in
 * `ToolCarousel.tsx`. It's also the only client component in here; the rest is
 * server-rendered.
 */

/**
 * `box` is the visual well above each card's text. Three cards use a fixed
 * height; the carousel uses its own aspect instead, because its drawing is
 * anchored to the top of the frame (the beam has to enter at the card's edge)
 * and a fixed height would leave a dead band of black underneath it at narrow
 * widths. Costs a small difference in where the text starts between the two
 * cards in a row, which is invisible in a bento of unequal cards.
 */
const VISUAL_BOX = "h-56 sm:h-64";

const CARD_LAYOUT: Record<
  AboutCard["id"],
  { span: string; visual: ReactNode; box?: string }
> = {
  hands: { span: "lg:col-span-2", visual: <OneHandVisual /> },
  platform: { span: "lg:col-span-3", visual: <PlatformVisual /> },
  calendar: { span: "lg:col-span-3", visual: <CalendarVisual /> },
  tools: { span: "lg:col-span-2", visual: <ToolCarousel />, box: "aspect-[2/1]" },
};

export default function About() {
  return (
    <section id="about" className="relative bg-deep-black py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <SectionHeading eyebrow={ABOUT_STORY.eyebrow}>
            {/* Broken by hand — left to the column width it wraps
                "…has a / story." and strands the accent word alone. */}
            Every brand
            <br />
            has a <Highlight>story</Highlight>.
          </SectionHeading>

          {/* Quiet, then the turn: the three setup lines are muted and the
              close is full ivory, so the eye lands where ARC enters. */}
          <Reveal delay={0.15} className="max-w-md lg:pb-2">
            <div className="font-body text-base leading-relaxed text-bone/50 sm:text-lg">
              {ABOUT_STORY.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="mt-6 font-body text-base leading-relaxed text-bone sm:text-lg">
              {ABOUT_STORY.close.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-16 lg:mt-20 lg:grid-cols-5">
          {ABOUT_CARDS.map((card, i) => {
            const { span, visual, box = VISUAL_BOX } = CARD_LAYOUT[card.id];
            return (
              <Reveal key={card.id} delay={i * 0.08} className={span}>
                <article className="group h-full overflow-hidden rounded-[28px] border border-bone/10 bg-gradient-to-b from-charcoal/80 to-charcoal/30 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-bone/20">
                  <div className={`relative overflow-hidden ${box}`}>{visual}</div>
                  <div className="px-7 pb-9 text-center sm:px-10 sm:pb-11">
                    <h3 className="font-heading text-2xl font-medium text-bone">
                      {card.title}
                    </h3>
                    <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-relaxed text-bone/55">
                      {card.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ visuals */

const HAIRLINE = "rgba(243,240,234,0.14)";

/**
 * One hand, end to end — the mark on a tile, lit from above, with the four
 * stages threading through it on a single unbroken line. The line is
 * deliberately one path: it's the same "nothing is handed off" idea the card's
 * copy makes.
 */
function OneHandVisual() {
  const a = ascentInkBox();
  return (
    <svg viewBox="0 0 420 224" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="about-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff8a5c" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="about-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2622" />
          <stop offset="100%" stopColor="#151311" />
        </linearGradient>
        <radialGradient id="about-tile-glow">
          <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ff8a5c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the light the tile sits under */}
      <rect x="196" y="0" width="28" height="96" fill="url(#about-beam)" />
      <circle cx="210" cy="118" r="86" fill="url(#about-tile-glow)" />

      {/* One line, in and out of the tile. It meets the tile's *edges*, not
          its corners — through a corner it reads as two unrelated lines that
          happen to end near a box. */}
      <path
        d="M 24 96 H 96 V 130 H 168 M 252 106 H 324 V 140 H 396"
        stroke={HAIRLINE}
        strokeWidth="1"
      />
      {[
        [24, 96],
        [96, 130],
        [324, 106],
        [396, 140],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="rgba(243,240,234,0.3)" />
      ))}

      <rect
        x="168"
        y="76"
        width="84"
        height="84"
        rx="22"
        fill="url(#about-tile)"
        stroke="rgba(255,77,31,0.35)"
      />
      <svg x="192" y="98" width="36" height="40" viewBox={`${a.x} ${a.y} ${a.w} ${a.h}`}>
        <path
          d={ASCENT_MARK}
          fill="none"
          stroke="#ff4d1f"
          strokeWidth="12"
          strokeLinejoin="miter"
        />
      </svg>
    </svg>
  );
}

/**
 * Made for where it lands — three 9:16 frames, the middle one forward and
 * mid-scrub. Vertical because that is the shape the work actually is; a
 * landscape mock here would contradict the sentence underneath it.
 */
function PlatformVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-4 px-6">
      {[
        // The light in each frame sits somewhere different, so three empty
        // frames read as three different shots rather than as one asset
        // repeated. Without real footage this is the only thing carrying that.
        { h: "h-32 sm:h-36", featured: false, glow: "70% 30%" },
        { h: "h-40 sm:h-48", featured: true, glow: "35% 25%" },
        { h: "h-32 sm:h-36", featured: false, glow: "45% 75%" },
      ].map(({ h, featured, glow }, i) => (
        <div
          key={i}
          className={`relative ${h} aspect-[9/16] overflow-hidden rounded-xl border ${
            featured ? "border-bone/15" : "border-bone/10 opacity-75"
          } bg-gradient-to-br from-bone/[0.09] via-transparent to-bone/[0.03]`}
        >
          <span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(110% 70% at ${glow}, rgba(243,240,234,0.13), transparent 62%)`,
            }}
          />
          {featured && (
            <>
              {/* play affordance — outline only, so it reads as a frame of
                  video rather than as a button someone might try to press */}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="10" stroke="rgba(243,240,234,0.35)" />
                  <path d="M9 7.5 L15 11 L9 14.5 Z" fill="rgba(243,240,234,0.55)" />
                </svg>
              </span>
              {/* the one accent element: how far in the viewer still is */}
              <span className="absolute inset-x-2.5 bottom-2.5 h-[3px] overflow-hidden rounded-full bg-bone/15">
                <span className="block h-full w-[62%] rounded-full bg-signal" />
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * A calendar, not a scramble — three panels of the same job, fanned and
 * overlapping, with the stages labelled on chips and a line running between
 * them. Built to the collage in the reference the user supplied on 2026-09-05.
 *
 * The panels are drawn, not photographed. The reference fills its three with
 * real client work — a brand badge, a shoot still, a screen of code — and the
 * honest substitute is the *interface* of each stage rather than a stock photo
 * pretending to be someone's campaign: the plan, the frame, the timeline. A
 * real still can be dropped into the middle frame whenever there is one.
 *
 * Accent: the planned days, and the line joining the stages. Two uses rather than
 * the usual one, and both earn it — the days are the claim the copy makes ("the
 * hooks are decided before anyone picks up a camera") and the line is the
 * "not a scramble" half. Nothing else in here is allowed accent.
 *
 * Geometry is mapped from the reference at roughly half scale, which is why the
 * numbers look arbitrary: they aren't, they're that composition. The viewBox
 * matches the reference's own aspect so the fan reads the same.
 */
const PLAN_DAYS = new Set([3, 9, 12, 18, 23]);

function CalendarVisual() {
  return (
    <svg viewBox="0 0 640 280" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="plan-panel" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f4f3ef" />
          <stop offset="100%" stopColor="#c9c7c0" />
        </linearGradient>
        <linearGradient id="plan-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1e1e" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        <linearGradient id="plan-frame" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgba(243,240,234,0.13)" />
          <stop offset="55%" stopColor="rgba(243,240,234,0.04)" />
          <stop offset="100%" stopColor="rgba(243,240,234,0.09)" />
        </linearGradient>
        <radialGradient id="plan-frame-light" cx="0.35" cy="0.28" r="0.75">
          <stop offset="0%" stopColor="rgba(243,240,234,0.16)" />
          <stop offset="100%" stopColor="rgba(243,240,234,0)" />
        </radialGradient>

        <linearGradient id="plan-frame-foot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
        </linearGradient>

        {/* Without this the three panels sit flat on the card and the fan
            reads as three rectangles that happen to overlap, rather than as a
            stack of things lying on top of each other. */}
        <filter id="plan-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="7" stdDeviation="11" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Lattice, as in the other cards: something for the panels to sit on. */}
      <g stroke="rgba(243,240,234,0.04)">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={i * 46} y1="0" x2={i * 46} y2="280" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 46} x2="640" y2={i * 46} />
        ))}
      </g>

      {/* The line through the stages. Drawn first so it passes *behind* the
          panels and reappears in the gaps — threaded, not laid on top. */}
      <path
        // The left bow has to clear the plan panel's edge (x≈88 once rotated)
        // or the panel simply covers it — which is what happened first time,
        // leaving a stub of accent above the chip and nothing below it.
        d="M 158 66 C 52 80, 30 216, 178 250 M 480 217 C 546 216, 568 186, 556 146"
        stroke="rgba(255,77,31,0.5)"
        strokeWidth="2"
      />

      {/* --- left: the plan. Light, so it reads as paper against three dark
          panels — the same contrast the reference gets from its white phone. */}
      <g transform="rotate(-8 159 170)" filter="url(#plan-shadow)">
        <rect x="100" y="86" width="118" height="168" rx="14" fill="url(#plan-panel)" />
        <rect x="114" y="102" width="54" height="7" rx="3.5" fill="rgba(14,13,11,0.35)" />
        <rect x="114" y="115" width="32" height="5" rx="2.5" fill="rgba(14,13,11,0.18)" />

        {Array.from({ length: 28 }, (_, i) => (
          <rect
            key={i}
            x={114 + (i % 7) * 13}
            y={132 + Math.floor(i / 7) * 13}
            width="9"
            height="9"
            rx="2.5"
            fill={PLAN_DAYS.has(i) ? "#c19a2e" : "rgba(14,13,11,0.13)"}
          />
        ))}

        {[196, 208, 220].map((y, i) => (
          <rect
            key={y}
            x="114"
            y={y}
            width={i === 2 ? 48 : 76}
            height="5"
            rx="2.5"
            fill="rgba(14,13,11,0.15)"
          />
        ))}
      </g>

      {/* --- centre: the frame. 9:16, because that is the shape the work is. */}
      <rect
        x="251"
        y="18"
        width="138"
        height="245"
        rx="20"
        fill="url(#plan-dark)"
        stroke="rgba(243,240,234,0.12)"
        filter="url(#plan-shadow)"
      />
      <rect x="259" y="26" width="122" height="229" rx="14" fill="url(#plan-frame)" />
      <rect x="259" y="26" width="122" height="229" rx="14" fill="url(#plan-frame-light)" />
      {/* Weight at the foot of the frame. Flat grey top to bottom is what
          makes an empty frame look like a missing image rather than a shot. */}
      <rect x="259" y="26" width="122" height="229" rx="14" fill="url(#plan-frame-foot)" />
      <g transform="translate(320 134)">
        <circle r="21" stroke="rgba(243,240,234,0.4)" />
        <path d="M -6 -9 L 10 0 L -6 9 Z" fill="rgba(243,240,234,0.6)" />
      </g>
      <rect x="270" y="238" width="100" height="3" rx="1.5" fill="rgba(243,240,234,0.14)" />
      <rect x="270" y="238" width="58" height="3" rx="1.5" fill="rgba(243,240,234,0.45)" />

      {/* --- right: the timeline. Clips, not code: this is the edit. */}
      <g transform="rotate(-5 481 118)" filter="url(#plan-shadow)">
        <rect
          x="406"
          y="43"
          width="150"
          height="150"
          rx="16"
          fill="url(#plan-dark)"
          stroke="rgba(243,240,234,0.12)"
        />
        {[
          [[418, 30], [452, 44], [500, 22]],
          [[418, 52], [474, 26], [504, 30]],
          [[418, 22], [444, 60], [508, 24]],
        ].map((row, r) =>
          row.map(([x, w], i) => (
            <rect
              key={`${r}-${i}`}
              x={x}
              y={70 + r * 20}
              width={w}
              height="12"
              rx="3"
              fill={`rgba(243,240,234,${0.1 + i * 0.04})`}
            />
          )),
        )}
        {/* waveform under the clips */}
        {Array.from({ length: 26 }, (_, i) => {
          const h = 3 + ((i * 7) % 11);
          return (
            <rect
              key={`w${i}`}
              x={418 + i * 5}
              y={150 - h / 2}
              width="2"
              height={h}
              rx="1"
              fill="rgba(243,240,234,0.16)"
            />
          );
        })}
        {/* Playhead, stopped at the clips it's actually scrubbing — run it the
            full height of the panel and it reads as a scratch on the artwork. */}
        <path d="M 466 64 V 160" stroke="rgba(243,240,234,0.45)" strokeWidth="1" />
        <path d="M 461 60 H 471 L 466 68 Z" fill="rgba(243,240,234,0.55)" />
      </g>

      {/* --- the stages, named. Chips sit on top of everything, as they do in
          the reference — they're labels on the collage, not part of it. */}
      <PanelChip x={158} y={48} width={106} icon={ICON_CALENDAR}>
        Planned
      </PanelChip>
      <PanelChip x={176} y={232} width={84} icon={ICON_CAMERA}>
        Shot
      </PanelChip>
      <PanelChip x={386} y={200} width={94} icon={ICON_UPLOAD}>
        Posted
      </PanelChip>
    </svg>
  );
}

const ICON_CALENDAR = (
  <>
    <rect x="4.5" y="6" width="15" height="13.5" rx="2.5" />
    <path d="M4.5 10.5h15M9 4v4M15 4v4" />
  </>
);

const ICON_CAMERA = (
  <>
    <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
    <circle cx="12" cy="13.2" r="3.4" />
    <path d="M8.6 7l1.4-2.4h4L15.4 7" />
  </>
);

const ICON_UPLOAD = (
  <>
    <path d="M12 15.5V4.5M12 4.5l-3.8 3.8M12 4.5l3.8 3.8" />
    <path d="M4.8 14.5v4a1.6 1.6 0 001.6 1.6h11.2a1.6 1.6 0 001.6-1.6v-4" />
  </>
);

function PanelChip({
  x,
  y,
  width,
  icon,
  children,
}: {
  x: number;
  y: number;
  width: number;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height="34"
        rx="17"
        fill="#151515"
        stroke="rgba(243,240,234,0.12)"
      />
      <circle cx={x + 17} cy={y + 17} r="11.5" fill="rgba(243,240,234,0.07)" />
      <svg x={x + 11} y={y + 11} width="12" height="12" viewBox="0 0 24 24">
        <g
          fill="none"
          stroke="rgba(243,240,234,0.75)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </g>
      </svg>
      <text
        x={x + 36}
        y={y + 22}
        fill="rgba(243,240,234,0.88)"
        fontSize="13"
        fontFamily="var(--font-manrope), ui-sans-serif, system-ui, sans-serif"
      >
        {children}
      </text>
    </g>
  );
}
