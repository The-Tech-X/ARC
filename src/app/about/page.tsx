import type { Metadata } from "next";
import Highlight from "@/components/ui/Highlight";
import CTAButton from "@/components/ui/CTAButton";
import Reveal from "@/components/ui/Reveal";
import FilmFrame from "@/components/ui/FilmFrame";
import { founder, site } from "@/content/site";
import { ABOUT_INTRO, ARC_WHY } from "@/content/about";
import { PILLARS } from "@/content/pillars";

export const metadata: Metadata = {
  title: "About",
  description:
    "ARC is a creative agency helping brands build, grow, and elevate their presence through content and social media — strategy, storytelling, design, and motion.",
};

export default function AboutPage() {
  return (
    <main className="bg-deep-black">
      {/* What ARC is. */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-40 sm:px-12 sm:pb-36 sm:pt-48 lg:px-20">
        <Reveal>
          <span className="block font-type text-sm text-bone/60 sm:text-base">
            About {site.name}
          </span>
        </Reveal>

        <Reveal variant="rackFocus" delay={0.1}>
          <h1 className="mt-6 max-w-4xl font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-7xl lg:text-8xl">
            Stories that <Highlight>move</Highlight> brands.
          </h1>
        </Reveal>

        <div className="mt-14 flex max-w-2xl flex-col gap-6 lg:ml-auto lg:mt-20">
          {ABOUT_INTRO.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 32)} delay={0.15 + index * 0.06}>
              <p
                className={
                  index === ABOUT_INTRO.length - 1
                    ? "font-body text-xl font-medium leading-snug text-bone sm:text-2xl"
                    : "font-body text-base leading-relaxed text-bone/60 sm:text-lg"
                }
              >
                {paragraph}
              </p>
            </Reveal>
          ))}

          <Reveal delay={0.4}>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-xs uppercase tracking-[0.35em] text-bone/40">
              {site.acronym.map((word) => (
                <span key={word}>{word}.</span>
              ))}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The philosophy. The whys sit under the stage of the arc each one
          answers, so the acronym is the structure of the list, not a slogan
          repeated over it. */}
      <section className="bg-charcoal py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
          <Reveal variant="rackFocus">
            <h2 className="max-w-3xl font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-7xl">
              Every brand has an <Highlight>ARC</Highlight>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-bone/60">
              {ARC_WHY.lede}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-20 sm:mt-24">
            <p className="font-body text-2xl font-medium text-bone sm:text-3xl">
              {ARC_WHY.intro}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 border-t border-bone/10 sm:grid-cols-3">
            {ARC_WHY.stages.map((item, index) => (
              <Reveal
                key={item.stage}
                delay={index * 0.08}
                className="border-b border-bone/10 py-8 sm:border-b-0 sm:py-10 sm:pr-8"
              >
                <span className="block font-body text-[11px] uppercase tracking-[0.3em] text-bone/40">
                  {item.stage}
                </span>
                <div className="mt-5 flex flex-col gap-2">
                  {item.whys.map((why) => (
                    <p key={why} className="text-balance font-body text-xl leading-snug text-bone/85 sm:text-2xl">
                      {why}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="rackFocus" className="mt-20 sm:mt-24">
            <p className="font-heading text-3xl font-bold text-bone sm:text-5xl">
              {ARC_WHY.close}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The founder. */}
      <section className="mx-auto max-w-6xl px-6 py-28 sm:px-12 sm:py-36 lg:px-20">
        <Reveal>
          <span className="block font-type text-sm text-bone/60 sm:text-base">
            The Founder
          </span>
        </Reveal>
        <Reveal variant="rackFocus" delay={0.1}>
          <h2 className="mt-6 font-heading text-5xl font-extrabold uppercase leading-[0.95] text-bone sm:text-7xl">
            Behind <Highlight>ARC</Highlight>.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal variant="rackFocus" className="lg:sticky lg:top-32 lg:self-start">
            <FilmFrame timecode="00:01:22:11" />
            <p className="mt-6 font-heading text-lg font-bold text-bone">
              {founder.name}
            </p>
            <p className="mt-2 font-body text-xs uppercase tracking-[0.25em] text-bone/40">
              {founder.role}
            </p>
          </Reveal>

          <div className="flex flex-col gap-8">
            {founder.long.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 32)} delay={index * 0.05}>
                <p
                  className={
                    index === 0 || index === founder.long.length - 1
                      ? "font-body text-2xl font-medium leading-snug text-bone sm:text-3xl"
                      : "font-body text-base leading-relaxed text-bone/60"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6 sm:px-12 lg:px-20">
          <Reveal>
            <span className="block font-type text-sm text-bone/60 sm:text-base">
              What that looks like
            </span>
          </Reveal>
          <Reveal variant="rackFocus" delay={0.08}>
            <h2 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold uppercase leading-[0.95] text-bone sm:text-6xl">
              Three parts of one <Highlight>job</Highlight>.
            </h2>
          </Reveal>

          <div className="mt-16 flex flex-col">
            {PILLARS.map((pillar, index) => (
              <Reveal
                key={pillar.index}
                delay={index * 0.06}
                className="grid grid-cols-1 gap-4 border-t border-bone/10 py-10 sm:grid-cols-[auto_1fr] sm:gap-12"
              >
                <span className="font-body text-[11px] tabular-nums tracking-[0.25em] text-bone/30">
                  {pillar.index}
                </span>
                <div className="max-w-2xl">
                  <h3 className="font-heading text-xl font-bold text-bone sm:text-2xl">
                    {pillar.name}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-relaxed text-bone/55">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-deep-black py-28 text-center sm:py-36">
        <div className="mx-auto max-w-3xl px-6 sm:px-12">
          <Reveal variant="rackFocus">
            <h2 className="font-heading text-4xl font-extrabold uppercase leading-[0.95] text-bone sm:text-6xl">
              Still reading? Let&apos;s <Highlight>talk</Highlight>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex justify-center">
              <CTAButton href="/book" size="lg" magnetic>
                Book a Call
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
