// The three retainer plans shown in the Pricing section.
//
// Supplied by the user on 2026-09-24, and it reverses an earlier decision:
// pricing used to be kept off the page entirely and scoped on the call. It is
// now public, so these are commitments — a visitor will quote them back.
//
// Prices are written exactly as the user gave them. Every plan still routes to
// /book: the call is where scope is confirmed, the plan just sets the frame.
// Each button opens /book?plan=<name>, which pre-selects the plan and writes
// it into the WhatsApp message the form prepares.

export type Plan = {
  name: string;
  /**
   * Omit for a plan that is scoped on the conversation (Custom): the card
   * shows `priceNote` instead of a figure. Changed 2026-09-27 at the user's
   * request — a custom plan needs a free hand and depends on the need, so a
   * "from" price only anchors it wrongly.
   */
  price?: string;
  cadence?: string;
  priceNote?: string;
  includes: string[];
  cta: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "ARC Foundation",
    price: "₹25K",
    cadence: "/ month",
    includes: [
      "5 Reels",
      "6 Posts",
      "Content calendar",
      "Content strategy",
      "Basic editing",
    ],
    cta: "Get started",
  },
  {
    name: "ARC Growth",
    price: "₹55K",
    cadence: "/ month",
    includes: [
      "10 Reels",
      "12 Carousels",
      "Content calendar",
      "Brand strategy",
      "1:1 assistance",
      "Performance review",
      // The source list said just "Management"; read as social media
      // management, the service the agency already offers. Confirm.
      "Social media management",
      "Meta Ads",
    ],
    cta: "Get started",
    featured: true,
  },
  {
    name: "ARC Custom",
    priceNote: "Tailored to your needs",
    includes: [
      "Strategy",
      "Campaigns",
      "Influencers",
      "Ads",
      "Media handling",
    ],
    cta: "Let's talk",
  },
];
