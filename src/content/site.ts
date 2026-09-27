// Brand-level facts and contact details.
//
// ⚠️ THE VALUES HERE ARE PLAUSIBLE SAMPLES, NOT CONFIRMED FACTS. They exist
// so the site can be reviewed as a finished design instead of a page full of
// REPLACE_ME. Every one of them is a guess and needs your confirmation —
// especially the email address, the location, and the social handles, which
// are wrong until you say otherwise. See the launch checklist in AGENTS.md.
//
// Hard rule for this file and every other file under src/content/:
// no invented metrics. No follower counts, view counts, engagement lifts,
// client counts, or turnaround averages that aren't real. Sample *copy* is
// fine — a sample *statistic* is a lie with a number on it. The site proves
// by showing craft, not by claiming results.

export const site = {
  name: "ARC",
  legalName: "ARC Media",
  tagline: "Stories that MOVE brands.",

  // Used for canonical URLs, sitemap and OpenGraph. Set NEXT_PUBLIC_SITE_URL
  // in the deployment environment; the fallback only exists so local builds
  // don't crash.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcmedia.co",

  // Where /book sends enquiries (2026-09-27, supplied by the user). The form
  // opens WhatsApp to this number with the visitor's answers written out as
  // a ready-to-send message. Digits only, with country code, no "+".
  whatsapp: "916305297298",
  whatsappDisplay: "+91 63052 97298",

  // ⚠️ Guesses. Confirm both.
  email: "hello@arcmedia.co",
  location: "Hyderabad, India",

  // Cal.com / Calendly / SavvyCal link. While this is empty the /book page
  // renders the qualifier form alone and skips the scheduler step, so an
  // empty value is safe to ship.
  schedulerUrl: "",

  // ⚠️ Placeholder handles — these do not resolve to real profiles yet.
  socials: [
    { label: "Instagram", href: "https://instagram.com/arc.media" },
    { label: "YouTube", href: "https://youtube.com/@arcmedia" },
    { label: "LinkedIn", href: "https://linkedin.com/company/arcmedia" },
  ],

  // The agency's own framing, kept consistent across Hero, About and Footer.
  pillars: ["Content Strategy", "Production", "Motion"],

  // What the name stands for, in letter order — the intro expands the mark into
  // these. Not marketing copy: it's the acronym, and the page is structured
  // around it, so changing a word here means changing the page's spine.
  acronym: ["Attention", "Retention", "Conversion"],
} as const;

export const founder = {
  // Confirmed by the user on 2026-09-05.
  name: "Samuel",
  role: "Creative Strategist · Filmmaker",

  // Kept deliberately short on the landing page — the copy-discipline rule
  // says the headline carries the section. The long version lives on /about.
  short:
    "I'm a creative strategist and filmmaker who started with a camera, an editing timeline, and a curiosity about why some content makes us stop scrolling while the rest disappears.",

  // The credibility figures, shown as a minimal three-up row in the Founder
  // section. Supplied by the user on 2026-09-24 as fact. They sit under
  // Samuel's name because they are his record — the same figures as the
  // /about prose below; change both together.
  record: [
    { value: "40+", label: "International clients" },
    { value: "10+", label: "Brands" },
    { value: "100+", label: "Projects" },
  ],

  // /about long form, in the user's own words (supplied 2026-09-24).
  //
  // The figures in the fourth paragraph are the founder's *personal* freelance
  // record, supplied by the user as fact — they and `record` above are the
  // only place numbers are allowed in this file. They are not ARC's client list and must never be
  // reworded into one ("ARC has worked with 10+ brands" would be false). If
  // they change, change them here; don't round them up anywhere else.
  long: [
    "I'm Samuel.",
    "I'm a creative strategist and filmmaker who started with a camera, an editing timeline, and a curiosity about why some content makes us stop scrolling while the rest disappears.",
    "Over time, that curiosity turned into ARC.",
    "I've worked with 40+ international clients, 10+ brands, and across 100+ projects, creating everything from short-form content and brand films to motion graphics and social campaigns.",
    "But I don't want ARC to be another agency that simply makes content. I want to understand why something deserves attention in the first place.",
    "That's why I study advertising, storytelling, psychology, design, film, and the brands that have mastered them — and bring those principles into the work we create.",
    "Because the goal isn't to make more content. It's to make content that matters.",
  ],

  // Portrait for the Founder section and /about.
  //
  // Supplied by the user on 2026-09-27, cropped 4:5 from a square original
  // (the crop also removes a laptop's Apple logo at the right edge). Full
  // colour: the FilmFrame chrome carries the "video frame" idea on its own.
  portrait: "/founder/samuel.webp",
} as const;

export type Social = (typeof site.socials)[number];
