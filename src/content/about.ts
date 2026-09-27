// The four things worth knowing about ARC, shown as the bento grid under the
// Hero. This replaced the "empty / alone." scrollytelling section on
// 2026-09-05 — the argument is the same, made calmly instead of loudly.
//
// The hard rule from site.ts applies here too: **no invented metrics.** Not a
// turnaround time, not a client count, not a retention percentage. Every claim
// below is about method — what happens and why — which is checkable by looking
// at the work, unlike a number nobody can source.
//
// Order is display order. The grid alternates wide and narrow, so swapping two
// entries changes the layout as well as the reading order.

// Brand copy supplied by the user on 2026-09-24, in their own words. Line
// breaks are part of the copy — each string is one line on screen.

/** Home page, over the bento grid: why ARC exists, in one short beat. */
export const ABOUT_STORY = {
  eyebrow: "About ARC",
  lines: [
    "Most people never hear it.",
    "Not because the story isn't good.",
    "Because it wasn't told the right way.",
  ],
  close: [
    "That's where ARC comes in.",
    "We transform ideas into cinematic stories that people remember, trust, and act on.",
  ],
} as const;

/** /about, opening: what ARC is. */
export const ABOUT_INTRO = [
  "ARC is a creative agency focused on helping brands build, grow, and elevate their presence through content and social media.",
  "We combine strategy, storytelling, design, and motion to create work that doesn't just look good — it gets attention, builds recognition, and gives people a reason to remember the brand behind it.",
  "From the first idea to the final frame, every decision has a purpose.",
] as const;

/**
 * /about, the philosophy. The whys are grouped under the stage of the arc
 * each one answers — stop is Attention, care and remember are Retention,
 * choose is Conversion — so the acronym is the structure of the list rather
 * than a slogan repeated above it.
 */
export const ARC_WHY = {
  lede: "But not every brand knows where its story is going.",
  intro: "We obsess over the why.",
  stages: [
    { stage: "Attention", whys: ["Why should someone stop?"] },
    { stage: "Retention", whys: ["Why should they care?", "Why should they remember?"] },
    { stage: "Conversion", whys: ["Why should they choose you?"] },
  ],
  close: "That's ARC.",
} as const;

export type AboutCard = {
  /** Ties the copy to its visual in `About.tsx`. */
  id: "hands" | "platform" | "calendar" | "tools";
  title: string;
  body: string;
};

export const ABOUT_CARDS: AboutCard[] = [
  {
    id: "hands",
    title: "One hand, end to end",
    body: "Script, shoot, edit — one person holding the thread the whole way. What gets published is what was intended, not the compromise that survived four inboxes.",
  },
  {
    id: "platform",
    title: "Made for where it lands",
    body: "Shot knowing what the edit will need, and cut for the platform it's going out on. Vertical, native, finished — never a landscape film squeezed into a phone.",
  },
  {
    id: "calendar",
    title: "A calendar, not a scramble",
    body: "The angles and the hooks are decided before anyone picks up a camera. Most content doesn't die in the edit. It dies in a week where nobody knew what to shoot.",
  },
  {
    id: "tools",
    // The logos are the vendors' trademarks and appear only to name the
    // software — see the note in src/lib/toolLogos.ts before touching them.
    // Keep this copy honest about what AI is actually used for: the moment it
    // implies the work is generated, the whole founder-led argument collapses.
    title: "Tools that earn their place",
    body: "Premiere, the Adobe suite, and whatever a cut actually needs. Claude and ChatGPT where they genuinely help — research, structure, alternate hooks. None of it makes the work; it just stops the boring parts from eating the week.",
  },
];
