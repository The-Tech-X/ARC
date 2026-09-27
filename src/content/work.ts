// The reel. Each entry is one piece of work.
//
// ⚠️ Titles and imagery below are PLACEHOLDER CONTENT so the reel reads as a
// finished section. The `poster` values point at a third-party placeholder
// service and must not survive to launch. `role` describes what ARC did on a
// piece and is never a results metric — no view counts, no growth numbers.
//
// Three states, and the component handles all of them:
//   src + poster  → video plays when featured, poster shows before it loads
//   poster only   → still image (where it is now)
//   neither       → labelled abstract gradient
//
// Adding real video:
//   1. Export vertical 9:16, H.264 mp4, ~1080×1920.
//   2. Compress hard — target under 3 MB per clip. These autoplay muted on
//      scroll and six uncompressed exports will wreck the page on mobile.
//      `ffmpeg -i in.mp4 -vf scale=1080:-2 -c:v libx264 -crf 28 -an out.mp4`
//      (`-an` strips audio: the reel is always muted, so the track is dead
//      weight.)
//   3. Export a poster frame as jpg/webp at the same aspect ratio. Without
//      one the card flashes black before the video is ready.
//   4. Drop both in /public/work/ and point `src` and `poster` at them.

export type WorkPiece = {
  id: string;
  title: string;
  role: string;
  /** Path under /public. Undefined falls back to poster, then placeholder. */
  src?: string;
  /** Poster frame. Shows before video loads, or stands alone without `src`. */
  poster?: string;
  /** Fallback gradient, used only when there's no src and no poster. */
  tint: string;
};

const placeholderPoster = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1080/1920?grayscale`;

export const WORK: WorkPiece[] = [
  {
    id: "01",
    title: "Founder series — talking head",
    role: "Script · Shoot · Edit",
    poster: placeholderPoster("arc-work-1"),
    tint: "from-[#2a2418] to-deep-black",
  },
  {
    id: "02",
    title: "Product launch cutdown",
    role: "Edit · Motion",
    poster: placeholderPoster("arc-work-2"),
    tint: "from-[#1c2430] to-deep-black",
  },
  {
    id: "03",
    title: "Long-form to shorts pipeline",
    role: "Script · Edit",
    poster: placeholderPoster("arc-work-3"),
    tint: "from-charcoal to-deep-black",
  },
  {
    id: "04",
    title: "Studio interview, two-camera",
    role: "Shoot · Edit",
    poster: placeholderPoster("arc-work-4"),
    tint: "from-[#241c22] to-deep-black",
  },
  {
    id: "05",
    title: "Documentary-style brand film",
    role: "Script · Shoot · Edit",
    poster: placeholderPoster("arc-work-5"),
    tint: "from-[#1a2620] to-deep-black",
  },
];
