"use client";

import { FinalCtaSection } from "@/components/interativo/sections/FinalCtaSection";
import { HeroSection } from "@/components/interativo/sections/HeroSection";
import { LuccaSection } from "@/components/interativo/sections/LuccaSection";
import { NeuralCenterSection } from "@/components/interativo/sections/NeuralCenterSection";
import { OperationalSection } from "@/components/interativo/sections/OperationalSection";
import { ResultsSection } from "@/components/interativo/sections/ResultsSection";
import { AgentsHubSection } from "@/components/interativo/sections/AgentsHubSection";
import { NeuralBackground } from "@/components/interativo/NeuralBackground";
import { useLenisScroll } from "@/hooks/interativo/useLenisScroll";
import { usePrefersReducedMotion } from "@/hooks/interativo/usePrefersReducedMotion";
import { HERO_HEADLINE } from "@/lib/interativo/content";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const headlineWords = HERO_HEADLINE.split(" ");

export function InterativoExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useLenisScroll({
    enabled: !reducedMotion,
    onScroll: () => ScrollTrigger.update(),
  });

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const context = gsap.context(() => {
      if (!reducedMotion) {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

        intro
          .to("[data-open-screen]", {
            opacity: 0,
            duration: 0.8,
            pointerEvents: "none",
          })
          .fromTo(
            "[data-open-line]",
            { width: 0, opacity: 0.45 },
            { width: 220, opacity: 1, duration: 0.85 }
          )
          .fromTo(
            "[data-open-particle]",
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, stagger: 0.05, duration: 0.4 },
            "-=0.35"
          )
          .fromTo(
            "[data-open-symbol]",
            { scale: 0.75, opacity: 0, filter: "blur(12px)" },
            { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.65 },
            "-=0.2"
          )
          .fromTo(
            "[data-open-dashboard]",
            { x: 40, opacity: 0, filter: "blur(16px)" },
            { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.95 },
            "-=0.1"
          )
          .fromTo(
            ".interativo-headline-word",
            { y: 32, opacity: 0, filter: "blur(18px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              stagger: 0.08,
              duration: 0.62,
              ease: "power2.out",
            },
            "-=0.7"
          )
          .fromTo(
            "[data-open-copy], [data-open-cta]",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.55 },
            "-=0.35"
          );
      }

      const sections = gsap.utils.toArray<HTMLElement>("[data-story-section]");

      sections.forEach((section, index) => {
        if (index === 0) return;

        gsap.fromTo(
          section,
          {
            opacity: 0.22,
            y: 115,
            filter: reducedMotion ? "none" : "blur(14px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 38%",
              scrub: reducedMotion ? false : 0.9,
            },
          }
        );
      });

      const depthLayers = gsap.utils.toArray<HTMLElement>("[data-depth]");

      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth ?? 30);

        gsap.fromTo(
          layer,
          { y: depth * 0.35 },
          {
            y: depth * -0.35,
            ease: "none",
            scrollTrigger: {
              trigger: layer,
              start: "top bottom",
              end: "bottom top",
              scrub: reducedMotion ? false : 0.85,
            },
          }
        );
      });
    }, rootRef);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <main ref={rootRef} className="relative min-h-screen overflow-x-clip bg-[#060606] text-white">
      <a
        href="#conteudo-interativo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Pular para conteudo
      </a>

      <NeuralBackground reducedMotion={reducedMotion} />

      <div data-open-screen className="pointer-events-none fixed inset-0 z-40 bg-[#f5f5f7]" />

      <div className="relative z-10" id="conteudo-interativo">
        <div data-depth="18">
          <HeroSection headlineWords={headlineWords} />
        </div>
        <div data-depth="30">
          <OperationalSection />
        </div>
        <div data-depth="24">
          <NeuralCenterSection />
        </div>
        <div data-depth="26">
          <AgentsHubSection />
        </div>
        <div data-depth="22">
          <ResultsSection />
        </div>
        <div data-depth="20">
          <LuccaSection />
        </div>
        <div data-depth="16">
          <FinalCtaSection />
        </div>
      </div>
    </main>
  );
}
