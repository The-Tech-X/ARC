// ⚠️ REVIEW EVERY ANSWER BEFORE LAUNCH.
//
// These are written as confident defaults so the section reads as finished,
// but they are drafts, not confirmed policy. Several state how you operate —
// file ownership, how turnaround is agreed, revision rounds, which platforms
// you take on. A policy that doesn't match how you actually work is worse
// than no FAQ at all, because a visitor will hold you to it. Read each one
// and make it true, or delete it.
//
// Note what's deliberately absent: no promised turnaround time, no "limited
// slots" scarcity — that claim was never verified as true so it isn't used.
// Prices live in the Pricing section (src/content/pricing.ts), not here; the
// cost answer points at it rather than repeating numbers that could drift.

export type FaqItem = {
  q: string;
  a: string;
};

export const FAQ: FaqItem[] = [
  {
    q: "What does ARC actually do?",
    a: "Strategy, production and motion — the whole line. That means the content calendar, the scripts, the shoot, the edit, and getting it posted. You can take the whole thing or just the part you're missing.",
  },
  {
    q: "What does it cost?",
    a: "The plans above are the starting points — Foundation, Growth, or Custom for anything bigger. The call is where we confirm which one fits, or shape a Custom scope around what you actually need. You'll leave it with a clear number, not a proposal that arrives a week later.",
  },
  {
    q: "Do I have to be on camera?",
    a: "No. Plenty of the work is voiceover, screen capture, motion and archival cuts. If being on camera isn't your thing, that's a format constraint to design around, not a dealbreaker.",
  },
  {
    q: "I already have an editor. Why ARC?",
    a: "Then you probably don't need one. Where ARC helps is when the problem isn't the edit — it's that nobody owns the thread from idea to upload, so every handoff loses a little of the original point.",
  },
  {
    q: "Can you work from footage I shoot myself?",
    a: "Yes, and a lot of the best work starts that way. You film on your phone against a script written for exactly that, and the edit does the rest. It's faster than coordinating a shoot and it usually sounds more like you.",
  },
  {
    q: "How fast is turnaround?",
    a: "Agreed up front per batch and written into your calendar before anything starts. Committing to a date and holding it is more useful to you than an average that gets quoted and then missed.",
  },
  {
    q: "How many rounds of revisions do I get?",
    a: "Two rounds on any deliverable, which in practice is more than most projects use — the script stage catches the disagreements that would otherwise surface in the edit. A change of direction after approval is a new brief rather than a revision, and it gets scoped like one.",
  },
  {
    q: "Who owns the files?",
    a: "You do. Raw footage, project files and exports, handed over at the end of the engagement. You shouldn't have to come back to me to reuse something you paid for.",
  },
  {
    q: "Which platforms do you work with?",
    a: "Vertical-first: Instagram, TikTok and YouTube Shorts, plus long-form YouTube and LinkedIn where the audience is actually there. The format follows where your people already are, not the other way round.",
  },
];
