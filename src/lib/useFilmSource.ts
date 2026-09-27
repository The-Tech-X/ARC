"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Loads the Film's video ONCE, whole, into memory, and returns a blob URL
 * to play from (2026-09-27).
 *
 * Why not just `<video src>`: the Film scrubs between hold frames — every
 * scroll back is a seek. Seeking a network video needs HTTP range requests
 * (206 Partial Content), and the Cloudflare/OpenNext worker answers ranges
 * with a full 200. So each seek re-downloaded from byte 0 and the film
 * stalled or restarted from the beginning mid-play. From a blob in memory,
 * every seek is instant and nothing can stall, whatever the server does.
 *
 * When: once the page has loaded, at the first idle moment after the Hero (the Film is the third
 * section, so the download is normally done long before anyone reaches it),
 * or earlier if the section comes within ~2.5 screens. On Save-Data only the
 * proximity trigger applies.
 *
 * Which: the 1080p file on desktop, the 720p one below `lg` — the phone
 * layout shows the film as a band ~390px wide; 1080p there is wasted data.
 *
 * If the fetch fails for any reason it falls back to the plain network URL,
 * which still plays — just without the guarantee.
 */
export function useFilmSource(
  target: RefObject<HTMLElement | null>,
  files: { desktop: string; mobile: string },
) {
  const [src, setSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = target.current;
    if (!el) return;

    const controller = new AbortController();
    let cancelled = false;
    let started = false;
    let objectUrl: string | null = null;
    let idleHandle = 0;

    // requestIdleCallback is missing in older Safari; fall back to a timer.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const cancelIdle = () => {
      if (hasIdle) window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    };

    const start = async () => {
      if (started) return;
      started = true;
      observer.disconnect();
      cancelIdle();

      const url = window.matchMedia("(min-width: 1024px)").matches ? files.desktop : files.mobile;
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok || !response.body) throw new Error(`Film fetch ${response.status}`);
        const total = Number(response.headers.get("content-length")) || 0;
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value as BlobPart);
          received += value.byteLength;
          if (total && !cancelled) setProgress(Math.min(0.99, received / total));
        }
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
        setProgress(1);
        setSrc(objectUrl);
      } catch {
        if (cancelled) return;
        setProgress(1);
        setSrc(url);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void start();
      },
      { rootMargin: "250% 0px" },
    );
    observer.observe(el);

    // Prefetch once the page itself has finished loading — never competing
    // with the Hero's own images and fonts for bandwidth — then at the first
    // idle moment after that.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const scheduleIdle = () => {
      const onIdle = () => void start();
      idleHandle = hasIdle
        ? window.requestIdleCallback(onIdle, { timeout: 3000 })
        : window.setTimeout(onIdle, 1500);
    };
    if (!saveData) {
      if (document.readyState === "complete") scheduleIdle();
      else window.addEventListener("load", scheduleIdle, { once: true });
    }

    return () => {
      cancelled = true;
      controller.abort();
      observer.disconnect();
      cancelIdle();
      window.removeEventListener("load", scheduleIdle);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [target, files.desktop, files.mobile]);

  return { src, progress };
}
