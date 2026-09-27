"use client";

import Link from "next/link";
import Highlight from "@/components/ui/Highlight";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import FilmFrame from "@/components/ui/FilmFrame";
import { founder } from "@/content/site";
import Mosaic from "@/components/ui/Mosaic";

export default function Founder() {
  return (
    <section id="founder" className="relative overflow-hidden bg-charcoal py-28 sm:py-36">
      {/* Dot-mosaic behind the portrait frame: texture the frame sits on. */}
      <Mosaic variant="dots" seed={4} fade="radial-gradient(ellipse 40% 55% at 25% 62%, black 20%, transparent 80%)" />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <SectionHeading eyebrow="The Founder">
          Behind <Highlight>ARC</Highlight>.
        </SectionHeading>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal variant="rackFocus">
            <FilmFrame />
          </Reveal>

          <div>
            <Reveal>
              <p className="font-body text-2xl font-medium leading-snug text-bone sm:text-3xl">
                {founder.short}
              </p>
            </Reveal>

            {/* The record, kept deliberately bare: number, label, nothing
                else. Accent is allowed here because these are the page's proof
                numbers — the one kind of figure the accent allow-list names. */}
            <Reveal delay={0.08} className="mt-12">
              <dl className="grid grid-cols-3 gap-6 border-t border-bone/10 pt-8">
                {founder.record.map((item) => (
                  // Label first in the DOM (dt before dd, so it reads "Brands:
                  // 10+"), number first on screen. `justify-end` is the *top* in a
                  // reversed column — without it a two-line label pushes its
                  // number above the others.
                  <div key={item.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-2 font-body text-[11px] uppercase leading-snug tracking-[0.2em] text-bone/45">
                      {item.label}
                    </dt>
                    <dd className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                      <Highlight plain>{item.value}</Highlight>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.12} className="mt-10">
              {/* No flourish under the name. There was a drawn accent
                  signature-style stroke here; it read as decoration rather
                  than as a signature and the user cut it on 2026-09-05.
                  Don't reintroduce a rule, underline or squiggle here — if a
                  real scanned signature ever exists, that's a different
                  thing and can go in as an image. */}
              <p className="font-heading text-lg font-bold text-bone">
                {founder.name}
              </p>

              <p className="mt-3 font-body text-xs uppercase tracking-[0.25em] text-bone/40">
                {founder.role}
              </p>

              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 font-body text-sm text-bone/70 transition-colors duration-300 hover:text-bone"
              >
                Read the full story
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
