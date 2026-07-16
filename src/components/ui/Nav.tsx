"use client";

import { useEffect, useState } from "react";
import GoldText from "./GoldText";
import CTAButton from "./CTAButton";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-b border-ivory/10 bg-deep-black/70 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <a href="#hero" className="font-heading text-xl font-bold tracking-wide">
          <GoldText>ARC</GoldText>
        </a>
        <CTAButton href="#book-a-call">Book a Call</CTAButton>
      </div>
    </header>
  );
}
