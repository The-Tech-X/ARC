import type { Metadata } from "next";
import Link from "next/link";
import Highlight from "@/components/ui/Highlight";
import CTAButton from "@/components/ui/CTAButton";
import Mosaic from "@/components/ui/Mosaic";

export const metadata: Metadata = {
  title: "Not Found",
};

const SLATE = [
  { label: "Roll", value: "—" },
  { label: "Scene", value: "404" },
  { label: "Take", value: "01" },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep-black px-6 py-40">
      <Mosaic variant="tiles" />
      <div className="relative w-full max-w-lg">
        {/* A slate, because that's what you're holding when a take doesn't
            get used. Static — a 404 is not the place for a performance. */}
        <div className="rounded-sm border border-bone/15 bg-charcoal">
          <div
            aria-hidden="true"
            className="flex h-8 overflow-hidden rounded-t-sm"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className={`flex-1 ${index % 2 === 0 ? "bg-bone/80" : "bg-deep-black"}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 divide-x divide-bone/10 border-b border-bone/10">
            {SLATE.map((field) => (
              <div key={field.label} className="px-4 py-3">
                <p className="font-body text-[9px] uppercase tracking-[0.25em] text-bone/35">
                  {field.label}
                </p>
                <p className="mt-1 font-heading text-lg font-bold tabular-nums text-bone">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <div className="px-6 py-10">
            <h1 className="font-heading text-3xl font-extrabold uppercase leading-[0.95] text-bone sm:text-4xl">
              This cut didn&apos;t make the{" "}
              <Highlight>final edit</Highlight>.
            </h1>
            <p className="mt-4 font-body text-sm leading-relaxed text-bone/50">
              That page isn&apos;t here — moved, renamed, or never shot.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <CTAButton href="/">Back to the start</CTAButton>
              <Link
                href="/book"
                className="font-body text-sm text-bone/50 transition-colors duration-300 hover:text-bone"
              >
                Book a call instead →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
