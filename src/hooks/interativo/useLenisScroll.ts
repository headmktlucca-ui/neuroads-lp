"use client";

import Lenis from "lenis";
import { useEffect } from "react";

type UseLenisScrollProps = {
  enabled: boolean;
  onScroll?: () => void;
};

export function useLenisScroll({ enabled, onScroll }: UseLenisScrollProps) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      lerp: 0.08,
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    if (onScroll) {
      lenis.on("scroll", onScroll);
    }

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled, onScroll]);
}
