import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Film from "@/components/sections/Film";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Founder from "@/components/sections/Founder";
import Testimonials from "@/components/sections/Testimonials";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Faq from "@/components/sections/Faq";

/**
 * Attention → Retention → Conversion. The acronym is the page's structure,
 * not just the logo's backstory.
 *
 * There is no stat strip under the Hero any more: the three numbers it
 * carried were invented, and the site proves by showing craft instead.
 * Hero, About and Film all sit on deep-black and must never gain a border
 * between them — that combination produced a visible seam once already.
 */
export default function Home() {
  return (
    <main>
      {/* Attention */}
      <Hero />

      {/* Retention */}
      <About />
      <Film />
      <Services />
      <Work />
      <Founder />
      <Testimonials />

      {/* Conversion */}
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Faq />
    </main>
  );
}
