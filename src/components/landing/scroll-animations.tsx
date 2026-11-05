"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Animations du site public :
 * - [data-reveal] : montée + fondu à l'entrée dans l'écran (une seule fois)
 * - [data-reveal-group] > * : idem, en cascade
 * - [data-float] : léger flottement en parallaxe au scroll
 * Coupées si l'utilisateur a demandé moins d'animations.
 */
export function ScrollAnimations({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
          gsap.from(group.children, {
            y: 32,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: "top 80%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
          gsap.to(el, {
            yPercent: i % 2 ? -18 : -28,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // Hero : entrée orchestrée au chargement
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-hero-copy] > *", { y: 28, opacity: 0, duration: 0.6, stagger: 0.08 })
          .from("[data-hero-phone]", { y: 60, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.4")
          .from("[data-hero-title]", { y: 40, opacity: 0, duration: 0.7 }, "-=0.5");
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
