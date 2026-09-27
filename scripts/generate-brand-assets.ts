/**
 * Renders every raster brand asset from the one vector definition of the mark.
 *
 *   node scripts/generate-brand-assets.ts
 *
 * (Node ≥ 22.6 strips the types natively; there is no build step. `sharp` comes
 * in with Next, so there is nothing to install.)
 *
 * Outputs, all under src/app/ where Next picks them up by file convention:
 *   favicon.ico        16/32/48, PNG-in-ICO
 *   icon.png           512²
 *   apple-icon.png     180²
 *   opengraph-image.png 1200×630
 *
 * Re-run it if `src/lib/wordmark.ts` ever changes — these files are build
 * artefacts of that module, and they are committed only because Next resolves
 * icons from the filesystem.
 *
 * ## Why the icons are the A and not the whole wordmark
 *
 * The mark is 3.5× wider than it is tall. Fitted into a square favicon the
 * letters end up ~7px tall with sub-pixel strokes — a smudge. The A is
 * very nearly square, it is the half of the mark that carries the idea (the
 * ascent, which is what the intro animates), and it survives 16px. The full
 * wordmark is used where there's room for it: the OG card.
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import {
  ASCENT_MARK,
  ascentInkBox,
  MARK_STOPS,
  WORDMARK_PATHS,
  WORDMARK_STROKE_WIDTH,
} from "../src/lib/wordmark.ts";

const APP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app");
const DEEP_BLACK = "#0e0d0b";

const MARK_BOX = { x: 0, y: 0, w: 850, h: 244 };
const A_BOX = ascentInkBox();

/**
 * The mark is drawn thin (see `WORDMARK_STROKE_WIDTH`), and thin has a floor:
 * below about 1.1 device pixels a stroke stops being a hairline and starts
 * being a dotted grey suggestion. So the small favicon sizes — and only those —
 * get a heavier cut. This is the ordinary optical-sizing adjustment every thin
 * logo needs at 16px, not a second version of the mark.
 */
const MIN_STROKE_PX = 1.1;
function strokeScaleFor(drawHeight: number) {
  const rendered = (WORDMARK_STROKE_WIDTH * drawHeight) / A_BOX.h;
  return Math.max(1, MIN_STROKE_PX / rendered);
}

const markStops = MARK_STOPS.map(
  (s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`,
).join("");

type Box = { x: number; y: number; w: number; h: number };

/**
 * A nested <svg> scales its children's stroke width along with their geometry,
 * so the mark stays proportionally weighted at any size — which is the whole
 * point of keeping it as strokes rather than baking outlines.
 */
function markSvg({
  width,
  height,
  box,
  paths,
  drawHeight,
  stroke,
  strokeScale = 1,
  strokeOpacity = 1,
  background,
}: {
  width: number;
  height: number;
  box: Box;
  paths: readonly string[];
  drawHeight: number;
  stroke: string;
  strokeScale?: number;
  strokeOpacity?: number;
  background?: string;
}) {
  const drawWidth = (drawHeight * box.w) / box.h;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  // userSpaceOnUse, resolved in the *nested* svg's coordinates — the R's arm is
  // a perfectly horizontal line, and objectBoundingBox degenerates on a
  // zero-height box, which drops the stroke entirely. (It did. Twice.)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" gradientUnits="userSpaceOnUse"
          x1="0" y1="${box.y}" x2="0" y2="${box.y + box.h}">${markStops}</linearGradient>
      </defs>
      ${background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ""}
      <svg x="${x}" y="${y}" width="${drawWidth}" height="${drawHeight}"
           viewBox="${box.x} ${box.y} ${box.w} ${box.h}" overflow="visible">
        <g fill="none" stroke="${stroke}" stroke-width="${WORDMARK_STROKE_WIDTH * strokeScale}"
           stroke-opacity="${strokeOpacity}" stroke-linecap="butt" stroke-linejoin="miter">
          ${paths.map((d) => `<path d="${d}"/>`).join("")}
        </g>
      </svg>
    </svg>`,
  );
}

/** The A, bone on warm black, filling ~63% of a square. */
function iconPng(size: number) {
  const drawHeight = size * 0.63;
  return sharp(
    markSvg({
      width: size,
      height: size,
      box: A_BOX,
      paths: [ASCENT_MARK],
      drawHeight,
      stroke: "url(#g)",
      strokeScale: strokeScaleFor(drawHeight),
      background: DEEP_BLACK,
    }),
  )
    .png()
    .toBuffer();
}

/**
 * ICO is a 6-byte directory header, one 16-byte entry per size, then the image
 * data — and since Vista that data is allowed to be a whole PNG, so the entries
 * just point at the PNGs we already have.
 */
function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette size
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const out = (name: string) => path.join(APP_DIR, name);

// ---- favicon.ico + icon.png + apple-icon.png
const [ico16, ico32, ico48, icon512, apple180] = await Promise.all([
  iconPng(16),
  iconPng(32),
  iconPng(48),
  iconPng(512),
  iconPng(180),
]);
await writeFile(
  out("favicon.ico"),
  ico([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ]),
);
await writeFile(out("icon.png"), icon512);
await writeFile(out("apple-icon.png"), apple180);

// ---- opengraph-image.png
//
// The source logo is a lit sign: the letters throw warm light onto the surface
// behind them. That's reproduced here rather than imitated — a wide, blurred
// copy of the mark sits under the crisp one — because a flat wordmark on
// flat black is the one version of this logo that looks cheap.
const OG = { width: 1200, height: 630 };
const markHeight = 182;
const [glow, mark] = await Promise.all([
  sharp(
    markSvg({
      ...OG,
      box: MARK_BOX,
      paths: WORDMARK_PATHS,
      drawHeight: markHeight,
      stroke: "#f4dfa8",
      strokeScale: 1.5,
      strokeOpacity: 0.5,
    }),
  )
    .blur(26)
    .png()
    .toBuffer(),
  sharp(
    markSvg({
      ...OG,
      box: MARK_BOX,
      paths: WORDMARK_PATHS,
      drawHeight: markHeight,
      stroke: "url(#g)",
    }),
  )
    .png()
    .toBuffer(),
]);

await sharp({
  create: { ...OG, channels: 4, background: DEEP_BLACK },
})
  .composite([{ input: glow }, { input: mark }])
  .png()
  .toFile(out("opengraph-image.png"));

console.log("wrote favicon.ico, icon.png, apple-icon.png, opengraph-image.png → src/app/");
