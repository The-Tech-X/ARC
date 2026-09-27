"use client";

import { motion } from "framer-motion";
import Highlight from "@/components/ui/Highlight";
import Mosaic from "@/components/ui/Mosaic";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { REVIEWS, type Review } from "@/content/testimonials";

/**
 * Real client reviews of Samuel's freelance work (2026-09-27, replacing the
 * rack-focus column of fabricated quotes). Deliberately plain: the words are
 * the proof, so the design gets out of their way.
 *
 * One featured review set large on a patch of dot-mosaic, then the rest as a
 * masonry of cards, each with its rating, the verbatim quote, and the
 * reviewer's handle and country. Stars are bone, not the accent: eight rows
 * of orange stars would spend the accent on decoration.
 *
 * The line under the heading says whose work these are. It must: ARC has
 * not had clients yet, and these must never read as ARC client reviews.
 */

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    // Micro: the stars fill in one after another the first time the review
    // scrolls into view (a one-time entrance), then hold.
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden
          className={i < rating ? "fill-bone" : "fill-bone/20"}
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 420, damping: 18 }}
        >
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </motion.svg>
      ))}
    </span>
  );
}

function Byline({ review }: { review: Review }) {
  return (
    <p className="font-body text-xs tracking-[0.18em] text-bone/55">
      <span className="text-bone/85">{review.handle}</span>
      <span aria-hidden> · </span>
      {review.country}
    </p>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <figure className="mb-5 break-inside-avoid rounded-2xl border border-bone/10 bg-charcoal/60 p-7 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-bone/20">
      <Stars rating={review.rating} />
      <blockquote className="mt-5 font-body text-[15px] leading-relaxed text-bone/80">“{review.quote}”</blockquote>
      <figcaption className="mt-6 border-t border-bone/10 pt-4">
        <Byline review={review} />
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const featured = REVIEWS.find((r) => r.featured) ?? REVIEWS[0];
  const rest = REVIEWS.filter((r) => r !== featured);

  return (
    <section id="testimonials" className="relative overflow-hidden bg-deep-black py-28 sm:py-36">
      {/* Dot-mosaic behind the featured quote only; it fades before the cards. */}
      <Mosaic variant="dots" seed={5} fade="radial-gradient(ellipse 60% 38% at 70% 30%, black 20%, transparent 80%)" />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
        <SectionHeading eyebrow="Client reviews">
          Said better by <Highlight>them</Highlight>.
        </SectionHeading>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-bone/55">
          Unedited reviews from clients of Samuel&apos;s freelance editing work, across the US, the UK, Singapore and
          India.
        </p>

        <Reveal className="mt-16 sm:mt-20">
          <figure className="max-w-4xl">
            <Stars rating={featured.rating} size={16} />
            <blockquote className="mt-6 text-balance font-body text-xl font-medium leading-snug text-bone sm:text-2xl lg:text-[1.9rem]">
              “{featured.quote}”
            </blockquote>
            <figcaption className="mt-8">
              <Byline review={featured} />
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-20 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {rest.map((review, i) => (
            <Reveal key={review.id} delay={(i % 3) * 0.06}>
              <Card review={review} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
