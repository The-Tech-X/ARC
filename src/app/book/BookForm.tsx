"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import { EASE_OUT } from "@/lib/motion";
import { whatsappLink } from "@/lib/whatsapp";
import { site } from "@/content/site";
import { PLANS, type Plan } from "@/content/pricing";

/**
 * A short qualifier rather than a bare scheduler embed. It does two jobs:
 * the call starts with context instead of twenty minutes of discovery, and
 * answering four small questions is a lower wall than facing one form with
 * nine fields.
 *
 * Progress is drawn as a filling arc — the brand mark doing something
 * useful, and it's interaction-tied: it advances because you answered, not
 * on a timer.
 *
 * Delivery (2026-09-27): the last step opens WhatsApp to ARC's number with
 * every answer written out as a ready-to-send message — the visitor only
 * presses send. This replaced a POST to an /api/book route (now deleted), which only logged the
 * enquiry and delivered it nowhere. A plan chosen on the Pricing section
 * arrives as `?plan=<name>` and is written into the message too.
 */

type Step =
  | { id: string; kind: "single" | "multi"; question: string; hint?: string; options: string[] }
  | { id: string; kind: "contact"; question: string; hint?: string };

const STEPS: Step[] = [
  {
    id: "who",
    kind: "single",
    question: "Who's this for?",
    options: ["A personal brand", "A founder-led business", "A company brand", "Still figuring it out"],
  },
  {
    id: "make",
    kind: "multi",
    question: "What do you want to make?",
    hint: "Pick as many as apply.",
    options: [
      "Short-form video",
      "Long-form YouTube",
      "Podcast + clips",
      "Brand or product films",
      "Not sure yet",
    ],
  },
  {
    id: "stuck",
    kind: "single",
    question: "Where does it break down?",
    options: [
      "No time to actually make it",
      "Never know what to post",
      "It gets made, it doesn't land",
      "Quality is all over the place",
      "Honestly, all of it",
    ],
  },
  {
    id: "contact",
    kind: "contact",
    question: "Who's this from?",
    hint: "Last one. We'll reply on WhatsApp.",
  },
];

/** The enquiry as a WhatsApp message: short labelled lines, empty ones dropped. */
function composeMessage(
  plan: Plan | undefined,
  answers: Record<string, string | string[]>,
  contact: { name: string; email: string; link: string; note: string },
) {
  const join = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");
  const planLine = plan
    ? `${plan.name} (${plan.price ? `${plan.price} ${plan.cadence ?? ""}`.trim() : "custom, let's talk scope"})`
    : "";
  const lines: [string, string][] = [
    ["Plan", planLine],
    ["Who it's for", join(answers.who)],
    ["What I want to make", join(answers.make)],
    ["Where it breaks down", join(answers.stuck)],
  ];
  const about: [string, string][] = [
    ["Name", contact.name.trim()],
    ["Email", contact.email.trim()],
    ["My work", contact.link.trim()],
    ["Also", contact.note.trim()],
  ];
  const block = (rows: [string, string][]) =>
    rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  return [
    "Hi ARC! I'd like to book a discovery call.",
    block(lines),
    block(about),
  ]
    .filter(Boolean)
    .join("\n\n");
}

const ARC_PATH = "M 12 100 A 88 88 0 0 1 188 100";

function ProgressArc({ value }: { value: number }) {
  return (
    <div className="relative w-40 shrink-0">
      <svg viewBox="0 0 200 112" className="w-full" fill="none">
        <path d={ARC_PATH} stroke="rgba(243,240,234,0.12)" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="book-arc-light" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="112">
            <stop offset="0%" stopColor="#ff8a5c" />
            <stop offset="100%" stopColor="#e63e12" />
          </linearGradient>
        </defs>
        <motion.path
          d={ARC_PATH}
          stroke="url(#book-arc-light)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: value }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        />
      </svg>
      <span className="absolute inset-x-0 bottom-0 text-center font-body text-[11px] tabular-nums tracking-[0.2em] text-bone/40">
        {String(Math.round(value * STEPS.length)).padStart(2, "0")} /{" "}
        {String(STEPS.length).padStart(2, "0")}
      </span>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-lg border px-5 py-4 text-left font-body text-sm transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.99] ${
        selected
          ? "border-signal/50 bg-signal/10 text-bone"
          : "border-bone/10 bg-deep-black/40 text-bone/60 hover:border-bone/25 hover:text-bone"
      }`}
    >
      {label}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-bone/10 bg-deep-black/40 px-4 py-3 font-body text-sm text-bone outline-none transition-colors duration-200 placeholder:text-bone/25 focus:border-signal/50";

export default function BookForm() {
  const params = useSearchParams();
  const initialPlan = PLANS.find((p) => p.name === params.get("plan"));
  const [plan, setPlan] = useState<Plan | undefined>(initialPlan);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [contact, setContact] = useState({ name: "", email: "", link: "", note: "" });
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const step = STEPS[index];
  const message = composeMessage(plan, answers, contact);
  const href = whatsappLink(message);

  const canAdvance = useMemo(() => {
    if (step.kind === "contact") {
      // Name is enough — they're reachable on the WhatsApp they send from.
      // Email is optional, but if given it should look like one.
      const email = contact.email.trim();
      return contact.name.trim().length > 0 && (email === "" || /\S+@\S+\.\S+/.test(email));
    }
    const value = answers[step.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }, [step, answers, contact]);

  function select(stepId: string, option: string, multi: boolean) {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [stepId]: option };
      const current = Array.isArray(prev[stepId]) ? (prev[stepId] as string[]) : [];
      return {
        ...prev,
        [stepId]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  }

  // Opens WhatsApp in a new tab (the app, on a phone) from the click itself,
  // so it isn't treated as a popup. The success screen keeps a link in case
  // it was blocked or closed.
  function submit() {
    window.open(href, "_blank", "noopener,noreferrer");
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="rounded-xl border border-bone/10 bg-charcoal p-8 sm:p-10"
      >
        <h2 className="font-heading text-3xl font-extrabold uppercase leading-[0.95] text-bone sm:text-4xl">
          Ready to send, {contact.name.split(" ")[0]}.
        </h2>
        <p className="mt-4 font-body text-sm leading-relaxed text-bone/60">
          WhatsApp has opened with your message written out. Just press send and
          we&apos;ll reply there to lock in a time.
        </p>

        {/* The message, exactly as sent, so nothing is a surprise. */}
        <pre className="mt-6 whitespace-pre-wrap rounded-lg border border-bone/10 bg-deep-black/50 p-5 font-body text-[13px] leading-relaxed text-bone/75">
          {message}
        </pre>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-signal px-7 py-3 font-body text-sm font-semibold text-deep-black transition-[background-color,transform] duration-300 hover:bg-[#ff6a40] active:scale-[0.97]"
        >
          Didn&apos;t open? Open WhatsApp
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
        <p className="mt-4 font-body text-xs text-bone/35">
          Or message {site.whatsappDisplay} directly.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-bone/10 bg-charcoal p-6 sm:p-10">
      {plan && (
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full border border-signal/40 px-3 py-1 font-body text-[11px] uppercase tracking-[0.2em] text-bone/80">
            Plan · {plan.name.replace(/^ARC /, "")}
          </span>
          <button
            type="button"
            onClick={() => setPlan(undefined)}
            className="font-body text-xs text-bone/40 transition-colors hover:text-bone"
          >
            Change
          </button>
        </div>
      )}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-bone/35">
            Step {index + 1}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-bone sm:text-3xl">
            {step.question}
          </h2>
          {step.hint && (
            <p className="mt-2 font-body text-xs text-bone/40">{step.hint}</p>
          )}
        </div>
        {/* index + 1: on the first question this read "00 / 04" against an
            empty arc, which looks like nothing has started rather than like
            you're one question in. The arc completes as you answer the last
            one, which is the point at which there's nothing left to do. */}
        <ProgressArc value={(index + 1) / STEPS.length} />
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {step.kind === "contact" ? (
              <div className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="book-name">
                  Your name
                </label>
                <input
                  id="book-name"
                  className={inputClass}
                  placeholder="Your name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                />

                <label className="sr-only" htmlFor="book-email">
                  Email (optional)
                </label>
                <input
                  id="book-email"
                  type="email"
                  className={inputClass}
                  placeholder="Email (optional)"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />

                <label className="sr-only" htmlFor="book-link">
                  A link to your work
                </label>
                <input
                  id="book-link"
                  className={inputClass}
                  placeholder="A link to your work (optional)"
                  value={contact.link}
                  onChange={(e) => setContact({ ...contact, link: e.target.value })}
                />

                <label className="sr-only" htmlFor="book-note">
                  Anything else
                </label>
                <textarea
                  id="book-note"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Anything else worth knowing? (optional)"
                  value={contact.note}
                  onChange={(e) => setContact({ ...contact, note: e.target.value })}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {step.options.map((option) => {
                  const value = answers[step.id];
                  const selected = Array.isArray(value)
                    ? value.includes(option)
                    : value === option;
                  return (
                    <OptionButton
                      key={option}
                      label={option}
                      selected={selected}
                      onClick={() => select(step.id, option, step.kind === "multi")}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>


      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="font-body text-sm text-bone/40 transition-colors duration-200 enabled:hover:text-bone disabled:opacity-0"
        >
          ← Back
        </button>

        <button
          type="button"
          disabled={!canAdvance}
          onClick={() => {
            if (index === STEPS.length - 1) {
              submit();
            } else {
              setIndex((i) => i + 1);
            }
          }}
          className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-signal px-7 py-3 font-body text-sm font-semibold text-deep-black transition-[background-color,box-shadow,transform] duration-300 enabled:hover:bg-[#ff6a40] enabled:hover:shadow-[0_0_40px_rgba(255,77,31,0.45)] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {index === STEPS.length - 1 ? "Send on WhatsApp" : "Next"}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-enabled:group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}

export function BookIntro() {
  return (
    <>
      <h1 className="font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-6xl lg:text-7xl">
        Twenty minutes.
        <br />
        No <Highlight>pitch deck</Highlight>.
      </h1>
      <p className="mt-8 max-w-md font-body text-base leading-relaxed text-bone/55">
        Four quick questions, then WhatsApp opens with your answers written
        out, ready to send. We reply there, and the call starts with context
        instead of introductions.
      </p>
    </>
  );
}
