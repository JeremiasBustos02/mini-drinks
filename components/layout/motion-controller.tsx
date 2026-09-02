"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

export function MotionController() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-scrolled", window.scrollY > 1);

    return () => root.removeAttribute("data-scrolled");
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const originMarker = document.createElement("span");
    originMarker.className = "scroll-origin-marker";
    originMarker.setAttribute("aria-hidden", "true");
    document.body.prepend(originMarker);

    const headerObserver = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-scrolled", !entry.isIntersecting);
    });
    headerObserver.observe(originMarker);

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let revealObserver: IntersectionObserver | undefined;
    let frame = 0;

    if (!prefersReducedMotion && revealElements.length > 0) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            (entry.target as HTMLElement).dataset.motionState = "revealed";
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );

      frame = requestAnimationFrame(() => {
        for (const element of revealElements) {
          const bounds = element.getBoundingClientRect();
          const isInitiallyVisible =
            bounds.bottom > 0 && bounds.top < window.innerHeight * 0.92;

          if (isInitiallyVisible) {
            element.dataset.motionState = "revealed";
            continue;
          }

          element.dataset.motionState = "pending";
          revealObserver?.observe(element);
        }
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      headerObserver.disconnect();
      for (const element of revealElements) {
        element.removeAttribute("data-motion-state");
      }
      originMarker.remove();
    };
  }, [pathname]);

  return null;
}
