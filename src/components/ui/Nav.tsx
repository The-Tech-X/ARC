"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Wordmark from "./Wordmark";
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
          ? "border-b border-bone/10 bg-deep-black/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        {/* Still deliberately no link menu — the visitor gets one way out of
            the page and it's the CTA. About and legal live in the footer,
            reached once they've been convinced rather than before. */}
        {/* The real mark, not "ARC" set in Satoshi — this is the one place on
            the page that has to be the logo itself. See src/lib/wordmark.ts. */}
        <Link href="/" className="block transition-opacity duration-300 hover:opacity-70">
          <Wordmark title="ARC — home" className="h-5 w-auto sm:h-6" />
        </Link>
        <CTAButton href="/book">Book a Call</CTAButton>
      </div>
    </header>
  );
}
