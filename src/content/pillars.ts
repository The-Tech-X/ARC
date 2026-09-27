// The three pillars: Strategy · Production · Growth (renamed from
// Content Strategy · Production · Motion on 2026-09-27, when the services
// grew to include ads and web work — see src/content/services.ts). Used in depth on
// /about; the landing page only names them.
//
// Described as capability and method — what happens and why — never as
// outcomes achieved.

export type Pillar = {
  index: string;
  name: string;
  body: string;
};

export const PILLARS: Pillar[] = [
  {
    index: "01",
    name: "Strategy",
    body: "The calendar, the angles, the hooks and the scripts. Deciding what's worth making and why, and writing it to be said out loud, before anyone picks up a camera. Most content dies here — not in the edit, but in a week where nobody knew what to shoot.",
  },
  {
    index: "02",
    name: "Production",
    body: "Shooting, editing, motion graphics and AI UGC. Shot knowing exactly what the edit is going to need, then cut for the first three seconds. If you'd rather film it yourself on a phone, that works too — the script accounts for it.",
  },
  {
    index: "03",
    name: "Growth",
    body: "Meta Ads, social media management and the web. Putting the work in front of the right people, reading what actually happened, and feeding it into the next batch — so each round is sharper than the last.",
  },
];
