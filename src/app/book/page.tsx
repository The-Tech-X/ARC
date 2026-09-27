import type { Metadata } from "next";
import { Suspense } from "react";
import BookForm, { BookIntro } from "./BookForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Four quick questions, sent to ARC on WhatsApp, then a twenty-minute call about what you're making.",
};

export default function BookPage() {
  return (
    <main className="bg-deep-black">
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-40 sm:px-12 sm:pt-48 lg:px-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <span className="block font-type text-sm text-bone/60 sm:text-base">
              Book a Call
            </span>
            <div className="mt-6">
              <BookIntro />
            </div>

            <ul className="mt-12 flex flex-col gap-3 border-t border-bone/10 pt-8">
              {[
                "You'll leave with an actual number, not a proposal next week.",
                "If it's not a fit, I'll say so on the call.",
                "No prep needed — the questions do that part.",
              ].map((line) => (
                <li
                  key={line}
                  className="font-body text-sm leading-relaxed text-bone/45"
                >
                  {line}
                </li>
              ))}
            </ul>

            <p className="mt-10 font-body text-xs text-bone/40">
              Rather just message?{" "}
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-bone/70 hover:text-bone"
              >
                WhatsApp {site.whatsappDisplay}
              </a>
            </p>
          </div>

          {/* The form reads ?plan= from the URL; Suspense keeps the rest of
              the page prerendered (Next's guidance for useSearchParams). */}
          <Suspense fallback={<div className="min-h-[520px] rounded-xl border border-bone/10 bg-charcoal" />}>
            <BookForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
