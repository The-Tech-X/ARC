// What ARC does, grouped into the three stages the whole site uses:
// Strategy → Production → Growth. Confirmed by the user on 2026-09-27
// (including AI UGC, which ARC offers). Rendered as the isometric services
// map (src/components/sections/Services.tsx).
//
// `line` is the one-liner shown when a service is hovered or focused:
// capability and method, never an outcome or a number.
//
// The map's geometry is sized for 2 / 4 / 3 services per zone. Adding one
// means re-checking the node spacing in Services.tsx (ZONE_ROWS).

export type ServiceIcon =
  | "strategy"
  | "script"
  | "shoot"
  | "edit"
  | "ugc"
  | "motion"
  | "ads"
  | "social"
  | "web";

export type Service = { name: string; line: string; icon: ServiceIcon };
export type Zone = { name: "Strategy" | "Production" | "Growth"; summary: string; services: Service[] };

export const ZONES: Zone[] = [
  {
    name: "Strategy",
    summary: "What to make, and why.",
    services: [
      { name: "Content Strategy", line: "What to post, where, and why — a calendar built around your audience.", icon: "strategy" },
      { name: "Content Scripting", line: "Hooks and scripts written in your voice, before a camera rolls.", icon: "script" },
    ],
  },
  {
    name: "Production",
    summary: "Made, and made well.",
    services: [
      { name: "Shooting", line: "Shoot days run end to end — light, sound, direction.", icon: "shoot" },
      { name: "Editing", line: "Cut for the first three seconds and paced for the scroll.", icon: "edit" },
      { name: "AI UGC Content", line: "Creator-style videos made with AI, to test more angles, faster.", icon: "ugc" },
      { name: "Motion Graphics", line: "Titles, captions and animation that keep the eye moving.", icon: "motion" },
    ],
  },
  {
    name: "Growth",
    summary: "Seen by the right people.",
    services: [
      { name: "Meta Ads", line: "Your strongest content run as ads on Instagram and Facebook, tuned as they run.", icon: "ads" },
      { name: "Social Media Management", line: "Posting, captions and community, handled across your platforms.", icon: "social" },
      { name: "Web Development", line: "Sites and landing pages that turn attention into enquiries.", icon: "web" },
    ],
  },
];
