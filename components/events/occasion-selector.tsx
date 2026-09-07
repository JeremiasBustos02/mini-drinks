"use client";

import { useRef, useState, type KeyboardEvent } from "react";

const occasions = [
  { title: "CUMPLEAÑOS", copy: "Que el brindis se note antes de apagar las velitas.", categories: "MINIS · VASOS · PACKS" },
  { title: "PREVIAS", copy: "Todo listo para que el plan arranque cuando llega la gente.", categories: "PACKS · MINIS · MIXERS" },
  { title: "FIESTAS", copy: "Una vuelta distinta para compartir, abrir y volver a servir.", categories: "COMBOS · PACKS · VASOS" },
  { title: "REGALOS", copy: "Algo chico que no queda en una repisa.", categories: "PACKS · MINIS · MIXERS" },
];

export function OccasionSelector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  function activate(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) tabsRef.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = occasions.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      activate(nextIndex, true);
    }
  }

  return (
    <div className="events-occasion-reel mt-10">
      {occasions.map((occasion, index) => {
        const isActive = activeIndex === index;

        return (
          <article className="events-occasion-reel-panel" data-active={isActive} key={occasion.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" aria-hidden="true" className="events-occasion-reel-photo" src="/background-hero.webp" />
            <button
              aria-controls={`occasion-content-${index}`}
              aria-expanded={isActive}
              className="events-occasion-reel-trigger"
              id={`occasion-trigger-${index}`}
              onClick={() => activate(index)}
              onFocus={() => activate(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onMouseEnter={() => activate(index)}
              ref={(element) => {
                tabsRef.current[index] = element;
              }}
              type="button"
            >
              <span className="events-occasion-reel-title">{occasion.title}</span>
              <span aria-hidden="true" className="events-occasion-reel-indicator">{isActive ? "×" : "+"}</span>
            </button>
            <div
              aria-hidden={!isActive}
              aria-labelledby={`occasion-trigger-${index}`}
              className="events-occasion-reel-content"
              id={`occasion-content-${index}`}
              role="region"
            >
              <div className="events-occasion-reel-content-inner">
                <p>{occasion.copy}</p>
                <span>{occasion.categories} <b aria-hidden="true">→</b></span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
