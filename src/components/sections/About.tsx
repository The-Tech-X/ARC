import type { ReactNode } from "react";
import Image from "next/image";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { ABOUT_CARDS, ABOUT_STORY, PLATFORM_FRAMES, type AboutCard } from "@/content/about";
import { PLATFORM_LOGOS } from "@/lib/platformLogos";
import ToolCarousel from "@/components/ui/ToolCarousel";
import OneHandMark from "@/components/ui/OneHandMark";

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
 * `ToolCarousel.tsx`. The first card's mark (`OneHandMark.tsx`) also plays a
 * one-time entrance of its own when it scrolls in, then holds.
 */

/**
 * `box` is the visual well above each card's text. Three cards use a fixed
 * height (the first row's a step taller, for the phones); the carousel uses its own aspect instead, because its drawing is
 * anchored to the top of the frame (the beam has to enter at the card's edge)
 * and a fixed height would leave a dead band of black underneath it at narrow
 * widths. Costs a small difference in where the text starts between the two
 * cards in a row, which is invisible in a bento of unequal cards.
 */
const VISUAL_BOX = "h-56 sm:h-64";
/** The first row's well, a step taller so the phones are big enough to read. */
const PHONE_BOX = "h-64 sm:h-72";

const CARD_LAYOUT: Record<
  AboutCard["id"],
  { span: string; visual: ReactNode; box?: string }
> = {
  hands: { span: "lg:col-span-2", visual: <OneHandMark />, box: PHONE_BOX },
  platform: { span: "lg:col-span-3", visual: <PlatformVisual />, box: PHONE_BOX },
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


/**
 * Made for where it lands — three phones, each playing a piece in that
 * platform's own vertical player: YouTube Shorts, Instagram Reels (forward)
 * and Facebook Reels. Vertical because that is the shape the work actually is.
 *
 * Each player's chrome is an SVG in a 180×320 (9:16) space laid over the
 * still, so it scales with the phone and the icons stay put at every width.
 * The layouts follow the apps as they look in 2026 — the action rail down the
 * right, account and caption bottom-left, the audio tile at the foot of the
 * rail — in each app's own vocabulary: YouTube's filled icons with "Like" /
 * "Dislike" / "Share" / "Remix" labels and a Subscribe pill, Instagram's
 * outlined heart / comment / repost / send with a Follow outline, Facebook's
 * page name with "· Follow". Set in the system face, as the apps are. Data
 * (stills, accounts, captions) is `PLATFORM_FRAMES` in `about.ts`, which
 * carries the rules: stock stills, fictional accounts, and no counts.
 *
 * Accent: Instagram's progress bar, how far in the viewer still is. The other
 * two players' bars stay bone, including YouTube's, which is red in the app.
 */
const PHONE_SIZE = {
  featured: "h-48 sm:h-60",
  side: "h-40 sm:h-52",
};

function PlatformVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-3 px-4 sm:gap-5">
      {PLATFORM_FRAMES.map((frame) => {
        const featured = frame.platform === "instagram";
        const logo = PLATFORM_LOGOS[frame.platform];
        return (
          <figure key={frame.platform} className="flex flex-col items-center gap-2.5">
            <div
              className={`relative ${featured ? PHONE_SIZE.featured : PHONE_SIZE.side} aspect-[9/16] overflow-hidden rounded-[14px] bg-black shadow-[0_14px_30px_-12px_rgba(0,0,0,0.8)] ring-1 ${
                featured ? "ring-bone/20" : "ring-bone/10"
              }`}
            >
              <Image
                src={frame.src}
                alt=""
                fill
                sizes="(min-width: 640px) 136px, 108px"
                className="object-cover"
              />
              {/* the sides sit back: dimmer, not smaller-and-faded */}
              {!featured && <span className="absolute inset-0 bg-black/30" />}
              <PlayerChrome frame={frame} />
            </div>
            <figcaption className="flex items-center gap-1.5 whitespace-nowrap font-body text-[10px] tracking-wide text-bone/50 sm:text-[11px]">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden="true">
                <path d={logo.d} fill="rgba(243,240,234,0.6)" />
              </svg>
              {logo.label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

const UI_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
const WHITE = "#ffffff";

/** A 24-grid icon placed in the 180×320 player space, centred on (cx, cy). */
function Glyph({
  cx,
  cy,
  size = 15,
  filled = false,
  children,
}: {
  cx: number;
  cy: number;
  size?: number;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <svg x={cx - size / 2} y={cy - size / 2} width={size} height={size} viewBox="0 0 24 24">
      <g
        fill={filled ? WHITE : "none"}
        stroke={filled ? "none" : WHITE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

function Label({
  x,
  y,
  size = 6,
  weight = 400,
  opacity = 1,
  anchor = "start",
  children,
}: {
  x: number;
  y: number;
  size?: number;
  weight?: number;
  opacity?: number;
  anchor?: "start" | "middle" | "end";
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={WHITE}
      fillOpacity={opacity}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily={UI_FONT}
    >
      {children}
    </text>
  );
}

const ICON = {
  heart: <path d="M12 20s-7.5-4.4-7.5-10.1A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.5C19.5 15.6 12 20 12 20z" />,
  bubble: <path d="M12 3.5a8.5 8.5 0 0 0-7.5 12.5L3.5 20.5l4.6-1A8.5 8.5 0 1 0 12 3.5z" />,
  repost: <path d="M4 11.5V9.5a2.5 2.5 0 0 1 2.5-2.5H19M16 4l3 3-3 3M20 12.5v2a2.5 2.5 0 0 1-2.5 2.5H5M8 20l-3-3 3-3" />,
  send: <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4z" />,
  thumbUp: <path d="M2.5 10h4v10.5h-4zM8 20.5V10l3.8-7.2a2 2 0 0 1 3.5 1.6L14.2 9h5.3a2 2 0 0 1 2 2.4l-1.6 7.7a1.8 1.8 0 0 1-1.8 1.4z" />,
  thumbOutline: <path d="M7 10v10.5H3.5V10zM7 10l4-7a2 2 0 0 1 3.6 1.5L13.8 9h5.6a2 2 0 0 1 2 2.4l-1.5 7.5a2 2 0 0 1-2 1.6H7" />,
  ytBubble: <path d="M4 3.5h16a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H8l-4.5 3.8V5A1.5 1.5 0 0 1 4 3.5z" />,
  ytShare: <path d="M13.5 4.5 22 12l-8.5 7.5V15c-5.4 0-8.8 1.6-11.5 5.2C3 14.6 6.4 10 13.5 9.2z" />,
  fbShare: <path d="M13.5 5 21 12l-7.5 7v-4C8 15 4.8 16.6 3 19.5 3.6 13.8 7 10 13.5 9.2z" />,
  remix: <path d="M8.5 5.5a6.5 6.5 0 0 0 0 13M15.5 5.5a6.5 6.5 0 0 1 0 13M12 4v16" />,
  search: <path d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20.5 20.5" />,
  camera: <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h2.2L9.2 4.5h5.6l1.5 2h2.2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2zM12 9.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4z" />,
  chevronDown: <path d="M7 10l5 5 5-5" />,
  note: <path d="M9 18V5.5l10-2V16M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />,
};

function Dots({ cx, cy, vertical = false }: { cx: number; cy: number; vertical?: boolean }) {
  return (
    <g fill={WHITE}>
      {[-4.5, 0, 4.5].map((d) => (
        <circle key={d} cx={vertical ? cx : cx + d} cy={vertical ? cy + d : cy} r="1.3" />
      ))}
    </g>
  );
}

/** The account's avatar: a ringed disc with the account's initial. */
function Avatar({ cx, cy, letter }: { cx: number; cy: number; letter: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill="#3a332c" stroke={WHITE} strokeOpacity="0.85" strokeWidth="0.8" />
      <Label x={cx} y={cy + 2.6} size={7.5} weight={700} anchor="middle">
        {letter}
      </Label>
    </g>
  );
}

/** The spinning-record / audio tile at the foot of the rail, held still. */
function AudioTile({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 8} y={cy - 8} width="16" height="16" rx="3.5" fill="#2a2622" stroke={WHITE} strokeWidth="1.2" />
      <Glyph cx={cx} cy={cy} size={9}>
        {ICON.note}
      </Glyph>
    </g>
  );
}

type Frame = (typeof PLATFORM_FRAMES)[number];

function PlayerChrome({ frame }: { frame: Frame }) {
  const { platform, account, caption } = frame;
  const initial = account.replace("@", "").charAt(0).toUpperCase();
  return (
    <svg viewBox="0 0 180 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        {/* the scrims every player lays over the video so its chrome reads */}
        <linearGradient id={`scrim-${platform}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
          <stop offset="14%" stopColor="#000" stopOpacity="0" />
          <stop offset="62%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="180" height="320" fill={`url(#scrim-${platform})`} />

      {platform === "youtube" && (
        <>
          <Glyph cx={138} cy={20} size={13}>
            {ICON.search}
          </Glyph>
          <Dots cx={162} cy={20} vertical />

          {/* rail */}
          <Glyph cx={161} cy={150} filled>
            {ICON.thumbUp}
          </Glyph>
          <Label x={161} y={168} size={5.5} anchor="middle">Like</Label>
          <g transform="rotate(180 161 186)">
            <Glyph cx={161} cy={186} filled>
              {ICON.thumbUp}
            </Glyph>
          </g>
          <Label x={161} y={204} size={5.5} anchor="middle">Dislike</Label>
          <Glyph cx={161} cy={223} filled>
            {ICON.ytBubble}
          </Glyph>
          <Glyph cx={161} cy={250} filled>
            {ICON.ytShare}
          </Glyph>
          <Label x={161} y={268} size={5.5} anchor="middle">Share</Label>
          <Glyph cx={161} cy={282} size={13}>
            {ICON.remix}
          </Glyph>
          <AudioTile cx={161} cy={302} />

          {/* account, then the title under it, as Shorts sets them */}
          <Avatar cx={18} cy={277} letter={initial} />
          <Label x={30} y={279.5} size={6.8} weight={600}>{account}</Label>
          <rect x="78" y="270.5" width="36" height="13" rx="6.5" fill={WHITE} />
          <text x="96" y="279.3" fill="#0f0f0f" fontSize="6" fontWeight={600} textAnchor="middle" fontFamily={UI_FONT}>
            Subscribe
          </text>
          <Label x={10} y={299} size={6.8}>{caption}</Label>

          <rect x="0" y="317.5" width="180" height="2.5" fill={WHITE} fillOpacity="0.25" />
          <rect x="0" y="317.5" width="74" height="2.5" fill={WHITE} fillOpacity="0.85" />
        </>
      )}

      {platform === "instagram" && (
        <>
          <Label x={10} y={23} size={10} weight={700}>Reels</Label>
          <Glyph cx={48} cy={20} size={10}>
            {ICON.chevronDown}
          </Glyph>
          <Glyph cx={164} cy={20} size={14}>
            {ICON.camera}
          </Glyph>

          {/* rail */}
          <Glyph cx={162} cy={178} size={16}>
            {ICON.heart}
          </Glyph>
          <Glyph cx={162} cy={204} size={15}>
            {ICON.bubble}
          </Glyph>
          <Glyph cx={162} cy={230} size={15}>
            {ICON.repost}
          </Glyph>
          <Glyph cx={162} cy={256} size={14}>
            {ICON.send}
          </Glyph>
          <Dots cx={162} cy={278} />
          <AudioTile cx={162} cy={299} />

          <Avatar cx={18} cy={264} letter={initial} />
          <Label x={30} y={266.5} size={6.8} weight={600}>{account}</Label>
          <rect x="89" y="258.5" width="28" height="12" rx="3.5" fill="none" stroke={WHITE} strokeOpacity="0.85" strokeWidth="0.8" />
          <Label x={103} y={266.6} size={5.8} weight={600} anchor="middle">Follow</Label>
          <Label x={10} y={286} size={6.5}>
            {caption}
            <tspan fillOpacity="0.7">… more</tspan>
          </Label>
          <Glyph cx={13} cy={299} size={7}>
            {ICON.note}
          </Glyph>
          <Label x={19} y={301.2} size={5.8} opacity={0.9}>{account} · Original audio</Label>

          {/* the one accent: how far in the viewer still is */}
          <rect x="0" y="317.5" width="180" height="2.5" fill={WHITE} fillOpacity="0.25" />
          <rect x="0" y="317.5" width="112" height="2.5" fill="#ff4d1f" />
        </>
      )}

      {platform === "facebook" && (
        <>
          <Label x={10} y={23} size={10} weight={700}>Reels</Label>
          <Glyph cx={140} cy={20} size={13}>
            {ICON.search}
          </Glyph>
          <Glyph cx={163} cy={20} size={14}>
            {ICON.camera}
          </Glyph>

          {/* rail */}
          <Glyph cx={162} cy={186} size={15}>
            {ICON.thumbOutline}
          </Glyph>
          <Glyph cx={162} cy={212} size={15}>
            {ICON.bubble}
          </Glyph>
          <Glyph cx={162} cy={238} size={15}>
            {ICON.fbShare}
          </Glyph>
          <Dots cx={162} cy={262} />
          <AudioTile cx={162} cy={286} />

          {/* Facebook shows the page's name, not a handle, with a text Follow */}
          <Avatar cx={18} cy={264} letter={initial} />
          <Label x={30} y={266.5} size={6.8} weight={600}>
            {account}
            <tspan fontWeight={400}> · </tspan>
            <tspan>Follow</tspan>
          </Label>
          <Label x={10} y={286} size={6.5}>
            {caption}
            <tspan fillOpacity="0.7">… See more</tspan>
          </Label>
          <Glyph cx={13} cy={299} size={7}>
            {ICON.note}
          </Glyph>
          <Label x={19} y={301.2} size={5.8} opacity={0.9}>{account} · Original audio</Label>

          <rect x="0" y="317.5" width="180" height="2.5" fill={WHITE} fillOpacity="0.25" />
          <rect x="0" y="317.5" width="52" height="2.5" fill={WHITE} fillOpacity="0.85" />
        </>
      )}
    </svg>
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
