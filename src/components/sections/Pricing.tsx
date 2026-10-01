"use client";

import Link from "next/link";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import CTAButton from "@/components/ui/CTAButton";
import { PLANS, type Plan } from "@/content/pricing";
import Halftone from "@/components/ui/Halftone";

/**
 * Three plans, one of them lit. Pricing is the page's light "cut": a bone
 * section between dark ones, so the page has tempo (Signal system,
 * 2026-09-27). The featured plan is the only dark panel and the only Signal
 * button — the accent means "this is the action", so it goes on the one action
 * the section recommends. The other two plans get an ink outline: still
 * clearly a button, never competing with it.
 *
 * What's included is set as a hairline-ruled list, the same fine-print
 * register the old WhyArc section used, rather than a column of checkmark icons. Prices stay
 * ink: the headline's one highlighted word and the featured CTA are the
 * section's whole accent budget. On bone the highlight takes `light`, the
 * deeper accent, because the plain one doesn't hold contrast there.
 */

function PlanCard({ plan }: { plan: Plan }) {
  const { featured } = plan;

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl p-8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 sm:p-10 lg:p-8 xl:p-10 ${
        featured
          ? "bg-deep-black text-bone shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]"
          : "border border-deep-black/15 text-deep-black"
      }`}
    >
      {/* Sits on the card's top edge rather than beside the name, so it
          never competes with the plan name for width at narrow columns. */}
      {featured && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-deep-black px-4 py-1.5 font-body text-[11px] uppercase tracking-[0.2em] text-bone/80">
          Most popular
        </span>
      )}

      <h3 className={`whitespace-nowrap font-body text-xs uppercase tracking-[0.3em] ${featured ? "text-bone/60" : "text-deep-black/60"}`}>
        {plan.name}
      </h3>

      {plan.price ? (
      <p className="mt-8 flex items-baseline gap-2">
        <span className="font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
          {plan.price}
        </span>
        <span className={`whitespace-nowrap font-body text-sm ${featured ? "text-bone/50" : "text-deep-black/55"}`}>{plan.cadence}</span>
      </p>
      ) : (
        // No figure for a plan scoped on the call — the note sits at the
        // price's height so the three cards' lists still line up.
        <p className="mt-8 flex min-h-[3rem] items-end font-heading text-3xl font-bold uppercase leading-none sm:min-h-[3.75rem] sm:text-4xl lg:min-h-[3rem] lg:text-3xl xl:min-h-[3.75rem] xl:text-4xl">
          {plan.priceNote}
        </p>
      )}

      <ul className={`mt-10 flex-1 border-t ${featured ? "border-bone/10" : "border-deep-black/10"}`}>
        {plan.includes.map((item) => (
          <li
            key={item}
            className={`border-b py-3.5 font-body text-sm ${
              featured ? "border-bone/10 text-bone/85" : "border-deep-black/10 text-deep-black/75"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {featured ? (
          <CTAButton
            href={`/book?plan=${encodeURIComponent(plan.name)}`}
            size="lg"
            wrapperClassName="block"
            className="w-full justify-center"
          >
            {plan.cta}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </CTAButton>
        ) : (
          <Link
            href={`/book?plan=${encodeURIComponent(plan.name)}`}
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-deep-black/25 px-8 py-4 font-body text-base font-semibold text-deep-black transition-[color,background-color,border-color,transform] duration-300 hover:border-deep-black hover:bg-deep-black hover:text-bone active:scale-[0.97]"
          >
            {plan.cta}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-bone py-28 text-deep-black sm:py-36">
      {/* Ink halftone on bone, top-right, clear of the plans. */}
      <Halftone soft tone="light" seed={6} spots={[{ x: 88, y: 8, rx: 40, ry: 30 }]} />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <SectionHeading eyebrow="Pricing" tone="light">
          Pick a <Highlight light>pace</Highlight>.
        </SectionHeading>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {PLANS.map((plan, index) => (
            <Reveal
              key={plan.name}
              delay={index * 0.08}
              className={plan.featured ? "lg:-my-4" : ""}
            >
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
