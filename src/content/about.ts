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

/**
 * "Made for where it lands": the three phones in the second card, each showing
 * a piece as it plays in that platform's own vertical player. Order is left to
 * right, and the middle one is the featured frame (asked for by the user on
 * 2026-10-01: YouTube left, Instagram centre, Facebook right).
 *
 * The stills are the Hero's STOCK mood images (Unsplash License, see
 * `hero.ts`), and the accounts are **fictional brands**, not clients: nothing
 * here claims ARC made these posts. Swap in real stills and real accounts
 * (with permission) once there are some. Rules carried over from the rest of
 * the page:
 * - **No numbers in the players.** No like, view or comment counts. A count
 *   on a mock post is an invented metric. The rails show icons and the labels
 *   the apps use when counts are hidden ("Like", "Share").
 * - Captions are pre-trimmed to one line, ending where the app would cut to
 *   "… more". Keep them that short, or they'll run into the action rail.
 */
export const PLATFORM_FRAMES = [
  {
    platform: "youtube",
    src: "/hero/run.webp",
    account: "@pace.run",
    caption: "5am. Nobody's watching.",
  },
  {
    platform: "instagram",
    src: "/hero/pour.webp",
    account: "slowpour.coffee",
    caption: "First pour of the day",
  },
  {
    platform: "facebook",
    src: "/hero/kitchen.webp",
    account: "Ember Kitchen",
    caption: "Ten minutes to service",
  },
] as const;

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
