import type { Metadata, Viewport } from "next";
import { Archivo, Special_Elite } from "next/font/google";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import IntroProvider from "@/components/providers/IntroProvider";
import { INTRO_SESSION_KEY } from "@/lib/intro";
import { site } from "@/content/site";
import "./globals.css";

// One family for everything: condensed (`font-stretch: 62%`, set in
// globals.css) for display, normal width for reading. The `wdth` axis is what
// makes that possible, so it must stay in `axes`. next/font self-hosts both
// faces at build time — no third-party request at runtime.
const archivo = Archivo({
  variable: "--font-archivo",
  axes: ["wdth"],
  subsets: ["latin"],
  display: "swap",
});

// The typewriter: the one highlighted word per headline, and the section
// labels. One weight only; the Highlight component thickens it slightly.
const specialElite = Special_Elite({
  variable: "--font-special-elite",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "ARC is a creative agency helping brands build, grow, and elevate their presence through content and social media — strategy, storytelling, design, and motion that gets attention and gets remembered.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ARC Media — Stories That Move Brands",
    template: "%s — ARC Media",
  },
  description,
  openGraph: {
    type: "website",
    siteName: site.legalName,
    title: "ARC Media — Stories That Move Brands",
    description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC Media — Stories That Move Brands",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
};

/**
 * Runs before first paint so the intro overlay is hidden immediately on a
 * repeat visit or under reduced motion. Without it, React can't decide
 * whether to show the loader until after hydration, which means a flash of
 * black on every navigation back to a page that has already played it.
 *
 * The once-per-session rule is PRODUCTION ONLY. `sessionStorage` survives
 * reloads for the whole life of a tab, so in development the intro would
 * play once and then never again in that tab — you cannot work on a loader
 * you cannot see. In dev only reduced motion suppresses it.
 *
 * Consequence worth knowing: the skip path can't be exercised with
 * `next dev`. To check it, run a production build.
 */
const skipOnRepeatVisit = process.env.NODE_ENV === "production";

const introSkipScript = `try{if(${
  skipOnRepeatVisit
    ? `sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})==="1"||`
    : ""
}matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.introSkip="1"}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${specialElite.variable} h-full antialiased`}
      // The inline script below sets `data-intro-skip` on this element
      // before React hydrates, so the client DOM legitimately has an
      // attribute the server HTML didn't. Without this, React reports a
      // hydration mismatch. Same pattern (and same reason) as a theme
      // script. It only suppresses this element's own attributes — it does
      // not extend to any children.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introSkipScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <IntroProvider>
          <CustomCursor />
          <Nav />
          {children}
          <Footer />
        </IntroProvider>
      </body>
    </html>
  );
}
