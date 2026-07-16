<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ARC — Project Context

This file is the single source of truth for the ARC landing page project. It replaces the old `CLAUDE.md` (which only pointed here). Read this before making design or content decisions — it captures not just what exists, but *why*, including direction that was tried and explicitly rejected, so it doesn't get reintroduced by accident.

## What ARC is

ARC (formal name: **ARC Media**) is a founder-led creative content agency. Services: content calendar/strategy, scripting, videography, editing, and multi-platform social media management. The name is an acronym: **A**ttention, **R**etention, **C**onversion — that arc is meant to be the literal narrative structure of the page, not just a logo backstory.

- **Tagline:** "Stories that MOVE brands." — deliberate triple meaning: moves people emotionally, moves business metrics, and the agency's product is literally motion/video. "MOVE" is always capitalized when it appears as the emphasized word.
- **Target client:** personal brands, creators, and founders — not enterprise/corporate. Copy and trust-building should read peer-to-peer, not B2B-corporate.
- **Founder-led:** the brand has a real face/team behind it, not an anonymous agency — trust mechanisms (About/testimonials) should lean on that.
- **Proof position:** ARC has a real client portfolio and real metrics to draw on (not a pre-launch/no-portfolio agency) — the site should lead with evidence, not just brand promise.
- **Primary conversion goal:** book a discovery call. Pricing is deliberately not shown on the page — the call is the qualifying/selling moment.
- **Service architecture:** the agency's own bio already frames itself as three pillars — **Content Strategy | Production | Motion** — use this grouping instead of a flat 5-item service list.

## Visual identity

**Palette** (from the brand board, do not deviate):
| Name | Hex | Usage ratio |
|---|---|---|
| Deep Black | `#0a0a0a` | 60% — base |
| Charcoal | `#1a1a1a` | 20% — depth/raised surfaces |
| Ivory | `#f2f1ee` | 15% — text/balance |
| Champagne Gold | `#d4af37` | 5% — accent only |
| Slate Blue | `#24303f` | sliver — secondary depth |

**Typography:** Satoshi (heading, self-hosted via `next/font/local`, 4 weights in `public/fonts/`) + Manrope (body, `next/font/google`). Tailwind tokens: `font-heading` / `font-body`, colors as `bg-deep-black`, `text-ivory`, `text-gold`, etc. — all defined in `src/app/globals.css` under `@theme` (Tailwind v4 CSS-first config, no `tailwind.config.js`).

**Tone words from the brand board:** Minimal, Premium, Modern, Bold, Cinematic.

### Gold — hard-won rules, do not regress
Flat solid `#d4af37` fill on large/bold text reads as **flat mustard-yellow**, not premium gold — this was tried and explicitly rejected after the user flagged it twice. The fix, calibrated directly against a crop of the real logo:
- Gradient runs **vertical, top → bottom** (light catches the top of a stroke, deepens slightly at the bottom) — never diagonal, never a flat fill.
- Stay inside a **light, tight "warm champagne" band**: `#f1dfae → #d4af37 → #c7a565`. Never drift down into dark bronze/amber (`#9c7a24`-ish tones were tried and were too dark).
- Any shimmer/highlight sweep must be a **narrow band**, not a wide pale plateau — a wide bright band is what makes it look washed-out/yellow again.
- Gold has a strict allow-list: primary CTA fills, one emphasized word per key headline, big proof numbers, the logomark. Never nav hover states, never decorative borders/icons "because it looks nice" — dilutes the one thing gold is supposed to mean (this = action / this = the number that matters).
- All gold-text usage goes through `src/components/ui/GoldText.tsx` — do not hand-roll a new gradient elsewhere.

### Motion philosophy — the most important lesson from this build
Early hero drafts had a scrolling marquee ticker and a light that traveled up the arc motif on an infinite loop. Both were explicitly rejected by the user as feeling "cheap" and "reasonless." Research (see below) confirmed the instinct: **motion that isn't tied to scroll, cursor, or a one-time narrative beat reads as decorative filler, not craft.** The best scroll/motion design is "invisible until missing," not a perpetual loop running for its own sake.

Rule going forward: before adding any animation, be able to name *why* it moves and *when it stops*. Acceptable categories:
1. **One-time entrance** (plays once on load/mount, then holds still — e.g. the rack-focus headline reveal, the one-time shimmer sweep on "MOVE").
2. **Scroll-tied** (progress is driven by actual scroll position, e.g. `ProofStrip`'s count-up which triggers once on scroll-into-view).
3. **Interaction-tied** (responds to real cursor/hover — the magnetic CTA button, the custom cursor).
4. **Functional affordance** (the scroll-cue bounce at the bottom of Hero — standard, well-understood "more below" signaling, not decoration).

Anything that loops on a timer with no relation to what the user is doing does not meet the bar. This has already caused two rebuilds — don't reintroduce it.

Sources consulted on this: [Web Design Trends 2026 — reallygooddesigns](https://reallygooddesigns.com/web-design-trends-2026/), [Web Design Trends 2026 reality check — studiomeyer.io](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check), [Dark Minimal Hero Section — Awwwards](https://www.awwwards.com/inspiration/dark-minimal-hero-section-hardik-bhansali), [Scroll-Driven Animations — Josh W. Comeau](https://www.joshwcomeau.com/animation/scroll-driven-animations/).

### Copy discipline
Keep hero-level copy to headline + one short line max. A full sentence/paragraph subheadline under the Hero headline was tried and explicitly cut as "too much" — the headline should carry the section. This likely generalizes to other sections: default to less copy, not more.

## Tech stack (and why)

**Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion.** Chosen over Astro specifically because the site is expected to need coordinated cross-section motion as it grows — Astro's islands architecture isolates state per-island, which fights that; a single React tree doesn't. Framer Motion covers everything from simple reveals to SVG motion paths to scroll-linked transforms, so there was no need to add GSAP on top. Fonts are self-hosted (Satoshi downloaded from Fontshare's CSS API as woff2, not linked externally) to avoid an extra third-party render-blocking request.

Do not introduce a second animation library (GSAP, native CSS `animation-timeline`/`scroll()`) unless Framer Motion genuinely can't do something — it can do everything used so far, and mixing systems fights the "one coherent motion language" goal. Native CSS scroll-timeline animations (seen in reference components, see below) have real cross-browser gaps (Safari especially) that Framer Motion doesn't have.

## Page structure (Attention → Retention → Conversion)

The ARC acronym is meant to structure the page, not just the logo. Planned section order:

**Attention:** Hero → Proof Strip (quick stats)
**Retention:** Problem/Agitate → The ARC System (3 pillars) → Portfolio/Case Studies → Founder/About → Testimonials → Why ARC (differentiation)
**Conversion:** How It Works (de-risk the call) → Final CTA → FAQ → Footer

### Build status
| Section | Status | Notes |
|---|---|---|
| Loader ("Ascending Light") | **Not started** | Concept locked: a point of light traces the logomark's arc shape once, ignites the wordmark, dissolves into Hero. Build after Hero/first sections are stable so there's something to reveal into. |
| Nav | Built | `src/components/ui/Nav.tsx` — deliberately minimal: logo + one CTA, no link menu (avoids giving visitors an exit ramp before they're convinced). |
| Hero | Built, iterated 4x | `src/components/sections/Hero.tsx`. See "what was tried and rejected" below, plus the phone-mockup addition documented as point 10. |
| Proof Strip | Built | `src/components/sections/ProofStrip.tsx` — 3 stats, count up once on scroll-into-view. **Numbers are placeholders** (40+ creators, 100M+ views, 3.2x engagement) — need real figures. |
| Problem/Agitate | Built, iterated twice | `src/components/sections/Problem.tsx` — charcoal background. Went through 4 side-by-side visual concepts before picking one (see "concept process" below), then rebuilt a second time after the first scrollytelling pass felt monotonous — see "quiet/loud/rupture" below for the theory and the fix. |
| The ARC System | Built, rebuilt several times | `src/components/sections/ArcSystem.tsx` — charcoal background, headline "Not a vendor. A system." kept after review. Text (eyebrow/headline/3-item Strategy-Production-Growth list) is a normal in-flow block; the isometric diagram is a **separate background layer**, not a grid column — `relative` + full width on mobile (stacks below the text in DOM order), `lg:absolute lg:inset-y-0 lg:right-0 lg:w-[60%]` on desktop so it can be sized generously without being squeezed into half the section. A `radial-gradient` CSS mask fades all of its edges to transparent, so it can bleed toward the section boundary without ever reading as hard-cropped — this replaced an earlier version that scaled the diagram *down* to fit a fixed grid column, which the user correctly called out as making it feel small/cut-down; masking + a dedicated wide layer was the actual fix, not a smaller scale. Diagram itself: 6 nodes (Plan the Script, Track the Trends, Shoot, Edit, Post, Analyze) grouped into 3 bordered zones matching the 3 layers, connected by 5 straight orthogonal (horizontal/vertical only) lines in strict numeric order 01→02→03→04→05→06, each with a one-time-per-cycle flowing gold highlight showing direction. No loop-back — tried, explicitly rejected by the user as confusing ("don't need any loop"). See "How the isometric diagram actually works" below for the mechanism and the real bugs hit building it — worth reading in full before touching this file again, several looked fine in isolation and broke in context. |
| Portfolio/Case Studies | Built (placeholder content) | `src/components/sections/Portfolio.tsx` — "Selected Work" / "Proof, not promises." Three case cards, each a scroll-tied rack-focus reveal (blur→sharp, scale settling — reuses Hero's established motion language) tied to its own position. Placeholder visuals are abstract gradient blocks mixed from the existing palette (not stock photos standing in for real work — deliberately, to avoid ever being mistaken for real client footage) labeled explicitly "Case Study — Placeholder." Needs real case studies + metrics before launch. |
| Portfolio/Case Studies | Not started | Strong direction found for this one — see "External component ideas" below. |
| Founder/About | Not started | Needs founder photo + bio from user. |
| Testimonials | Not started | Video testimonials preferred if available (video agency should show its own craft here). |
| Why ARC | Not started | |
| How It Works | Not started | Needs to confirm/deny whether "limited clients per month" is a true scarcity claim before using it. |
| Final CTA | Not started | |
| FAQ | Not started | |
| Footer | Not started | |

### What was tried in the Hero and explicitly rejected (don't redo)
1. Flat gold fill on "move" → looked yellow. Fixed with the gradient system above.
2. Centered text stack + blurry ambient gradient blob + fade-up-on-load → this is the generic AI-page-builder pattern; explicitly called out as feeling templated. Replaced with an asymmetric, left-aligned, editorial-scale layout.
3. Scrolling marquee ticker + an arc motif with a light that traveled up it on an infinite loop → called out as "cheap" and "reasonless." Removed. The arc idea was preserved but changed to draw in **once** on load (a finished mark, not a looping animation) — this was the "Arc, Earned" concept.
4. Mouse-parallax drift on background elements → removed for the same reason (motion without a clear driver).
5. A full paragraph subheadline under the headline → cut as unnecessary; headline should carry the section alone.
6. The one-time "Arc, Earned" line + summit dot in the Hero were removed (further minimalism pass).
7. `ScrollArcSpine` — the scroll-tied gold line that ran from the Hero through Proof Strip, filling in proportion to scroll position — was **removed entirely and the component deleted**. It had been kept temporarily after the Hero's arc was removed (its original justification, "picks up where the arc left off," no longer had a visual anchor), and the user then explicitly flagged it as reading like a second, confusing scrollbar duplicating the browser's native one. Do not reintroduce a scroll-position indicator that runs alongside the native scrollbar — if a "how far through the page" device is wanted again, it needs a form that doesn't compete with the browser's own scrollbar (e.g. integrated into a nav element, not a bare line on the page edge).
8. Added a subtle technical **lines grid** to the Hero background — thin ivory lines (`rgba(242,241,238,0.06)`, 64px cells) via CSS `linear-gradient` background-image, positioned behind the Vignette so it naturally fades near the edges. Purely static/decorative texture (no motion), reinforcing "precision/engineered" without needing an animation to justify it.
9. Fixed a visible seam between Hero and Proof Strip: the grid had a hard cutoff at the section's bottom edge, and Proof Strip had a `border-t` — together these read as a stray "white line." Fixed by masking the grid with a `mask-image`/`-webkit-mask-image` linear-gradient (transparent → opaque → transparent, top and bottom) so it fades rather than cuts off, and removing the border entirely (both sections share `bg-deep-black`, so removing the border made them blend with zero seam). **Lesson: any two adjacent sections sharing the same background color should never have a hard border between them** — check for this whenever a new section is inserted next to an existing one.
10. Added a phone mockup to the right side of the Hero: a tilted (`rotateY/rotateX/rotateZ` on a plain inner div, kept off the motion-animated outer div per the same Framer-Motion-owns-`transform` rule learned on ArcSystem), grounded (blurred shadow ellipse), gently-floating (slow infinite `y`/`rotate` bob on a *separate* nested motion.div from the one doing the one-time entrance — two nested motion elements can each own a `transform` concurrently as long as they're different DOM nodes) phone showing a generic Instagram-style post — heart/comment/share icons and UI chrome, not Meta's actual logo/wordmark, and an abstract gradient placeholder for the post media (same placeholder convention as Portfolio). Likes/comments/shares count up from 0 once on mount (not on scroll-into-view like ProofStrip — the phone is above the fold and already visible at load) via the same `useMotionValue` + `animate()` pattern as `ProofStrip.tsx`, formatted with `toLocaleString()` for comma separators. A one-time "+342" delta badge fades in on the likes count right as it lands, then settles to a dim resting opacity — it exists to explain *why* the number is rising (recent growth), not as motion for its own sake; it does not loop. **Bug hit and fixed:** adding the phone below the text on mobile made the section's total content taller than the viewport; since Hero centers its content with `flex-1 justify-center` inside `min-h-screen` and Nav is a `fixed` overlay (not in document flow), the taller content's centered top edge slid up underneath the fixed nav, clipping the eyebrow text behind it. Fixed with defensive top padding on the content wrapper (`pt-28 sm:pt-24 lg:pt-0`) rather than shrinking the phone — **lesson: any time content is added to a section that vertically-centers via flexbox under a `fixed` nav, re-check that growth doesn't push the centered block's top edge above the nav's height, especially on mobile where added elements stack and accumulate height fastest.**

### Problem section — concept selection process (reusable pattern)
When the direction for a section's core creative device was genuinely unclear, the effective approach was: propose 3-5 distinct concepts with reasoning, then **build all of them as real, viewable code** (not just descriptions) on a throwaway comparison route, and let the user pick by actually looking at them live. Concretely: each concept became its own component under a `*-variants/` folder, stacked on a temporary `/​<section>-variants` page with an obvious dev-only label (bright gold bar) above each so it's unmistakable that the labels aren't final UI. After the user picked one, the winner's approach was rebuilt directly into the real section file, and the entire variants folder + temporary route were deleted — no dead code left behind. Use this pattern again for any section where multiple genuinely different creative directions are plausible and worth seeing live rather than debating in the abstract.

### Reusable technique: scroll-driven "word performs its meaning"
Established in `Problem.tsx`: instead of a single whileInView trigger for a whole block, give the specific element that needs a discrete effect its own `useScroll({ target: ref, offset: [...] })` and drive `useTransform` off that element's own scroll position (not a shared/global progress value). This scales cleanly — each effect is self-contained and doesn't need retuning if surrounding copy changes length. One real bug hit and fixed: an effect that dims sibling text while a focal word is centered must have its dim-progress **recover back to 1**, not just clamp at its dimmed value once scrolled past — otherwise everything after that moment stays permanently faded. Fix: use a wider offset range on the *paragraph* (not just the word) covering its full transit through the viewport, and map dim through **3-4 stops** that dip and then return to 1 (e.g. `[0, 0.35, 0.55, 1] → [1, 0.35, 0.35, 1]`), rather than a simple 2-point one-way map.

### Design theory lesson: quiet/loud/rupture, not the same effect four times
First scrollytelling pass on `Problem.tsx` had a real flaw the user correctly caught: every line used the same entrance motion (fade + rise), so even though each word had a *different* payload effect (dissolve / scale / widen), the section still read as one effect repeated four times. The fix, grounded in a few specific principles — worth applying to any future multi-beat scroll section, not just this one:

- **Von Restorff effect (isolation/contrast):** a moment only reads as special if it's surrounded by relative quiet. Don't make every line a spotlight — pick one loud beat and let the others be genuinely quiet (smaller type, less movement, closer to the color of the background) so the loud one has something to contrast against.
- **Motion quality should match meaning, not just the CSS property touched.** "Empty" should barely move (slow, small, entropic). "Alone" should snap in fast then keep growing while lingering (arrival + weight). "Gap" should rupture — a sudden, tight-scroll-window split, not a slow spacing tween.
- **Break the grid for the one moment that means "separate."** `alone.` is pushed off the shared left margin (`ml-8 sm:ml-24 lg:ml-40`) that every other line sits on — visible asymmetry against an otherwise aligned column reads as "wow" precisely because the rest of the layout is orderly.
- **Vary pacing (scroll distance), not just duration.** The loud beat gets a wide scroll window (lingers); the rupture gets a narrow one (snaps). Giving every effect the same scroll-distance-to-resolve is part of what made the first version feel monotonous even with different payloads.

### How the isometric diagram actually works (and the real bugs hit building it)
`ArcSystem.tsx`'s diagram went through a true-3D-projection attempt, a CSS-3D mouse-tilt attempt, and a couple of broken versions of the technique that's actually used now, before landing on something correct. The user also pasted a real DOM dump of a reference isometric diagram mid-build, which settled several things that had been guessed at before. Worth reading this in full before modifying the diagram again.

**The core technique** is a well-known CSS trick, not true 3D and not per-point projection math:
- A flat container gets `transform: rotate(-30deg) skewX(30deg)`. That alone makes a normal square grid look like a proper 30° isometric floor.
- Every node inside it gets the *exact inverse*, `transform: skewX(-30deg) rotate(30deg)`, so its icon/label render as a normal undistorted circle instead of a sheared ellipse, while its *position* (via plain `left`/`top` in the flat, pre-transform coordinate space) still correctly follows the tilted floor.
- **Do not add a `scaleY` correction to either transform.** An early version added one (guessing it was needed for a "true" isometric angle) and it was wrong — verified by hand (matrix multiplication) and empirically (measured rendered badge width/height — with the scaleY term badges came out √3 times wider than tall; without it, exactly 44×44, ratio 1.0). Plain rotate+skewX, no scale, is the exact correct pair.
- Grid lines, connector lines, and zone panels all live in the *same* flat coordinate space as the nodes — that's what makes everything read as one consistent surface instead of separate layers with their own logic.

**Real bugs hit, and the actual fixes** (not just "it looked wrong, we tried something else" — these had identifiable root causes):
1. **A hand-written `transform` string on the same element Framer Motion is also animating (e.g. `animate={{ y: [...] }}`) gets silently fought over** — Framer Motion owns the `transform` property on any `motion.*` component it's animating, so a raw `style.transform` string placed there is unreliable. Fix: put the raw counter-transform on a plain, non-`motion` `<div>`, and put any Framer-animated property (e.g. an idle float) on a *separate* nested `motion.div` that has no competing transform string of its own.
2. **Nested `<svg>` elements don't position reliably.** A version that rendered each connector line as its own `<svg>` (with absolute positioning + `h-full w-full`) *inside* an outer wrapping `<svg>` caused only one of six lines to actually render — nested SVG viewport/positioning behavior is not the same as nesting plain HTML divs. Fix: one single outer `<svg>`, and each line contributes only a `<defs>`/`<path>` (or `<line>`) fragment into it directly — never nest a second `<svg>` inside the first.
3. **`gradientUnits="objectBoundingBox"` (the default) breaks down for vertical or near-vertical lines** — the gradient is defined relative to the path's bounding box width, which is ~0 for a vertical line, making the "flowing highlight" direction inconsistent/backwards depending on the line's orientation. Fix: use `gradientUnits="userSpaceOnUse"` with `x1/y1/x2/y2` set to the line's *actual* start/end coordinates, and scale the `animateTransform` translate distance to that segment's real length (`length * 0.7` worked well) in the direction of its own unit vector. This makes the flow direction correct and consistent regardless of whether a given segment is horizontal or vertical.
4. **Skew shifts x-position proportionally to y**, so elements near the top-left of the flat coordinate space clip against the container's `overflow-hidden` edge more than a flat margin suggests. Fix: shift the whole composition's coordinates right by a healthy buffer (not just a small margin tweak) and re-verify — this took two rounds to get right.
5. **A fixed-pixel-size transformed diagram doesn't responsively scale** — on narrow viewports it just gets cropped by `overflow-hidden`, not shrunk. Fix: wrap the fixed-size transformed content in a separate ancestor that only carries a responsive Tailwind `scale-[...]` class (never combine that with the isometric transform on the same element) — `scale-[0.55] sm:scale-[0.78] lg:scale-[0.8]`. Note the *desktop* scale needed tuning down from 100% too once the diagram moved from a full-width standalone test page into its actual narrower two-column grid slot on the real page — always re-check clipping in the real layout context, not just an isolated test page.
6. **Routing/ordering:** connectors must be simple single-direction (pure horizontal or pure vertical) segments between literally consecutive numbered steps (01→02, 02→03, …) — no multi-corner "loop back" path. A loop-back was tried (curving from the last step back to the first, to visually imply "a system, not a pipeline") and the user rejected it as reading like a confusing direct shortcut between the two endpoints rather than a meaningful return path. Simpler was correct here.
7. **When a fixed-size element doesn't fit its container, the fix is not always "make it smaller."** Shrinking the diagram's scale to stop it clipping inside a grid column was correctly rejected by the user as making it look small/cut-down. The actual fix: stop treating it as a grid column at all — make it a separate absolutely-positioned background layer (full section height, `~60%` width, sitting behind the text via `z-0`/`z-10`), sized as large as the composition actually wants to be, and apply a `radial-gradient` CSS `mask-image` so its edges fade to transparent instead of hard-cropping. A layer that's allowed to bleed and fade reads as intentional and atmospheric; a layer that's scaled down to avoid ever touching its boundary reads as small and cautious. Also: keep the diagram *after* the text in DOM order even though it's visually positioned beside/behind it — `lg:absolute` pulls it out of flow on desktop regardless of DOM position, but on mobile (where it isn't absolutely positioned) DOM order is what determines whether it stacks above or below the heading, and it should stack below.

The pattern used to develop this safely: build comparison variants on a throwaway route (e.g. `/arc-system-variants`), verify shapes empirically (measure actual rendered `getBoundingClientRect()` dimensions and line coordinates via Playwright rather than eyeballing screenshots), then port the winner into the real component and delete the scaffolding route. A private `/reference-diagram` route was also used briefly to reproduce a shared reference's exact DOM structure/technique before adapting it — also deleted once its lessons were absorbed into the real implementation.

## Component library

- `src/lib/theme.ts` — raw hex values for non-Tailwind contexts (SVG strokes, etc).
- `src/components/ui/GoldText.tsx` — the only sanctioned way to render gold text; `shimmer` + `shimmerRepeat` props control one-time vs (deprecated, avoid) looping shimmer.
- `src/components/ui/CTAButton.tsx` — shared CTA pill, `magnetic` prop for cursor-follow (used sparingly, currently only the Hero's primary CTA).
- `src/components/ui/CustomCursor.tsx` — site-wide custom cursor (dot → ring on link/button hover), fine-pointer devices only.
- `src/components/ui/Marquee.tsx` — generic infinite-marquee primitive. **Currently unused** (it was in the Hero, removed). Kept in case a genuinely-justified use turns up (e.g. a logo strip that has a real reason to scroll) — don't reintroduce it into Hero.
- `src/components/sections/Hero.tsx`, `ProofStrip.tsx`, `Problem.tsx` — see status table above.

## External component ideas bank

The user shared three CodePen-style reference components for inspiration. None should be used verbatim (wrong content, wrong aesthetic, and in some cases a fragile/legacy technique) — decisions on what to adapt:

1. **CSS-only horizontal parallax gallery** (rotate-90°-scroll-container hack, vintage Paris photos). **Don't reuse the technique** — it hijacks native scroll physics and has real accessibility problems (breaks keyboard/screen-reader scrolling). The *idea* (a horizontal, depth-layered gallery of work samples) is worth rebuilding properly with Framer Motion `useScroll`/`useTransform` driving a normal `translateX`, if a "brands we've worked with" strip ever gets built.
2. **Scroll-scrubbed grid-to-fullscreen zoom** (jhey's "let's scroll" demo — a grid of thumbnails where one image scales up to fill the viewport as you scroll, others fade out). **Strong fit for Portfolio/Case Studies** — a grid of client thumbnails zooms into a featured case study as the user scrolls, could reveal the result/metric at full-screen. This is purposeful (the scroll *is* the reason it moves) and suits a video agency's portfolio well. Rebuild with Framer Motion (`useScroll` + `useTransform` driving `scale`/`opacity`), not the original's native CSS `animation-timeline: scroll()`/`view()` — that has real cross-browser gaps (the original ships a GSAP fallback specifically because of this) and we'd rather stay on one motion system.
3. **3D flying-keyword grid** (CSS feature names flying toward camera on scroll, `animation-timeline: scroll(root block)`). **Shelved** — it's a tech demo built to showcase experimental CSS, not tied to any real ARC content, and risks being exactly the "cool but reasonless" motion already rejected twice. Only reconsider if there's a specific piece of real content (platform names? outcome keywords?) that would clearly benefit, and even then, treat with caution.

## Open items pending from the user

Needed before the placeholder content in built sections can be finalized:
- Real proof numbers (creators scaled, views generated, engagement lift) — currently placeholders in `ProofStrip.tsx`.
- Real client portfolio/case studies with metrics, for the Portfolio section.
- Founder photo + bio, for the About section.
- Testimonials (video preferred).
- Whether "limited clients per month" is a true scarcity claim (only use if genuinely true).
- Which social platforms to emphasize in the "multi-platform management" pillar.
- Formal vs display naming already decided: **ARC** for logo/nav/headlines, **ARC Media** for `<title>`/footer/legal/formal contexts.
