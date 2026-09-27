"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { MotionConfig } from "framer-motion";
import Loader from "@/components/ui/Loader";
import { INTRO_SESSION_KEY } from "@/lib/intro";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * True once the Hero is allowed to begin its entrance.
 *
 * The Hero animates on mount, which would otherwise play unseen behind the
 * loader overlay. This is the coordinated cross-section motion that the
 * "Next over Astro, one React tree" decision in AGENTS.md was made for.
 */
const IntroContext = createContext(true);

export function useIntroDone() {
  return useContext(IntroContext);
}

function subscribe(onStoreChange: () => void) {
  const list = window.matchMedia(REDUCED_MOTION);
  list.addEventListener("change", onStoreChange);
  return () => list.removeEventListener("change", onStoreChange);
}

/**
 * Deliberately reads the `data-intro-skip` attribute rather than
 * sessionStorage directly. The inline script in layout.tsx sets that
 * attribute once, before first paint, so it stays stable for the whole page
 * load — whereas sessionStorage gets written the moment the intro reveals,
 * which would flip this mid-animation and cut the dissolve short.
 */
function getSnapshot() {
  return (
    document.documentElement.dataset.introSkip === "1" ||
    window.matchMedia(REDUCED_MOTION).matches
  );
}

export default function IntroProvider({ children }: { children: React.ReactNode }) {
  const skip = useSyncExternalStore(subscribe, getSnapshot, () => false);

  // "intro" → the overlay owns the screen
  // "revealed" → the Hero is animating while the overlay dissolves over it
  // "gone" → the overlay is unmounted
  const [phase, setPhase] = useState<"intro" | "revealed" | "gone">("intro");

  const introDone = skip || phase !== "intro";
  const loaderMounted = !skip && phase !== "gone";

  // Lock scrolling while the overlay is opaque — without this the visitor
  // can scroll the page behind it and arrive somewhere arbitrary.
  useEffect(() => {
    if (!loaderMounted || introDone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [loaderMounted, introDone]);

  const handleReveal = useCallback(() => {
    setPhase("revealed");
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // Private mode or storage disabled — the intro simply plays again.
    }
  }, []);

  const handleDone = useCallback(() => setPhase("gone"), []);

  return (
    // `reducedMotion="user"` is the global guard: Framer Motion drops
    // transform animations for visitors who ask for reduced motion, while
    // still allowing opacity so content doesn't just pop in.
    <MotionConfig reducedMotion="user">
      <IntroContext.Provider value={introDone}>
        {loaderMounted && <Loader onReveal={handleReveal} onDone={handleDone} />}
        {children}
      </IntroContext.Provider>
    </MotionConfig>
  );
}
