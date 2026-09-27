// The film — the scroll-stepped brand film that sits directly under About.
//
// One continuous shot, played in beats: scrolling into each step plays the
// video from where it is holding to the next cue, then it pauses on that
// frame until the next scroll. The component (`sections/Film.tsx`) owns the
// mechanics; this file owns the two things that will change — which file,
// and where the cuts are.
//
// `cues` are the INTERIOR cut points in seconds. The start (0) and the end of
// the file are implied, so four cues make five clips:
//   0 → 3 → 6.15 → 10.10 → 16.14 → end
// Decimal seconds, not editor timecode — confirmed with the user 2026-09-12
// ("6.15" is 6.15 s, not 6 s + 15 frames). At 24 fps the browser holds the
// frame that contains each instant, so a cue between two frame boundaries
// resolves to the earlier frame; that's sub-frame and not worth snapping.
//
// Replacing the video:
//   1. The source is `docs/references/source/ARC(F1).mp4` (1920×1080, 24 fps, 38 MB with
//      audio) — never serve that file directly. The web copy is muted (sound
//      can't start from a scroll anyway) and re-encoded:
//        ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 27 \
//          -pix_fmt yuv420p -profile:v high -level 4.1 \
//          -g 24 -keyint_min 24 -sc_threshold 0 \
//          -force_key_frames "0,3,6.15,10.10,16.14" \
//          -movflags +faststart public/film/arc-f1.mp4
//      `-force_key_frames` puts a keyframe at every cue so a seek back to a
//      held frame lands instantly instead of decoding from the last GOP;
//      update that list whenever `cues` changes.
//   2. Keep it 16:9 — the stage covers the viewport on desktop and
//      letterboxes below `lg`, both assuming a landscape frame.
//
// `captions` resolve in over a beat and fade out again. Each one names the
// clip it belongs to (`step`, 0-based), the video time it starts appearing
// (`from` — before the cue, so it begins while the footage is still moving
// and is fully on as the frame stops), and how long it holds after the stop
// before fading out on its own (`hold`, seconds — scrolling on earlier fades
// it at once).
//
// `layout` is chosen against the HELD FRAME, measured, not guessed:
//   band  — the top 45% of the 3 s frame is black with the car centre-left
//           below it, so one column hangs in that band on the page margin.
//   flank — at 6.15 s the car is small and dead centre under its spotlight
//           and both outer quarters are black, so two columns sit either side
//           of it, the right one mirrored. The car is the subject between
//           them, which is the point of that beat's copy.
//   pit   — at 10.10 s the car and its crew fill the middle of the frame
//           from about 37% down, the spotlight cone stands in the top
//           centre, and both upper corners are black. So the headline goes
//           top-left, and the four roles are pinned to the four crew
//           members themselves (callouts, like the last beat's).
//   gauge — at 16.14 s the frame is the driver's view: the wheel and its
//           display dead centre, tyres and sidepods filling both sides, the
//           nose at the top. Nothing is black, so this is the one layout
//           that dims the picture — a scrim on the top and the sides that
//           fades in and out with the caption, leaving the wheel lit. The
//           headline is centred over the nose and the two readouts flank
//           the wheel, mirrored, the way the reference (a darkened still of
//           this very frame) had them.
//   anatomy — the last frame: the car in wide side profile, nose left,
//           small and dead centre on a black floor. The headline centres at
//           the top and five callouts point at the parts they name — lines
//           and dots drawn in FRAME coordinates (percent of the 16:9
//           picture, not the viewport), over a box sized exactly like the
//           covered video, so they land on the same pixels at any width.
//           The car is still settling until ~20.2 s, so the callouts wait
//           for the file to end; only the headline resolves early.
// Below `lg` every layout stacks its columns under the video band.
//
// `columns` hold typed parts, rendered in order, every line entering after
// the one before it across the whole caption. Copy renders exactly as
// written — the caps are in the strings, not applied by CSS — and so do the
// line breaks: each headline line is one line on screen, so break where the
// phrase wants to break rather than letting the column width decide. (The
// first version let "…ARE THOUSANDS OF INVISIBLE / DECISIONS." wrap on its
// own; the three-line stack is the fix, and the ellipses went with it.)
//
// Accent: a headline may name one `highlight` word — the page-wide "one emphasised
// word per headline" allowance — and the payoff's hero words are highlighted by
// definition. Nothing else in a caption is.

export type CaptionPart =
  /** The big lines. `highlight` is the one word in them to set as a Highlight, if any. */
  | { kind: "headline"; lines: readonly string[]; highlight?: string }
  /** A line under the headline, at half its weight. `em` is a word to set in full ivory. */
  | { kind: "sub"; text: string; em?: string }
  /** A row of small tracked labels with hairlines between — the beats. */
  | { kind: "labels"; items: readonly string[] }
  /** A supporting sentence in body type. */
  | { kind: "body"; text: string }
  /** A small line, the one big phrase highlighted (one word per line), a small line. */
  | { kind: "payoff"; before: string; hero: readonly string[]; after: string }
  /** End credits: a role, a hairline, what it does. One line per row. */
  | { kind: "credits"; rows: readonly { role: string; does: string }[] }
  /** A readout: an eyebrow naming whose it is, then metrics with a tick each. */
  | { kind: "gauge"; label: string; items: readonly string[] }
  /**
   * Callouts on the picture. `at` is the part's position and `label` the
   * label's anchor, both as [x%, y%] of the frame; `side` says whether the
   * label hangs above its anchor or sits below it. Below `lg` it renders as
   * a list of pairs instead.
   */
  | { kind: "anatomy"; callouts: readonly Callout[] };

export type Callout = {
  part: string;
  means: string;
  at: readonly [number, number];
  label: readonly [number, number];
  side: "above" | "below";
  /**
   * `means` is a sentence, not a one-word gloss: set in sentence case,
   * wrapping in a narrow block, under `part` at full weight. Used by the pit
   * crew, where each callout is a role and what that role does.
   */
  sentence?: boolean;
};

export type FilmCaption = {
  step: number;
  from: number;
  hold: number;
  layout: "band" | "flank" | "pit" | "gauge" | "anatomy";
  columns: readonly (readonly CaptionPart[])[];
};

export const FILM = {
  src: "/film/arc-f1.mp4",
  cues: [3, 6.15, 10.1, 16.14],
  captions: [
    {
      step: 0,
      from: 2,
      hold: 6,
      layout: "band",
      columns: [
        [
          // The opener states the film's premise and lists its chapters, so a
          // viewer knows what they're about to watch (user, 2026-09-27: the
          // first text "should tell the intent"). The four labels are beats
          // 2–5 in order — driver, crew, data, details — so each later beat
          // pays off a label already read. Keep them in step if a beat moves.
          // "MOVES" echoes the tagline; it's this headline's one highlight.
          {
            kind: "headline",
            lines: ["WHAT MOVES A BRAND", "IS WHAT WINS A RACE."],
            highlight: "MOVES",
          },
          { kind: "labels", items: ["A DRIVER", "A CREW", "THE DATA", "EVERY DETAIL"] },
          {
            kind: "body",
            text: "Watch how ARC builds content the way a team builds a winning car.",
          },
        ],
      ],
    },
    {
      step: 1,
      from: 5.2,
      hold: 7,
      layout: "flank",
      columns: [
        [
          {
            kind: "headline",
            lines: ["YOUR BRAND", "IS THE CAR.", "BUT NO CAR", "DRIVES ITSELF."],
          },
          {
            kind: "body",
            text: "Power, design, engineering — none of it moves until someone takes the wheel.",
          },
        ],
        [{ kind: "payoff", before: "Behind the wheel,", hero: ["ARC", "DRIVES"], after: "your brand forward." }],
      ],
    },
    {
      step: 2,
      from: 8.8,
      hold: 8,
      layout: "pit",
      columns: [
        [
          {
            kind: "headline",
            lines: ["CHAMPIONSHIPS", "ARE BUILT", "IN THE PIT."],
            highlight: "PIT.",
          },
          { kind: "sub", text: "At ARC, your brand is crafted by specialists — one role each.", em: "one" },
        ],
        [
          {
            // The frame has four crew, so four roles, each pinned to a crew
            // member (user, 2026-09-27; this replaced a seven-row roster).
            // Dots sit on each one's back, read off the 10.1 s hold frame.
            // Labels keep to the free black: top-right for the rear-right
            // crew, the floor under the other three, and inside 14–86% of the
            // frame's width, because a 1024px stage crops 12.5% off each side.
            kind: "anatomy",
            callouts: [
              { part: "CREATIVE DIRECTOR", means: "Sets the vision and drives the strategy.", at: [24.5, 45], label: [23, 64], side: "below", sentence: true },
              { part: "CONTENT STRATEGIST", means: "Researches, plans and builds the roadmap.", at: [34.4, 64], label: [31, 85], side: "below", sentence: true },
              { part: "SCRIPTWRITER", means: "Turns ideas into powerful narratives.", at: [67.7, 45], label: [66, 30], side: "above", sentence: true },
              { part: "EDITOR", means: "Shapes the story with precision and flow.", at: [77.1, 63], label: [76, 81], side: "below", sentence: true },
            ],
          },
        ],
      ],
    },
    {
      // The cockpit shot runs from ~13 s and the camera is still pushing in
      // until the stop, so the headline resolves over the move.
      step: 3,
      from: 14.8,
      hold: 8,
      layout: "gauge",
      columns: [
        [{ kind: "headline", lines: ["PERFORMANCE ISN’T GUESSED.", "IT’S MEASURED."], highlight: "MEASURED." }],
        // Four against four, row for row, so each car metric sits directly
        // across from its content equivalent: how fast it travels → views,
        // how long a lap lasts → watch time, whether it holds the road →
        // CTR, where it finishes → conversions. The user chose the ARC four
        // on 2026-09-27; the car's side was reordered to pair with them.
        [{ kind: "gauge", label: "On track", items: ["SPEED", "LAP TIME", "GRIP", "POSITION"] }],
        [
          {
            kind: "gauge",
            label: "On your feed",
            items: ["VIEWS", "WATCH TIME", "CTR", "CONVERSIONS"],
          },
        ],
      ],
    },
    {
      // The last clip runs out to the end of the file; `hold` counts from
      // there. Anchors were read off the final frame (a brightness scan of
      // the car, see AGENTS.md) — re-measure them if the footage changes.
      // STEERING points at the front hub, since steering is what the front
      // wheels do; the reference pointed it at the sidepod, which isn't.
      step: 4,
      from: 19.4,
      hold: 9,
      layout: "anatomy",
      columns: [
        [{ kind: "headline", lines: ["NOTHING EXISTS BY ACCIDENT."], highlight: "ACCIDENT." }],
        [
          {
            kind: "anatomy",
            callouts: [
              { part: "FRONT WING", means: "THE HOOK", at: [30.6, 60.4], label: [23, 36], side: "above" },
              { part: "ENGINE", means: "STORYTELLING", at: [55.8, 49.6], label: [56, 30], side: "above" },
              { part: "PIT CREW", means: "EXECUTION", at: [66.6, 51.2], label: [78, 36], side: "above" },
              { part: "STEERING", means: "CREATIVE DIRECTION", at: [39.1, 58.6], label: [34, 82], side: "below" },
              { part: "TYRES", means: "CONSISTENCY", at: [65.3, 60.2], label: [66, 82], side: "below" },
            ],
          },
        ],
      ],
    },
  ] satisfies readonly FilmCaption[],
} as const;
