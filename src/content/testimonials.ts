// Real client reviews, supplied by the user on 2026-09-27 as screenshots of
// Samuel's freelance marketplace profile. They replaced three fabricated
// sample quotes.
//
// Rules — read before editing:
// - Quotes are VERBATIM, including the clients' own casing and phrasing.
//   Never "tidy" a client's words; if a review needs correcting to read well,
//   leave it out instead (one second review from tester1337 was left out for
//   that reason — the same client's first review is here).
// - These are reviews of SAMUEL's freelance work, not of ARC (which has not
//   had clients yet — see AGENTS.md → Proof position). The section says so.
//   Never relabel them as ARC client reviews.
// - Attribution is the reviewer's public handle and country, as shown on the
//   platform. No invented full names, photos or job titles.
// - Ratings are shown as given, including the one 4.0 — an all-5.0 wall
//   reads as curated; the honest one makes the rest believable.
// - No dates: "4 months ago" goes stale on a website.
//
// `featured` is the single quote set large at the top of the section.

export type Review = {
  id: string;
  quote: string;
  handle: string;
  country: string;
  rating: number;
  featured?: true;
};

export const REVIEWS: Review[] = [
  {
    id: "kayloxcorp",
    quote:
      "Samuel is awesome at video editing. He has a great eye for what makes a video stand out, strong style, and a real skill for short-form content. He takes direction well, thinks independently, and genuinely cares about the quality of his work. You can tell he enjoys what he does. He’s also a great person to work with. I’m really glad we connected and I’m excited to keep building our partnership together.",
    handle: "kayloxcorp",
    country: "United States",
    rating: 5,
    featured: true,
  },
  {
    id: "norah_uk",
    quote:
      "Samuel was responsive, communicated clearly, and delivered exactly what was agreed. He created a full YouTube video, a trailer, and Instagram reels from the raw footage I provided, and he did a great job working with the material. The edits were smooth, well-paced, and aligned with the brief. Overall, a professional and reliable experience. Would happily work with him again.",
    handle: "norah_uk",
    country: "United Kingdom",
    rating: 4,
  },
  {
    id: "amandaezra",
    quote: "Samuel killed it! I will be using him for all of my future video projects!",
    handle: "amandaezra",
    country: "United States",
    rating: 5,
  },
  {
    id: "hastie1976",
    quote:
      "Exceptional work, lots of correcting revisions free of charge and went above and beyond to produce quality film editing on stop motion graphics for us. We will be using again.",
    handle: "hastie1976",
    country: "United Kingdom",
    rating: 5,
  },
  {
    id: "ashleyaishx",
    quote:
      "samuel communicates really fast and delivers fast with a deep understanding of the needs of the project. will be engaging him to do many more projects as he is very very talented. good job samuel.",
    handle: "ashleyaishx",
    country: "Singapore",
    rating: 5,
  },
  {
    id: "tester1337",
    quote:
      "Excellent video editing work! The seller was professional, patient, and clearly understood my requirements. The edits were clean, well-timed, and enhanced the overall quality of my video. Communication was smooth throughout, revisions were handled promptly, and the final output exceeded my expectations. I’m very happy with the result and would definitely recommend this editor to anyone looking for reliable and high-quality video editing services. Will be coming back for future projects!",
    handle: "tester1337",
    country: "India",
    rating: 5,
  },
  {
    id: "walter826",
    quote: "He understood the assignment. He asked questions and was responsive.",
    handle: "walter826",
    country: "United States",
    rating: 5,
  },
  {
    id: "jovahnsimmons",
    quote: "This editor did a great job! I would definitely recommend him if you’re looking for a talented editor. 👍",
    handle: "jovahnsimmons",
    country: "United States",
    rating: 5,
  },
];
