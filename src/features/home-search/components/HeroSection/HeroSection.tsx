import { useTranslation } from "react-i18next";
import { formatBaht } from "@/lib/format";
import type { HeroSectionProps } from "./HeroSection.types";

/** Dotted flight path: starts on the navy block and ends at the plane's tail inside the logo bubble. */
const HERO_PATH = "M150 335 C 250 335, 365 199, 423 130";

export function HeroSection({ route, status }: HeroSectionProps) {
  const { t } = useTranslation("homeSearch");
  const hasPrice = route !== undefined && route.fromPrice !== null;

  return (
    <section className="grid items-center gap-8 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-4">
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-white/70 px-4 text-sm font-medium text-midnight">
          <span aria-hidden="true" className="size-2 rounded-full bg-sunset" />
          {t("hero.badge")}
        </span>
        <h1 className="font-display text-[36px] leading-10 font-bold break-words text-midnight md:text-[56px] md:leading-[60px]">
          {t("hero.headlineTop")}
          <br />
          {t("hero.headlineBottom")}
        </h1>
        <p className="font-display text-xl font-medium text-iris">
          {t("hero.tagline")}
        </p>
        <p className="max-w-md text-slate">{t("hero.body")}</p>
      </div>

      <div
        data-testid="hero-art"
        className="relative hidden h-[360px] lg:block"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 520 380"
          preserveAspectRatio="xMaxYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <clipPath id="hero-bubble-clip">
              <circle cx="440" cy="110" r="48" />
            </clipPath>
            <filter
              id="hero-bubble-shadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="8"
                stdDeviation="8"
                style={{ floodColor: "var(--midnight)" }}
                floodOpacity="0.18"
              />
            </filter>
          </defs>
          <circle cx="300" cy="150" r="140" className="fill-sunset" />
          <rect
            x="110"
            y="210"
            width="410"
            height="170"
            rx="28"
            className="fill-midnight"
          />
          <circle
            cx="440"
            cy="110"
            r="48"
            fill="white"
            filter="url(#hero-bubble-shadow)"
          />
          {/* The logo is turned 40° so the plane flies along the path and its tail meets the line. */}
          <image
            href="/brand/bindee-logo.png"
            x="408"
            y="78"
            width="64"
            height="64"
            transform="rotate(40 440 110)"
          />
          <path
            d={HERO_PATH}
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          <path
            d={HERO_PATH}
            fill="none"
            clipPath="url(#hero-bubble-clip)"
            className="stroke-midnight"
            strokeWidth="3.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
        </svg>

        {status === "loading" && (
          <div
            data-testid="hero-price-skeleton"
            className="absolute top-10 left-0 h-36 w-72 animate-pulse rounded-lg bg-white/60"
          />
        )}
        {hasPrice && (
          <div className="absolute top-10 left-0 flex w-72 flex-col gap-1 rounded-lg border border-white/70 bg-glass p-5 shadow-card backdrop-blur-lg">
            <p className="text-sm text-muted-foreground">
              {t(`city.${route.origin}`)} → {t(`city.${route.destination}`)}
            </p>
            <p
              aria-hidden="true"
              className="font-display text-4xl font-bold text-midnight"
            >
              {formatBaht(route.fromPrice)}
            </p>
            <p aria-hidden="true" className="text-xs text-muted-foreground">
              {t("hero.priceCardCaption")}
            </p>
            <p className="sr-only">
              {t("popular.from", { price: formatBaht(route.fromPrice) })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
