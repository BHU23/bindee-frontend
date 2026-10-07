import { useState } from "react";
import type { FlyByProps } from "./FlyBy.types";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** One-time intro: a top-down plane rises through the centre of the screen and flies off. */
export function FlyBy({ onDone }: FlyByProps) {
  const [isDone, setIsDone] = useState(prefersReducedMotion);
  if (isDone) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="flyby"
      onAnimationEnd={() => {
        setIsDone(true);
        onDone?.();
      }}
      className="animate-flyby pointer-events-none fixed top-0 left-1/2 z-30 w-48 will-change-transform md:w-60"
    >
      <svg viewBox="0 0 200 520" className="w-full">
        <defs>
          <linearGradient id="flyby-trail" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              className="[stop-color:var(--iris)]"
              stopOpacity="0.55"
            />
            <stop
              offset="1"
              className="[stop-color:var(--iris)]"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path
          d="M92 236 L108 236 L132 520 L68 520 Z"
          fill="url(#flyby-trail)"
        />
        {/* wings */}
        <polygon points="92,95 8,168 14,180 92,152" className="fill-midnight" />
        <polygon
          points="108,95 192,168 186,180 108,152"
          className="fill-midnight"
        />
        <polygon points="8,168 14,180 30,172 24,162" className="fill-sunset" />
        <polygon
          points="192,168 186,180 170,172 176,162"
          className="fill-sunset"
        />
        {/* tail */}
        <polygon points="94,190 52,224 58,232 94,214" className="fill-sunset" />
        <polygon
          points="106,190 148,224 142,232 106,214"
          className="fill-sunset"
        />
        {/* engines */}
        <ellipse
          cx="68"
          cy="120"
          rx="6"
          ry="11"
          className="fill-midnight stroke-sunset"
          strokeWidth="2"
        />
        <ellipse
          cx="132"
          cy="120"
          rx="6"
          ry="11"
          className="fill-midnight stroke-sunset"
          strokeWidth="2"
        />
        {/* fuselage and cockpit */}
        <path
          d="M100 4 C108 4 112 24 112 50 L112 200 C112 226 106 238 100 238 C94 238 88 226 88 200 L88 50 C88 24 92 4 100 4 Z"
          className="fill-white stroke-line"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="36" rx="6" ry="9" className="fill-midnight" />
      </svg>
    </div>
  );
}
