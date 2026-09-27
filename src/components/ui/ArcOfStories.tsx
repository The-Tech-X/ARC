"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, motion } from "framer-motion";

import { HERO_FRAMES as FRAMES } from "@/content/hero";

/**
 * The Hero's visual: "the Arc of Stories" (chosen 2026-09-27, replacing the
 * phone mock). Vertical 9:16 story frames, the format ARC makes, set around
 * a 3D arc (the brand's own arch). Each is a different brand's world. The
 * front one is in focus (sharp, lit, REC). The rest curve away into depth,
 * softer and dimmer.
 *
 * Motion, per AGENTS.md → Motion philosophy:
 * - one-time entrance: the frames sweep onto the arc once, as "Move" lands
 *   (`start` is the Hero's introDone; the sweep waits ~1.1 s for the typing);
 * - interaction-tied: the cursor's x turns the arc (drag on touch), and it
 *   eases back to centre when the pointer leaves. Nothing runs on a timer.
 * Under reduced motion the frames sit on the arc from the start.
 *
 * The arch drop is computed from each frame's *current* angle, not its
 * index, so the arc keeps its shape however far it is turned. Frames and
 * captions live in src/content/hero.ts.
 */

const CENTRE = Math.floor(FRAMES.length / 2);
// Degrees between frames. Spaced so neighbours never overlap: the arc
// length between centres (R·step) is ~1.1 frame widths.
const STEP = 17;

export default function ArcOfStories({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState(CENTRE);
  // Rotation in frame-steps, for the arch drop; and whether the entrance
  // sweep has finished (after which transforms follow the cursor directly).
  const [angle, setAngle] = useState(0);
  const [settled, setSettled] = useState(false);
  const [size, setSize] = useState({ w: 250, r: 900 });
  const rot = useMotionValue(0);

  // The sweep: once, as "Move" lands (~1s after typing starts).
  useEffect(() => {
    if (!start) return;
    const t = setTimeout(() => setEntered(true), reduced ? 0 : 1100);
    const u = setTimeout(() => setSettled(true), reduced ? 0 : 1100 + 1400 + 400);
    return () => { clearTimeout(t); clearTimeout(u); };
  }, [start, reduced]);

  // Frame size and radius follow the stage width.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const fw = Math.max(130, Math.min(250, w * 0.3));
      setSize({ w: fw, r: fw * 3.7 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(rot, "change", (v) => {
    setAngle(v / STEP);
    const a = Math.min(FRAMES.length - 1, Math.max(0, Math.round(CENTRE - v / STEP)));
    setActive((prev) => (prev === a ? prev : a));
  });

  // Cursor turns the arc (interaction-tied); spring so it glides.
  const turnTo = (fraction: number) => {
    const max = STEP * CENTRE;
    const target = (0.5 - fraction) * 2 * max;
    animate(rot, target, { type: "spring", stiffness: 60, damping: 18 });
  };
  const drag = useRef<{ x: number; rot: number } | null>(null);

  const h = size.w * (16 / 9);
  return (
    <div className="relative w-full">
      <div
        ref={stageRef}
        className="relative w-full select-none"
        style={{
          // Sized to the frames: their height plus room for the arch's drop.
          height: size.w * (16 / 9) * 1.22,
          perspective: `${size.r * 1.6}px`,
          perspectiveOrigin: "50% 38%",
          touchAction: "pan-y",
          // Frames that swing toward the headline fade out rather than
          // crossing behind it.
          maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 88%, transparent 100%)",
        }}
        onPointerMove={(e) => {
          if (!entered) return;
          const r = e.currentTarget.getBoundingClientRect();
          if (e.pointerType === "mouse") turnTo((e.clientX - r.left) / r.width);
          else if (drag.current) {
            const dx = (e.clientX - drag.current.x) / r.width;
            animate(rot, Math.max(-STEP * CENTRE, Math.min(STEP * CENTRE, drag.current.rot + dx * STEP * 6)), { type: "spring", stiffness: 120, damping: 22 });
          }
        }}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") drag.current = { x: e.clientX, rot: rot.get() }; }}
        onPointerUp={() => { drag.current = null; }}
        onPointerLeave={() => { if (entered) animate(rot, 0, { type: "spring", stiffness: 40, damping: 16 }); }}
      >
        <motion.div
          className="absolute left-1/2 top-[44%]"
          style={{
            transformStyle: "preserve-3d",
            // Push the ring back by its radius so the front frame sits at the
            // stage plane; rotating it turns the arc.
            z: -size.r,
            rotateY: rot,
          }}
        >
          {FRAMES.map((f, i) => {
            const k = i - CENTRE;
            const dist = Math.abs(i - active);
            // The arch: frames step down as they curve away.
            // Drop by where the frame is now relative to the front, so the
            // arch stays an arch however far the ring is turned.
            const pos = k + angle;
            const drop = pos * pos * size.w * 0.1;
            const onArc = entered || reduced;
            return (
              <div
                key={f.key}
                className="absolute"
                style={{
                  width: size.w,
                  height: h,
                  left: -size.w / 2,
                  top: -h / 2,
                  transform: onArc
                    ? `rotateY(${k * STEP}deg) translateZ(${size.r}px) translateY(${drop}px)`
                    : `rotateY(0deg) translateZ(${size.r}px) translateY(40px) scale(0.72)`,
                  opacity: onArc ? Math.max(0.12, 1 - dist * 0.2) : 0,
                  filter: `brightness(${Math.max(0.35, 1 - dist * 0.14)}) blur(${Math.min(3, dist * 0.7)}px)`,
                  transition:
                    reduced || settled
                      ? "opacity 0.4s ease, filter 0.4s ease"
                      : `transform 1.4s cubic-bezier(0.16,1,0.3,1) ${Math.abs(k) * 80}ms, opacity 1s ease ${Math.abs(k) * 80}ms, filter 0.5s ease`,
                  backfaceVisibility: "hidden",
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-[14px]"
                  style={{
                    boxShadow: i === active ? "0 0 0 1px #ff4d1f, 0 40px 80px -30px rgba(0,0,0,0.9)" : "0 0 0 1px rgba(243,240,234,0.12), 0 30px 60px -30px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.src} alt="" draggable={false} className="h-full w-full object-cover" />
                  {/* Frame chrome: a vignette and a scene slate on every frame; the
                      REC light only on the one in front. */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_55%,rgba(0,0,0,0.55))]" />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 font-body text-[10px] tracking-[0.2em] text-[#f3f0ea]/80">
                    {i === active && <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d1f] shadow-[0_0_8px_#ff4d1f]" />}
                    {i === active ? "REC" : `SC ${String(i + 1).padStart(2, "0")}`}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
      {/* The caption names the story in front, in the typewriter voice. */}
      <div className="pointer-events-none relative z-10 mt-1 text-center font-type text-base text-[#f3f0ea]/80 sm:text-lg" aria-live="polite">
        <motion.span
          key={FRAMES[active].key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: entered ? 1 : 0, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          Scene {String(active + 1).padStart(2, "0")} — {FRAMES[active].caption}
        </motion.span>
      </div>
    </div>
  );
}
