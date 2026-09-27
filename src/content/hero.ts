// The Hero's "Arc of Stories": vertical story frames on ARC's arc.
// Chosen by the user on 2026-09-27 (colour grade), replacing the phone mock.
//
// These are STOCK mood images (Unsplash License: free for commercial use,
// no credit required), not ARC's own work, and the page never claims they
// are. Swap in real stills from the founder's projects as they exist: same
// 9:16 crop, ~600×1066 webp, keep a colour grade that matches. Frames with
// visible third-party logos are not allowed (one was replaced for showing a
// Coca-Cola bottle).
//
// `caption` is what the typewriter line under the arc says when the frame is
// in front ("Scene 05 — The shoot"). The middle entry is in front on load.

export type HeroFrame = { key: string; src: string; caption: string; source: string };

export const HERO_FRAMES: HeroFrame[] = [
  { key: "kitchen", src: "/hero/kitchen.webp", caption: "The kitchen", source: "https://unsplash.com/photos/JKJmdRDfPfk" },
  { key: "craft", src: "/hero/craft.webp", caption: "The craft", source: "https://unsplash.com/photos/89wRkXlbJik" },
  { key: "run", src: "/hero/run.webp", caption: "The run", source: "https://unsplash.com/photos/3DJfakd6VoU" },
  { key: "face", src: "/hero/face.webp", caption: "The face", source: "https://unsplash.com/photos/RoH656UZEgY" },
  { key: "shoot", src: "/hero/shoot.webp", caption: "The shoot", source: "https://unsplash.com/photos/SQL6cO9D9lU" },
  { key: "crowd", src: "/hero/crowd.webp", caption: "The crowd", source: "https://unsplash.com/photos/So6YckShOVA" },
  { key: "pour", src: "/hero/pour.webp", caption: "The pour", source: "https://unsplash.com/photos/ueEPDYDChWE" },
  { key: "city", src: "/hero/city.webp", caption: "The city", source: "https://unsplash.com/photos/AYS2sSAMyhc" },
  { key: "launch", src: "/hero/launch.webp", caption: "The launch", source: "https://unsplash.com/photos/DQcu4QOdj5c" },
];
