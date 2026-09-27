"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A media query is an external store, so it's read with
 * useSyncExternalStore rather than mirrored into state from an effect —
 * that pattern causes a cascading render and React's lint rules reject it.
 *
 * The server snapshot is always false, so the mobile/no-match branch is what
 * renders first and desktop corrects on hydration. Callers must treat
 * `false` as the safe default.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
