import type { ReactNode } from "react";

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

/**
 * Shared shell for /privacy and /terms. Deliberately plain — legal pages
 * should be quiet and readable, and none of the page's motion language
 * belongs here.
 */
export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="bg-deep-black">
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-40 sm:px-12 sm:pt-48">
        <h1 className="font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 font-body text-xs uppercase tracking-[0.25em] text-bone/35">
          Last updated {updated}
        </p>

        {/* Visible on purpose. This document has not been reviewed by anyone
            qualified, and shipping it silently as if it had would be worse
            than shipping nothing. Delete this banner once it's been read by
            someone who can vouch for it. */}
        <div className="mt-10 rounded-lg border border-bone/15 bg-charcoal p-5">
          <p className="font-body text-xs leading-relaxed text-bone/50">
            <span className="font-semibold text-bone/70">Draft — needs review.</span>{" "}
            This is a starting point written to be readable and honest, not
            legal advice. Have someone qualified check it against how you
            actually operate and the law where you operate before launch, then
            remove this notice.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-12">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-lg font-bold text-bone sm:text-xl">
                {section.heading}
              </h2>
              <div className="mt-4 flex flex-col gap-4 font-body text-sm leading-relaxed text-bone/55">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
