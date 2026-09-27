"use client";

import { useState } from "react";
import Image from "next/image";
import { founder } from "@/content/site";

/**
 * The founder portrait, framed as a video frame — corner ticks, timecode,
 * REC dot — rather than the round agency headshot every other site uses.
 * The founder and the medium are the same thing here, so the frame says it
 * without copy. All chrome is static: it's a treatment, not an animation.
 */
export default function FilmFrame({
  timecode = "00:00:14:08",
  className = "",
  priority = false,
}: {
  timecode?: string;
  className?: string;
  /**
   * Set where the frame is near the top of the page — on /about it's the
   * Largest Contentful Paint element and lazy-loading it delays the metric.
   * Leave false in the Founder section, which is far below the fold.
   */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`group relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-bone/10 bg-charcoal ${className}`}
    >
      {founder.portrait && !failed ? (
        <Image
          src={founder.portrait}
          alt={`${founder.name}, ${founder.role}`}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority={priority}
          // Micro: a slow push-in on hover, like a camera easing forward.
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          // The portrait file may not exist yet. Rather than a broken image,
          // fall through to the placeholder frame.
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-smoke via-charcoal to-deep-black">
          <span className="absolute inset-0 flex items-center justify-center px-6 text-center font-body text-[10px] uppercase tracking-[0.25em] text-bone/25">
            Portrait — add /public/founder.jpg
          </span>
        </div>
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[
          "left-3 top-3 border-l border-t",
          "right-3 top-3 border-r border-t",
          "left-3 bottom-3 border-b border-l",
          "right-3 bottom-3 border-b border-r",
        ].map((corner) => (
          <span
            key={corner}
            className={`absolute h-5 w-5 border-bone/40 ${corner}`}
          />
        ))}

        <span className="absolute left-6 top-5 flex items-center gap-1.5 font-body text-[9px] uppercase tracking-[0.2em] text-bone/50">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]" />
          Rec
        </span>
        <span className="absolute right-6 top-5 font-body text-[9px] tabular-nums tracking-[0.15em] text-bone/40">
          {timecode}
        </span>
        <span className="absolute bottom-5 left-6 font-body text-[9px] uppercase tracking-[0.2em] text-bone/40">
          A-CAM · 24fps
        </span>
      </div>
    </div>
  );
}
