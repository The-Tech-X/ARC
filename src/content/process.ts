// The four steps shown on the How It Works timeline.
//
// `mark` is the timecode label on the track — it's editing-suite chrome, a
// visual device for reading position along the timeline. It is deliberately
// NOT a promised duration. Do not turn these into "3 days / 1 week" claims
// unless those are commitments actually being made.

export type Step = {
  mark: string;
  title: string;
  body: string;
};

export const PROCESS: Step[] = [
  {
    mark: "00:00",
    title: "Discovery Call",
    body: "Twenty minutes. What you make, who it's for, and the exact point where it stalls. You leave knowing whether this is a fit — from either side.",
  },
  {
    mark: "01:00",
    title: "Strategy & Script",
    body: "A calendar you can actually see, and scripts written in your voice. Not a template with your name dropped into it.",
  },
  {
    mark: "02:00",
    title: "Production",
    body: "Shoot day, run end to end. Or you send raw footage from your phone — both work, and neither changes what comes back.",
  },
  {
    mark: "03:00",
    title: "Post & Iterate",
    body: "Edit, publish, then read what actually happened and let it decide the next batch. The system gets sharper every cycle.",
  },
];
