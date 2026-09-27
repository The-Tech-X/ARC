"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { EASE_OUT } from "@/lib/motion";
import { FAQ } from "@/content/faq";

/**
 * A real button/aria-expanded accordion, not a div that listens for clicks —
 * this is the one section on the page a keyboard or screen-reader user is
 * most likely to actually need to operate.
 *
 * The accent hairline that draws under an open question is the only motion
 * here, and it's interaction-tied: it exists because you opened the row.
 */
function FaqRow({ item, index }: { item: (typeof FAQ)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div className="border-b border-bone/10">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="group flex w-full items-start gap-6 py-6 text-left"
        >
          <span className="mt-1 font-body text-[10px] tabular-nums tracking-[0.2em] text-bone/30 transition-colors duration-300 group-hover:text-bone/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 font-body text-lg font-medium text-bone transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 sm:text-xl">
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className={`mt-1 shrink-0 text-bone/40 transition-[transform,color] duration-300 group-hover:text-bone ${
              open ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>
      </h3>

      {/* The hairline is the affordance: it draws in under the question you
          opened, and retracts when you close it. */}
      <motion.span
        aria-hidden="true"
        className="block h-px origin-left bg-signal"
        initial={false}
        animate={{ scaleX: open ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 pl-12 pt-5 font-body text-sm leading-relaxed text-bone/60">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="relative bg-charcoal py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading eyebrow="Questions">
            Before you <Highlight>ask</Highlight>.
          </SectionHeading>
        </div>

        <div className="border-t border-bone/10">
          {FAQ.map((item, index) => (
            <FaqRow key={item.q} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
