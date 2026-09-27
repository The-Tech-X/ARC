# ARC — Site Completion Design

**Date:** 2026-09-03
**Status:** Approved by user, ready for implementation
**Scope:** Finish every remaining landing-page section, add the loader, and add the `/about`, `/book`, `/privacy`, `/terms` and 404 routes.

---

## 1. The positioning correction (read this first)

`AGENTS.md` previously stated as fact:

> **Proof position:** ARC has a real client portfolio and real metrics to draw on (not a pre-launch/no-portfolio agency) — the site should lead with evidence, not just brand promise.

**This is no longer true and must not be reintroduced.** The user clarified:

- ARC has **not** worked with brands yet. It is an initial start as a brand.
- The founder **does** have real freelance work — scripting, shooting, editing — and real footage from it.
- The founder **does** have real testimonials from that freelance work.
- **No invented numbers anywhere.** No follower counts, no view counts, no engagement lifts, no "40+ creators."
- **Do not advertise being new either.** No "founding client," no "our first client," no apologetic framing. Say nothing about tenure.

### The consequence

The site's trust mechanism changes from *evidence of results* to **evidence of craft**. The page proves by showing the work and the thinking behind it, never by claiming outcomes. This is the single organising constraint for every decision below.

### Removals required

| Location | What comes out | Why |
|---|---|---|
| `src/components/sections/ProofStrip.tsx` | **Delete the file and its `page.tsx` entry** | All three stats (40+ creators, 100M+ views, 3.2x engagement) are invented. |
| `Hero.tsx` | `40+ creators scaled · 100M+ views generated` | Invented metrics. Replaced with a craft statement: `Scripted · Shot · Edited — end to end`. |
| `Portfolio.tsx` | `+180% reach in 60 days`, `50K → 210K followers in 5 months`, `3.2x average watch time` | Invented metrics. Cards carry **role**, not results. |
| `AGENTS.md` | The "Proof position" bullet and the ProofStrip build-status row | Stale and actively misleading to a future session. |

### Explicitly kept (user decision)

- **The Hero phone mock stays exactly as it is**, including its 128,402 likes count-up and `▲ +342` badge. It was flagged as an invented metric in the most prominent slot; the user chose to keep it. It reads as illustrative product UI rather than a claim about ARC. Not to be changed without a new instruction.
- **`ArcSystem.tsx` is not to be touched.** Untouched in this pass, full stop.
- The `"limited clients per month"` scarcity idea stays **unused** — never verified as true.

---

## 2. Page order

**Attention** — Loader → Hero
**Retention** — Problem → ARC System *(untouched)* → Work → Founder → Testimonials → Why ARC
**Conversion** — How It Works → Final CTA → FAQ → Footer

`ProofStrip` is gone; Hero flows straight into `Problem`. Both are `bg-deep-black`, so per the AGENTS.md seam lesson there must be **no border** between them.

Routes: `/` · `/about` · `/book` · `/privacy` · `/terms` · `not-found`.

---

## 3. Sections

Every one of these must satisfy the AGENTS.md motion bar: name *why* it moves and *when it stops*. One-time entrance, scroll-tied, interaction-tied, or functional affordance — nothing looping on a timer.

### 3.1 Loader — "Ascending Light"

Concept was already locked in AGENTS.md. A point of light traces the logomark's arc once, ignites the wordmark, dissolves into the Hero.

- SVG arc drawn with Framer Motion `pathLength`; a light point rides the same path.
- On reaching the summit the `ARC` wordmark ignites (gold gradient, via `GoldText`).
- Overlay dissolves into Hero. Total ≈ 2.2s.
- **Session-scoped** via `sessionStorage` — plays once per visit, not on every client-side navigation.
- **Skipped entirely** under `prefers-reduced-motion`.

**Coordination problem:** Hero's entrance currently fires on mount and would play unseen behind the overlay. Fix: a small `IntroContext` provider so Hero begins its entrance *as* the loader clears. This is exactly the coordinated cross-section motion the single-React-tree (Next over Astro) decision was made for.

### 3.2 Work — scroll-scrubbed reel

Takes idea-bank entry #2 (jhey's grid-to-fullscreen zoom), rebuilt in Framer Motion — **not** the original's native `animation-timeline`, per the one-motion-system rule and its Safari gaps.

- **Desktop:** a pinned stage holding a grid of vertical 9:16 pieces. Scroll scrubs one piece up to fill the frame while the others recede and dim; its title and role resolve as it lands; it hands off to the next. The scroll *is* the reason it moves.
- **Mobile:** no pinning. A stacked reel that plays in view. Pinned stages are where mobile scroll jank lives, and this is not worth the risk.
- **Video:** self-hosted `mp4`, `muted playsInline preload="metadata"`. **Only the featured clip plays** — all others stay paused, so the browser is never decoding six videos at once.
- **Content:** `src/content/work.ts`. A missing `src` falls back to the existing labelled abstract-gradient placeholder, so the section is complete and honest today and becomes real when files land in `/public/work/`.
- Cards carry **role** (`Script · Shoot · Edit`), never a results metric.

### 3.3 Founder

Asymmetric editorial block. The portrait is framed as a **video frame** — corner ticks, timecode, REC dot — tying the founder to the medium instead of using a standard round agency headshot. First-person and short, per the copy-discipline rule. The signature is an SVG path that draws once on scroll-into-view. Links to `/about` for the long version.

### 3.4 Testimonials — rack focus

Real quotes from the founder's freelance work. **Never invented.**

Not a three-card quote wall. Large pull-quotes stacked in a column; the one nearest viewport centre is sharp and ivory, the others sit blurred and dimmed. Each is driven by **its own** `useScroll`, the reusable technique established in `Problem.tsx`, with the dim value mapped through 4 stops so it **recovers to 1** — the permanent-fade bug AGENTS.md documents. One loud quote, the rest genuinely quiet (Von Restorff).

### 3.5 Why ARC — typography performs the argument

Two columns: *The usual way* vs *The ARC way*. The left is set cramped, low-contrast, tight-leaded. The right is spacious ivory with one gold word. **The layout is the argument before you read a word.** Scroll-tied: the left compresses slightly further as it passes, the right resolves.

### 3.6 How It Works — the editing timeline

Rendered as an actual editing timeline: clips on a track, timecodes, a playhead that **scroll drives** left→right. Each clip expands as the playhead reaches it.

Four steps: `Discovery Call → Strategy & Script → Production → Post & Iterate`.

The most on-brand possible way to draw a process diagram for a video agency. No scarcity claim, no invented turnaround times — timings stay qualitative unless the user supplies real ones.

### 3.7 Final CTA — the arc closes

**The arc motif returns here.** The arc was cut from the Hero as a *looping decoration*. This is a different thing: a one-time, scroll-triggered draw at the moment the page's A→R→C narrative closes. Attention opened the page; conversion closes it. It satisfies the motion bar (one-time, narrative beat, stops) and it is the payoff for the whole acronym conceit.

Explicitly approved by the user, since it is adjacent to something previously rejected. Large headline, magnetic CTA to `/book`.

### 3.8 FAQ

A real `<button>` + `aria-expanded` accordion — accessible, not a div-hack. Answers reveal under a gold hairline that draws left→right. Addresses "what does it cost" honestly (scoped on the call) rather than dodging, since pricing is deliberately off-page.

### 3.9 Footer

The `ARC` wordmark oversized and clipped by the bottom edge as a graphic element. Contact / social / legal columns. Integrated back-to-top — **not** a page-edge line, per AGENTS.md item #7 (never compete with the native scrollbar).

---

## 4. Routes

- **`/about`** — long-form founder story, the three pillars in depth. Editorial layout, not a template.
- **`/book`** — multi-step qualifier: *who you are → what you make → where you're stuck → contact*. Progress shown as a **filling arc**, not a progress bar. Posts to a `/api/book` route handler carrying one clearly marked TODO for the user's email/CRM provider, then a slot sized for a Cal.com/Calendly embed.
- **`/privacy`, `/terms`** — clean and clearly flagged as needing the user's review before launch.
- **`not-found.tsx`** — *"This cut didn't make the final edit."* with slate/timecode chrome.

### Nav

`AGENTS.md` states the absent link menu is deliberate — no exit ramps before the visitor is convinced. **That rule is respected.** Nav stays logo + CTA. `/about` is reached from the Founder section's "Read the full story →" and from the footer.

---

## 5. Shared infrastructure

### Content layer

`src/content/` — `site.ts`, `work.ts`, `testimonials.ts`, `faq.ts`, `process.ts`.

Every string the user will want to change lives here behind `REPLACE_ME` markers, with a checklist in `AGENTS.md`. Going live must be a data change, never a component edit.

### Primitives

- `SectionHeading` — the eyebrow + headline pattern is already copy-pasted across three sections.
- `Reveal` — `fadeUp` / `rackFocus` variants are duplicated between `Hero` and `Portfolio`.

### Accessibility

**`prefers-reduced-motion` is currently handled nowhere in the codebase.** With this much scroll-driven motion that is a real gap, not a nicety. A global guard is part of this work, not a follow-up.

### SEO

Per-page metadata and OpenGraph, plus `sitemap.ts` and `robots.ts`.

### Version discipline

`AGENTS.md` warns this Next version (16.2.10) differs from training data. Route handlers, `sitemap.ts`, `robots.ts` and metadata conventions were **verified against `node_modules/next/dist/docs/`** before writing this spec and behave as expected. Anything further gets checked the same way rather than assumed.

---

## 6. Verification

There is no test runner in this project and this is a visual marketing site, so verification is:

### Done

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean. (Note: this was **already failing** before this work, on `CustomCursor.tsx`. Fixed as part of it.)
3. `npm run build` — succeeds; all 11 routes generate.
4. All routes return correct status codes, including 404 on an unknown path.
5. Server log clean across every route — no errors, no Framer Motion warnings.
6. `/api/book` exercised on four paths: valid → 200, invalid email → 400, malformed JSON → 400, GET → 405.
7. Rendered HTML asserted against the positioning rule: zero occurrences of `100M+`, `40+ creators`, `3.2x`, `180%`, `210K followers`. All new section ids present. Intro script inlines the correct session key.

### Not done — needs a real browser

The Chrome extension was not connected, so **none of the scroll-driven behaviour has been seen running**. Specifically unverified:

- The pinned reel in `Work` — hand-off between pieces, and whether the 5×100vh scroll distance feels right.
- The `HowItWorks` playhead tracking against its clips.
- Rack-focus timing on the testimonial column.
- The arc draw in `FinalCTA`.
- The loader end to end, and the no-flash skip on a repeat visit.
- Layout at mobile and desktop widths, and the AGENTS.md bug class where content growth pushes a vertically-centred block up under the fixed nav.

These need eyes on a real viewport before launch.
