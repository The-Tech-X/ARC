"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { EASE_OUT, inViewOnce } from "@/lib/motion";
import { WORK, type WorkPiece } from "@/content/work";

/**
 * The reel. Adapts idea-bank entry #2 (grid-to-fullscreen zoom) to the shape
 * the content actually is: vertical 9:16. A landscape zoom would have to
 * crop every piece, so instead the reel runs as a filmstrip and brings each
 * piece to full height centre-stage.
 *
 * Desktop: a pinned stage; scroll scrubs the strip sideways. The scroll IS
 * the reason it moves — no timer anywhere.
 * Mobile: no pinning. Pinned stages are where mobile scroll jank lives, and
 * the effect isn't worth the cost there, so it degrades to a stacked reel.
 */

const CARD_VH = 0.66;
const ASPECT = 9 / 16;

// ---------------------------------------------------------------------------

/**
 * A piece's media. Falls back to the labelled abstract-gradient placeholder
 * while `src` is undefined — the site has always used this convention so
 * that nothing can be mistaken for real client footage.
 */
function WorkMedia({ piece, playing }: { piece: WorkPiece; playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Only the featured piece plays. Everything else stays paused so the
    // browser is never decoding five clips at once.
    if (playing && !reduced) {
      // Autoplay can reject (power saving, or a browser that wants a
      // gesture). A paused poster frame is a fine outcome, so swallow it.
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing, reduced]);

  // No video yet, but a still exists — show the still. This is the state the
  // reel is in until real footage lands, and it reads as a finished section
  // rather than an empty one.
  if (!piece.src && piece.poster) {
    return (
      <Image
        src={piece.poster}
        alt={`${piece.title} — ${piece.role}`}
        fill
        sizes="(min-width: 1024px) 40vh, 80vw"
        className="object-cover"
      />
    );
  }

  if (!piece.src) {
    return (
      <div
        className={`relative h-full w-full bg-gradient-to-br ${piece.tint}`}
      >
        <span className="absolute inset-0 flex items-center justify-center font-heading text-[7rem] font-bold leading-none text-bone/[0.06]">
          {piece.id}
        </span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={piece.src}
      poster={piece.poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  );
}

function PieceMeta({ piece }: { piece: WorkPiece }) {
  return (
    <>
      <p className="font-heading text-2xl font-bold text-bone sm:text-3xl">
        {piece.title}
      </p>
      <p className="mt-2 font-body text-xs uppercase tracking-[0.25em] text-signal/70">
        {piece.role}
      </p>
    </>
  );
}

// --- Desktop: pinned filmstrip ---------------------------------------------

function StageCard({
  piece,
  index,
  position,
  width,
  height,
  playing,
}: {
  piece: WorkPiece;
  index: number;
  position: MotionValue<number>;
  width: number;
  height: number;
  playing: boolean;
}) {
  const distance = useTransform(position, (p) => Math.abs(p - index));
  const scale = useTransform(distance, [0, 1], [1, 0.84]);
  const opacity = useTransform(distance, [0, 1, 2.2], [1, 0.45, 0.12]);
  // A scrim rather than a blur filter: five simultaneously blurred elements
  // is a real cost, and the depth reads the same.
  const scrim = useTransform(distance, [0, 1], [0, 0.55]);

  return (
    <motion.div
      style={{ scale, opacity, width, height }}
      className="relative shrink-0 overflow-hidden rounded-xl border border-bone/10 bg-charcoal"
    >
      <WorkMedia piece={piece} playing={playing} />
      <motion.div
        aria-hidden="true"
        style={{ opacity: scrim }}
        className="pointer-events-none absolute inset-0 bg-deep-black"
      />
    </motion.div>
  );
}

function PinnedReel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dims, setDims] = useState({ width: 0, height: 0, gap: 32 });

  useEffect(() => {
    const compute = () => {
      const height = window.innerHeight * CARD_VH;
      setDims({
        height,
        width: height * ASPECT,
        gap: Math.max(24, window.innerWidth * 0.018),
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Lead-in and lead-out so the first and last pieces hold rather than
  // whipping past at the section boundaries.
  const position = useTransform(scrollYProgress, [0.1, 0.9], [0, WORK.length - 1]);

  const pitch = dims.width + dims.gap;
  const trackX = useTransform(position, (p) => -(p * pitch + dims.width / 2));

  useMotionValueEvent(position, "change", (value) => {
    const next = Math.min(WORK.length - 1, Math.max(0, Math.round(value)));
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <div ref={sectionRef} style={{ height: `${WORK.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="relative h-[66vh]">
          <motion.div
            style={{ x: trackX }}
            className="absolute left-1/2 top-1/2 flex -translate-y-1/2 items-center"
          >
            {WORK.map((piece, index) => (
              <div key={piece.id} style={{ paddingRight: dims.gap }}>
                <StageCard
                  piece={piece}
                  index={index}
                  position={position}
                  width={dims.width}
                  height={dims.height}
                  playing={index === active}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mx-auto mt-10 flex w-full max-w-6xl items-end justify-between px-6 sm:px-12 lg:px-20">
          <div className="min-h-[76px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={WORK[active].id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <PieceMeta piece={WORK[active]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* A filmstrip position readout, not a page-scroll indicator. It's
              horizontal, local to this section, and reads as editing-suite
              chrome — deliberately nothing like the vertical native
              scrollbar that a previous device was rejected for duplicating. */}
          <div className="flex items-center gap-4">
            <span className="font-body text-xs tabular-nums tracking-[0.2em] text-bone/40">
              {String(active + 1).padStart(2, "0")} / {String(WORK.length).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              {WORK.map((piece, index) => (
                <span
                  key={piece.id}
                  className={`h-px w-8 transition-colors duration-300 ${
                    index === active ? "bg-signal" : "bg-bone/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Mobile: stacked reel ---------------------------------------------------

function StackedPiece({ piece }: { piece: WorkPiece }) {
  const ref = useRef<HTMLDivElement>(null);
  // Not `once` — this drives playback, so it has to release when the piece
  // leaves the screen rather than leaving every clip running.
  const inView = useInView(ref, { margin: "-25%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inViewOnce}
      transition={{ duration: 0.8, ease: EASE_OUT }}
    >
      <div className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-xl border border-bone/10 bg-charcoal">
        <WorkMedia piece={piece} playing={inView} />
      </div>
      <div className="mx-auto mt-5 max-w-xs">
        <PieceMeta piece={piece} />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------

export default function Work() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <section id="work" className="relative bg-deep-black py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <SectionHeading eyebrow="Selected Work">
          Proof, not <Highlight>promises</Highlight>.
        </SectionHeading>
      </div>

      {isDesktop ? (
        <div className="mt-16">
          <PinnedReel />
        </div>
      ) : (
        <div className="mt-14 flex flex-col gap-16 px-6 sm:px-12">
          {WORK.map((piece) => (
            <StackedPiece key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </section>
  );
}
