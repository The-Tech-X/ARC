"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Variants,
} from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import { EASE_OUT } from "@/lib/motion";
import { FILM, type Callout, type CaptionPart, type FilmCaption } from "@/content/film";

/**
 * The film. One continuous shot, directly under About, played in beats.
 *
 * The stage pins for a few viewport heights of scroll, divided into one zone
 * per clip. Scrolling into a zone plays the video — at normal speed — from
 * wherever it is holding until it reaches that zone's cue, then it pauses on
 * that exact frame until the next zone. Scroll IS the trigger, but it does
 * not scrub: the footage moves at its own pace and the scroll only says
 * "next". (Scrubbing would put a 3D camera move under the reader's thumb,
 * which is a different, twitchier thing.)
 *
 * Rules the mechanics follow, because each one was a decision:
 * - The film never skips a beat. The scroll sets a destination (`step`); the
 *   film (`beat`) gets there one beat at a time, stopping at each cue with
 *   its caption, and only moving on when the caption's hold has run — or
 *   when the reader scrolls again during it, which means "read it, go on".
 *   An earlier version played straight through to wherever the scroll had
 *   landed; a flick skipped three stops and their captions with them. The
 *   alternative, freezing the page while a clip plays, hijacks native
 *   scroll (touch especially) and the idea-bank note in AGENTS.md already
 *   rules that out.
 * - Scrolling back cuts to the previous beat's HOLD frame (the cue that ended
 *   it). Video can't play backwards, and replaying an earlier clip on the way
 *   up would put the intro under a reader who is leaving. A play in progress
 *   is abandoned the same way.
 * - The cut is checked every animation frame, not on `timeupdate` (which
 *   ticks ~4×/s and would overshoot by up to a quarter second), and then the
 *   video is snapped to the cue so the held frame is exact regardless of
 *   where the tick landed.
 * - Reduced motion cuts between the hold frames instead of playing. It still
 *   tells the story; it just doesn't move.
 * - Native scroll throughout. Nothing intercepts the wheel — the idea-bank
 *   note in AGENTS.md on hijacked scroll physics applies here too.
 *
 * A beat can carry a caption (`content/film.ts`). It starts resolving in at a
 * video time slightly before the cue, so it is fully on as the frame stops,
 * holds for a few seconds, then fades out on its own — or at once if the
 * reader scrolls on. Arriving at a held frame from above (scrolling back)
 * shows it again: the reader came back for that beat. Its lines enter one
 * after another, which is the only time the caption moves; the exit is a
 * plain fade. Where a caption sits is decided per layout against the held
 * frame it shares the stage with — see the content file.
 *
 * The file is served muted: sound can't start from a scroll in any browser,
 * so the audio track was dead weight (see `content/film.ts` for the encode).
 */

/** Scroll distance, in vh, that each beat occupies while the stage is pinned. */
const STEP_VH = 80;
/**
 * Extra pinned distance after the last zone begins, so the final clip has
 * time to finish before the stage lets go of the viewport.
 */
const TAIL_VH = 60;

const CUES = FILM.cues;
const CLIPS = CUES.length + 1;
const PIN_VH = CLIPS * STEP_VH + TAIL_VH;

const CAPTIONS = new Map<number, FilmCaption>(
  FILM.captions.map((caption) => [caption.step, caption])
);

/** Half a frame at 24 fps — close enough to "already there" to skip a seek. */
const EPS = 1 / 48;

/**
 * Where the video holds once step `step` has played: the cue that ends its
 * clip. The last clip runs out to the end of the file; before the section
 * pins (`-1`) it holds on the first frame.
 */
function holdTime(step: number) {
  if (step < 0) return 0;
  return step < CUES.length ? CUES[step] : Number.POSITIVE_INFINITY;
}

export default function Film() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  // Where the scroll says the film should be…
  const [step, setStep] = useState(-1);
  // …and where it actually is: the last beat whose hold frame it reached.
  const [beat, setBeat] = useState(-1);
  // Which beat's caption is on screen, if any, and whether the video is
  // actually on that beat's hold frame — a caption can start before that
  // (`from`), but anything drawn onto the picture waits for it. `holding`
  // is the caption's clock running: the film waits for it too.
  const [captionStep, setCaptionStep] = useState<number | null>(null);
  const [settledStep, setSettledStep] = useState<number | null>(null);
  const [holding, setHolding] = useState(false);
  // Lives outside the playback effect on purpose: that effect re-runs when
  // a beat is reached, and a timer inside it would be cleared by its own
  // cleanup the moment it was started.
  const holdTimer = useRef(0);

  const endHold = useCallback(() => {
    window.clearTimeout(holdTimer.current);
    setHolding(false);
    setCaptionStep(null);
    setSettledStep(null);
  }, []);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Progress runs over the whole pinned distance (zones plus tail), so the
  // zone index is progress scaled back into vh and divided by the zone size.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next =
      progress <= 0
        ? -1
        : Math.min(CLIPS - 1, Math.floor((progress * PIN_VH) / STEP_VH));
    setStep((prev) => (prev === next ? prev : next));
    // A scroll during a caption's hold, wanting more, is the reader saying
    // "read it, go on". It can't be the flick that queued the beats: a hold
    // starts only after a clip has played, seconds after any momentum ends.
    if (holding && next > beat) endHold();
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stopped = false;
    let raf = 0;

    // The film is on beat `b`'s hold frame. Show its caption (if it hasn't
    // started already), mark the frame settled, and start its clock. Only
    // ever called from a callback, never from the effect body — setState
    // there is a lint error in this project, and rightly so.
    const arrive = (b: number) => {
      if (stopped) return;
      setBeat(b);
      window.clearTimeout(holdTimer.current);
      const caption = CAPTIONS.get(b);
      if (!caption) {
        setHolding(false);
        setCaptionStep(null);
        setSettledStep(null);
        return;
      }
      setCaptionStep(b);
      setSettledStep(b);
      setHolding(true);
      holdTimer.current = window.setTimeout(endHold, caption.hold * 1000);
    };

    // The frame beat `b` holds on. `duration` is NaN until metadata arrives,
    // and currentTime rejects a non-finite value, so callers check.
    const frameOf = (b: number) => {
      const t = holdTime(b);
      return Number.isFinite(t) ? t : video.duration;
    };

    const cutTo = (b: number) => {
      video.pause();
      const frame = frameOf(b);
      if (Number.isFinite(frame) && Math.abs(video.currentTime - frame) > EPS) {
        video.currentTime = frame;
      }
    };

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };

    // Behind the film, or level with it: make sure it is sitting on the
    // hold frame of `step`. Scrolling back cuts; so does interrupting a play
    // that was on its way to the next beat. Level and already still means
    // nothing to do — this effect also runs when a hold starts or ends.
    if (step <= beat) {
      const frame = frameOf(step);
      const moving =
        !video.paused ||
        (Number.isFinite(frame) && Math.abs(video.currentTime - frame) > EPS);
      cutTo(step);
      if (step < beat || moving) raf = requestAnimationFrame(() => arrive(step));
      return stop;
    }

    // A caption is up. The film waits for its hold, or for the reader.
    if (holding) return;

    // Ahead of the film: play the next beat, never further.
    const next = beat + 1;
    const target = holdTime(next);
    const caption = CAPTIONS.get(next);

    // Motion off, or nothing left to play: cut to the frame instead.
    if (reduced || video.ended) {
      cutTo(next);
      raf = requestAnimationFrame(() => arrive(next));
      return stop;
    }

    // Reached this beat's hold: the cue, or — for the last clip, whose cue
    // is the end of the file — the end of the file.
    const settle = () => {
      if (stopped) return;
      cancelAnimationFrame(raf);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", settle);
      if (Number.isFinite(target)) {
        video.pause();
        // Overshoot is at most one frame; snapping makes the hold exact.
        video.currentTime = target;
      }
      arrive(next);
    };

    // rAF stops in a background tab while the media keeps playing, so
    // `timeupdate` stands in as the coarse fallback that still catches the
    // cue — late, but it catches it, and settle() snaps back.
    const onTime = () => {
      if (video.currentTime >= target) settle();
    };

    let revealed = false;

    const tick = () => {
      if (stopped) return;
      const now = video.currentTime;
      // The caption begins while the footage is still moving, so it is fully
      // on by the time the frame stops rather than arriving after it.
      if (caption && !revealed && now >= caption.from) {
        revealed = true;
        setCaptionStep(next);
      }
      if (now >= target || video.ended) {
        settle();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", settle);
    void video.play().catch(() => {
      // Autoplay refused (iOS Low Power Mode, a data-saver browser). A cut to
      // the frame is the honest fallback — unless this play() was simply
      // superseded by a newer run, in which case that run owns the video.
      if (stopped) return;
      cutTo(next);
      arrive(next);
    });
    raf = requestAnimationFrame(tick);

    return () => {
      stop();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", settle);
    };
  }, [step, beat, holding, reduced, endHold]);

  const shown = Math.max(0, beat);

  return (
    <section
      ref={sectionRef}
      aria-label="The ARC film"
      className="relative bg-deep-black"
      style={{ height: `calc(100svh + ${PIN_VH}vh)` }}
    >
      {/* `svh`, not `screen`: on a phone the stage must never be taller than
          what is actually visible, or the readout sits under the URL bar.

          Below `lg` the stage is a column under the fixed nav: the 16:9 band,
          then a slot that takes whatever height is left above the readout,
          which the captions fade into — so their arrival never shifts the
          picture, and the tallest one (the crew roster) has the room it
          needs on a 667px phone. At `lg` the video covers the stage and the
          slot covers it too; each caption then takes its own place in the
          frame. */}
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-20 pb-4 lg:block lg:p-0">
        {/* The element is sized to its picture — full-bleed cover on desktop,
            a 16:9 band below `lg` — so the edge mask always fades the
            footage's own edges into the page. The video's black is ~#010101
            against the page's #0e0d0b; without the mask the letterbox shows
            as a rectangle a shade darker than everything around it.

            On a short phone the band gives up a little height (30svh at
            375×667 crops ~3% off each side, and the car never reaches the
            frame's edges) so the crew roster fits above the readout. */}
        <video
          ref={videoRef}
          src={FILM.src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="aspect-video max-h-[30svh] w-full shrink-0 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:max-h-none"
          style={{
            WebkitMaskImage: EDGE_MASK,
            WebkitMaskComposite: "source-in",
            maskImage: EDGE_MASK,
            maskComposite: "intersect",
          }}
        />

        {/* Every caption is always in the DOM, stacked in this one slot, and
            only the current step's is faded in — a hidden one still has
            something to fade out from. The div carrying the desktop
            position is a plain div: the translate on the flank layout must
            not share an element with Framer's own transform. */}
        <div className="pointer-events-none relative mt-4 min-h-0 w-full flex-1 lg:absolute lg:inset-0 lg:mt-0">
          {FILM.captions.map((caption) => {
            // Not gated on `beat`: a caption starts resolving in before its
            // cue, while the film is still on its way to that beat.
            const visible = captionStep === caption.step;
            const settled = visible && settledStep === caption.step;
            const scrim = SCRIM[caption.layout];
            const anatomy = anatomyOf(caption);
            return (
              <div key={caption.step} className="absolute inset-0">
                {/* Only where the frame has no black to put type in: the
                    picture falls back at its edges while the caption is up,
                    and comes back as it leaves. Desktop only — below `lg`
                    the caption sits under the band, not over it. */}
                {scrim && (
                  <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: visible ? 1 : 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ backgroundImage: scrim }}
                    className="absolute inset-0 hidden lg:block"
                  />
                )}
                {/* Drawn on the picture itself, so it lives outside the
                    content box and waits for the frame to be final. */}
                {anatomy && <Anatomy callouts={anatomy} settled={settled} />}
                <div className={`absolute inset-x-0 top-0 ${PLACEMENT[caption.layout]}`}>
                  <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
                    <Caption caption={caption} visible={visible} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* A beat counter, the same chrome as the reel's: horizontal, local to
            the stage, and nothing like the browser's own scrollbar. The accent
            means "you are here", as it does on the timeline's playhead. */}
        <div className="pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 pt-4 sm:px-12 lg:px-20 lg:pt-0 lg:pb-12">
            <span className="font-body text-xs tabular-nums tracking-[0.2em] text-bone/40">
              {String(shown + 1).padStart(2, "0")} / {String(CLIPS).padStart(2, "0")}
            </span>
            <div aria-hidden="true" className="flex gap-1.5">
              {Array.from({ length: CLIPS }, (_, i) => (
                <span
                  key={i}
                  className={`h-px w-8 transition-colors duration-300 ${
                    i === shown ? "bg-signal" : "bg-bone/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const EDGE_MASK = [
  "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
  "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
].join(", ");

// --- Caption ----------------------------------------------------------------

/**
 * Desktop placement per layout, measured off the held frames (see the content
 * file). Every top-anchored caption starts at the same 11%, so the headline
 * doesn't jump from beat to beat: it clears the nav's underside, and the
 * band's block still clears the car's halo at 1024×768. `flank`:
 * centred on the car at 6.15 s, which sits a touch below the stage's middle.
 * `pit`: the headline in the top-left corner at 10.10 s, above a crew that
 * starts at 37%; its four roles are callouts on the crew (see `Anatomy`). `gauge`: the headline over the nose at
 * 16.14 s; its readouts hang from it (see COLUMNS) to sit beside the wheel.
 * `anatomy`: the headline over the black above the car on the last frame;
 * its callouts are placed on the picture, not the page — see `Anatomy`.
 */
const PLACEMENT: Record<FilmCaption["layout"], string> = {
  band: "lg:top-[11%]",
  flank: "lg:top-[52%] lg:-translate-y-1/2",
  pit: "lg:top-[11%]",
  gauge: "lg:top-[11%]",
  anatomy: "lg:top-[11%]",
};

/** The callouts of an anatomy caption, if it has any. */
function anatomyOf(caption: FilmCaption) {
  for (const parts of caption.columns) {
    for (const part of parts) {
      if (part.kind === "anatomy") return part.callouts;
    }
  }
  return undefined;
}

/**
 * The cockpit frame has no black anywhere, so the gauge caption dims the
 * picture where its type goes — the top band under the headline and the
 * two sides under the readouts — and leaves the wheel, dead centre, alone.
 * Deep black rather than pure, so the dimmed edges are the page's own
 * colour. Fades with the caption; see the stage markup.
 */
const SCRIM: Partial<Record<FilmCaption["layout"], string>> = {
  gauge: [
    "linear-gradient(to right, rgba(14,13,11,0.92) 0%, rgba(14,13,11,0.78) 22%, rgba(14,13,11,0) 44%, rgba(14,13,11,0) 56%, rgba(14,13,11,0.78) 78%, rgba(14,13,11,0.92) 100%)",
    "linear-gradient(to bottom, rgba(14,13,11,0.9) 0%, rgba(14,13,11,0.65) 20%, rgba(14,13,11,0) 36%)",
  ].join(", "),
  // The pit headline's subline runs one line wide from `xl`, and its tail
  // crosses the jack post and the top of the rear wing. A soft pool of dark
  // in the top-left corner only — the crew and their callouts stay lit.
  pit: "radial-gradient(ellipse 55% 42% at 22% 18%, rgba(14,13,11,0.85) 0%, rgba(14,13,11,0.6) 45%, rgba(14,13,11,0) 100%)",
};

/** `text` with one occurrence of `word` wrapped by `wrap`; `text` if absent. */
function emphasise(
  text: string,
  word: string | undefined,
  wrap: (word: string) => ReactNode
): ReactNode {
  const at = word ? text.indexOf(word) : -1;
  if (!word || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      {wrap(word)}
      {text.slice(at + word.length)}
    </>
  );
}

const LINE_STEP = 0.12;

/**
 * Lines enter one after another — `custom` is the line's index across the
 * whole caption, columns included, so a two-column caption still reads in
 * order. The exit is a single slow fade with no offset, so the block leaves
 * as one thing. `y` is dropped under reduced motion by the global
 * MotionConfig, leaving the fade.
 */
const captionLine: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.9, ease: "easeOut" },
  },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: i * LINE_STEP },
  }),
};

type Align = "left" | "right";

/** How many staggered lines a part renders as. */
function lineCount(part: CaptionPart) {
  switch (part.kind) {
    case "headline":
      return part.lines.length;
    case "labels":
      return part.items.length;
    case "sub":
    case "body":
      return 1;
    case "payoff":
      return 2 + part.hero.length;
    case "credits":
      return part.rows.length;
    case "gauge":
      return 1 + part.items.length;
    case "anatomy":
      return part.callouts.length;
  }
}

/**
 * The index of each part's first line, counted across the whole caption so
 * the stagger runs on from column to column. A plain function rather than a
 * counter inside the render's map(): the compiler lint rejects the latter.
 */
function startIndices(columns: FilmCaption["columns"]) {
  let next = 0;
  return columns.map((parts) =>
    parts.map((part) => {
      const start = next;
      next += lineCount(part);
      return start;
    })
  );
}

/** Renders one part as its lines, numbered from `start`. */
function renderPart(
  part: CaptionPart,
  start: number,
  layout: FilmCaption["layout"],
  align: Align
): ReactNode {
  const right = align === "right";

  switch (part.kind) {
    case "headline": {
      // Lines are broken in the data, one phrase per line. A headline with
      // the width of the stage (band, or the centred ones) takes the full
      // scale; the flank and pit columns are about a third of the stage, so
      // theirs run a size smaller — and on a phone, where the flank column
      // is ~170px, the tracking comes off too so "GETS THE GLORY." stays one
      // line at 375px.
      const narrow = layout === "flank" || layout === "pit";
      const size = narrow
        ? "text-lg tracking-normal sm:text-2xl sm:tracking-[0.04em] xl:text-3xl"
        : "text-xl tracking-[0.04em] sm:text-2xl xl:text-3xl 2xl:text-4xl";
      return (
        <div className="space-y-1">
          {part.lines.map((line, i) => (
            <motion.p
              key={line}
              custom={start + i}
              variants={captionLine}
              className={`font-heading font-bold leading-tight text-bone ${size}`}
            >
              {emphasise(line, part.highlight, (word) => (
                <Highlight>{word}</Highlight>
              ))}
            </motion.p>
          ))}
        </div>
      );
    }

    case "sub":
      // Half the headline's weight, in its face: the line that qualifies it.
      // The emphasised word is the only full-ivory thing in the line.
      return (
        <motion.p
          custom={start}
          variants={captionLine}
          className="mt-2 font-body text-sm tracking-[0.06em] text-bone/55 sm:text-base lg:mt-3 lg:text-sm xl:text-lg"
        >
          {emphasise(part.text, part.em, (word) => (
            <span className="font-medium text-bone">{word}</span>
          ))}
        </motion.p>
      );

    case "labels":
      // Hairlines between the beats: the same chrome as the readout below.
      // Each hairline trails its beat rather than leading the next, so when
      // the row wraps on a phone the new line starts with a word, and the
      // dangling hairline at the end of the first reads as "continues".
      return (
        <div className="mt-5 flex flex-wrap gap-y-2 lg:mt-6">
          {part.items.map((item, i) => (
            <motion.span
              key={item}
              custom={start + i}
              variants={captionLine}
              className="flex items-center font-body text-[11px] font-medium tracking-[0.3em] text-bone/80 sm:text-xs"
            >
              {item}
              {i < part.items.length - 1 && (
                <span aria-hidden="true" className="mx-4 h-px w-6 bg-bone/25" />
              )}
            </motion.span>
          ))}
        </div>
      );

    case "body":
      return (
        <motion.p
          custom={start}
          variants={captionLine}
          className={`mt-4 max-w-md font-body text-sm leading-relaxed text-bone/55 lg:mt-5 ${right ? "ml-auto" : ""}`}
        >
          {part.text}
        </motion.p>
      );

    case "payoff":
      // The one highlighted phrase in the film: the moment it turns to the reader.
      return (
        <div>
          <motion.p
            custom={start}
            variants={captionLine}
            className="font-body text-base tracking-[0.14em] text-bone/70 sm:text-lg"
          >
            {part.before}
          </motion.p>
          <div className="my-1 space-y-1">
            {part.hero.map((word, i) => (
              <motion.p
                key={word}
                custom={start + 1 + i}
                variants={captionLine}
                className="font-heading text-4xl font-bold leading-none tracking-[0.02em] sm:text-5xl xl:text-6xl 2xl:text-7xl"
              >
                <Highlight>{word}</Highlight>
              </motion.p>
            ))}
          </div>
          <motion.p
            custom={start + 1 + part.hero.length}
            variants={captionLine}
            className="font-body text-base tracking-[0.14em] text-bone/70 sm:text-lg"
          >
            {part.after}
          </motion.p>
        </div>
      );

    case "credits":
      // End credits, because this is a film: the role set right against a
      // gutter, a hairline, and what it does — the reference's icon roster
      // said the same thing in an infographic's voice. Roles are given a
      // fixed column so the gutter is one straight line. Below `lg` the
      // roster is a two-column grid of role-over-line pairs instead; seven
      // credit rows are taller than a 667px phone leaves for them.
      return (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 lg:mt-0 lg:block lg:space-y-2.5">
          {part.rows.map((row, i) => (
            <motion.div
              key={row.role}
              custom={start + i}
              variants={captionLine}
              className="lg:grid lg:grid-cols-[11rem_1fr] lg:items-baseline lg:gap-x-5"
            >
              <span className="block font-body text-[10px] font-medium tracking-[0.18em] text-bone/80 sm:text-[11px] lg:text-right">
                {row.role}
              </span>
              <span className="mt-0.5 block border-bone/15 font-body text-[11px] leading-[1.35] text-bone/55 sm:text-xs lg:mt-0 lg:border-l lg:pl-5 lg:text-[13px]">
                {row.does}
              </span>
            </motion.div>
          ))}
        </div>
      );

    case "gauge": {
      // A readout: each metric carries a tick, like a mark on a dial. The
      // reference drew an icon per metric and an arrow between the two
      // lists; the ticks say "measured" without either, and the direction
      // of the comparison comes from weight — ARC's column is the one set
      // in full ivory. Mirrored on the right, ticks outward, like flank.
      const tick = <span aria-hidden="true" className="h-px w-4 shrink-0 bg-bone/30 sm:w-5" />;
      return (
        <div className={right ? "flex flex-col items-end" : ""}>
          <motion.span
            custom={start}
            variants={captionLine}
            className="block font-body text-[10px] uppercase tracking-[0.35em] text-bone/40 lg:text-[11px]"
          >
            {part.label}
          </motion.span>
          <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3 lg:mt-5 lg:space-y-3.5">
            {part.items.map((item, i) => (
              <motion.span
                key={item}
                custom={start + 1 + i}
                variants={captionLine}
                className={`flex items-center gap-3 font-body text-[11px] font-medium tracking-[0.2em] sm:text-xs sm:tracking-[0.25em] lg:text-sm ${
                  right ? "flex-row-reverse text-bone" : "text-bone/60"
                }`}
              >
                {tick}
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      );
    }

    case "anatomy":
      // Below `lg` the callouts can't sit on a 200px-wide car, so they read
      // as a list of pairs: the part, a hairline, what it stands for. At
      // `lg` the overlay takes over and this stays for screen readers.
      // Sentence callouts (the pit crew) are a two-column grid of
      // role-over-sentence pairs instead: a sentence won't fit a table cell.
      if (part.callouts.some((c) => c.sentence)) {
        return (
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 lg:sr-only">
            {part.callouts.map((callout, i) => (
              <motion.p key={callout.part} custom={start + i} variants={captionLine}>
                <span className="block font-body text-[10px] font-medium tracking-[0.18em] text-bone/80 sm:text-[11px]">
                  {callout.part}
                </span>
                <span className="mt-0.5 block font-body text-[11px] leading-[1.35] text-bone/55 sm:text-xs">
                  {callout.means}
                </span>
              </motion.p>
            ))}
          </div>
        );
      }
      return (
        <div className="mx-auto mt-4 max-w-sm space-y-2.5 text-left lg:sr-only">
          {part.callouts.map((callout, i) => (
            <motion.p
              key={callout.part}
              custom={start + i}
              variants={captionLine}
              className="grid grid-cols-[6.75rem_auto_1fr] items-center gap-x-3"
            >
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-bone/45">
                {callout.part}
              </span>
              <span aria-hidden="true" className="h-px w-4 shrink-0 bg-bone/25" />
              <span className="font-body text-[11px] font-medium tracking-[0.2em] text-bone sm:text-xs">
                {callout.means}
              </span>
            </motion.p>
          ))}
        </div>
      );
  }
}

// --- Anatomy overlay ----------------------------------------------------------

/** How far a label sits from the start of its line, in % of frame height. */
const CALLOUT_GAP = 1.6;

/** A label's index → the line draws just after it lands, the dot after that. */
const calloutLine: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
    transition: {
      opacity: { duration: 0.9, ease: "easeOut" },
      pathLength: { delay: 0.9, duration: 0 },
    },
  },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: i * LINE_STEP + 0.25, duration: 0.7, ease: EASE_OUT },
  }),
};

const calloutDot: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.9, ease: "easeOut" } },
  show: (i: number) => ({
    opacity: 1,
    transition: { delay: i * LINE_STEP + 0.85, duration: 0.3 },
  }),
};

/**
 * Callouts drawn on the picture. The box is sized exactly like the covered
 * video — as wide as the stage or as wide as its height demands, whichever
 * is more, at 16:9 and centred — so positions given in percent of the
 * FRAME land on the same pixels of the car at any viewport. The SVG shares
 * the frame's aspect, so its 1920×1080 space scales uniformly and a dot
 * stays round. Waits for `settled`: the car is still drifting until the
 * file ends, and a dot on a moving part is worse than no dot.
 *
 * The Tailwind translates sit on plain divs; the motion elements inside
 * them own their own transform.
 */
function Anatomy({
  callouts,
  settled,
}: {
  callouts: readonly Callout[];
  settled: boolean;
}) {
  const X = 19.2;
  const Y = 10.8;
  return (
    <motion.div
      aria-hidden="true"
      initial="hidden"
      animate={settled ? "show" : "hidden"}
      className="absolute inset-0 hidden overflow-hidden lg:block"
    >
      <div
        className="absolute left-1/2 top-1/2 aspect-video -translate-x-1/2 -translate-y-1/2"
        style={{ width: "max(100%, calc(100svh * 16 / 9))" }}
      >
        <svg
          viewBox="0 0 1920 1080"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          {callouts.map((callout, i) => {
            const [ax, ay] = callout.at;
            const [lx, ly] = callout.label;
            const sy = callout.side === "above" ? ly + CALLOUT_GAP : ly - CALLOUT_GAP;
            return (
              <g key={callout.part}>
                <motion.line
                  custom={i}
                  variants={calloutLine}
                  x1={lx * X}
                  y1={sy * Y}
                  x2={ax * X}
                  y2={ay * Y}
                  stroke="rgba(243,240,234,0.4)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <motion.circle
                  custom={i}
                  variants={calloutDot}
                  cx={ax * X}
                  cy={ay * Y}
                  r={12}
                  fill="rgba(243,240,234,0.18)"
                />
                <motion.circle
                  custom={i}
                  variants={calloutDot}
                  cx={ax * X}
                  cy={ay * Y}
                  r={4.5}
                  fill="#f3f0ea"
                />
              </g>
            );
          })}
        </svg>
        {callouts.map((callout, i) => {
          const [lx, ly] = callout.label;
          return (
            <div
              key={callout.part}
              className={`absolute -translate-x-1/2 ${callout.side === "above" ? "-translate-y-full" : ""}`}
              style={{ left: `${lx}%`, top: `${ly}%` }}
            >
              <motion.div
                custom={i}
                variants={captionLine}
                className={
                  callout.sentence ? "w-[13rem] text-center xl:w-[15rem]" : "whitespace-nowrap text-center"
                }
              >
                {callout.sentence ? (
                  // A role and what it does: the role is the name, so it
                  // carries the weight; the sentence reads as a sentence.
                  <>
                    <span className="block font-body text-xs font-medium tracking-[0.25em] text-bone xl:text-sm">
                      {callout.part}
                    </span>
                    <span className="mt-1.5 block font-body text-[13px] leading-snug text-bone/60 xl:text-sm">
                      {callout.means}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block font-body text-[10px] uppercase tracking-[0.35em] text-bone/45 xl:text-[11px]">
                      {callout.part}
                    </span>
                    <span className="mt-1.5 block font-body text-xs font-medium tracking-[0.25em] text-bone xl:text-sm">
                      {callout.means}
                    </span>
                  </>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * How each layout arranges its columns. `band` is one column on the page
 * margin. `flank` is two, the second mirrored: at `lg` they spread to the
 * stage's edges with the car between them; below it they sit side by side
 * under the video band — stacked, the pair overran the slot on a short
 * phone. `pit` is a headline column at `lg` (its roles are drawn on the
 * picture), with the roles as a two-column list below it under `lg`. `gauge` is a centred headline
 * spanning both cells, then two readouts in the cells beneath — at `lg`
 * dropped by a share of the stage so they sit beside the wheel rather than
 * over the nose, and hugging the outer edges the way flank's columns do.
 */
const COLUMNS: Record<
  FilmCaption["layout"],
  { wrapper: string; column: (c: number) => string; align: (c: number) => Align }
> = {
  band: {
    wrapper: "max-w-2xl",
    column: () => "",
    align: () => "left",
  },
  flank: {
    wrapper: "grid grid-cols-[1.25fr_1fr] items-center gap-4 lg:flex lg:justify-between",
    column: (c) => `min-w-0 lg:w-[30%] ${c > 0 ? "text-right" : ""}`,
    align: (c) => (c > 0 ? "right" : "left"),
  },
  pit: {
    wrapper: "lg:flex lg:items-start lg:justify-between",
    // At `lg` the second column only carries the screen-reader copy of the
    // crew callouts; the overlay draws them on the picture. From `xl` the
    // headline column is wide enough for the subline to stay on one line:
    // wrapped, its second line lands on the rear wing at 1440×900.
    column: (c) => (c === 0 ? "lg:w-[48%] xl:w-[62%]" : "lg:w-[50%] xl:w-[36%]"),
    align: () => "left",
  },
  gauge: {
    wrapper: "grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6 lg:gap-y-[19svh]",
    column: (c) => (c === 0 ? "col-span-2 text-center" : ""),
    align: (c) => (c === 2 ? "right" : "left"),
  },
  anatomy: {
    wrapper: "text-center",
    column: () => "",
    align: () => "left",
  },
};

function Caption({
  caption,
  visible,
}: {
  caption: FilmCaption;
  visible: boolean;
}) {
  const shape = COLUMNS[caption.layout];
  const starts = startIndices(caption.columns);

  return (
    <motion.div
      initial="hidden"
      animate={visible ? "show" : "hidden"}
      className={shape.wrapper}
    >
      {caption.columns.map((parts, c) => (
        <div key={c} className={shape.column(c)}>
          {parts.map((part, p) => (
            <div key={p}>
              {renderPart(part, starts[c][p], caption.layout, shape.align(c))}
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}
