# References

Source material for the site. **None of this is served** — keep it out of
`public/` (Cloudflare Workers rejects any deployed file over 25 MiB, and the
film master alone is 36 MiB).

| Folder | What | Used by |
|---|---|---|
| `brand/ARC Logo.png` | The logo as delivered (photo of the lit sign). | Geometry in `src/lib/wordmark.ts` was measured from it. |
| `brand/founder-portrait-original.png` | Uncropped founder photo. | Cropped 4:5 to `public/founder/samuel.webp`. |
| `source/ARC(F1).mp4` | Film master, 38 MB with audio. | Re-encoded to `public/film/arc-f1.mp4` — ffmpeg line in `src/content/film.ts`. |
| `design/` | The user's references: dot-mosaic, stone-tile grid, hero head. | `src/components/ui/Mosaic.tsx`; the head concept was rejected. |
| `reviews/` | Screenshots of Samuel's client reviews. | Transcribed verbatim into `src/content/testimonials.ts`. |

The UX review lives one level up: `docs/ux-review-2026-09-24.md`.
