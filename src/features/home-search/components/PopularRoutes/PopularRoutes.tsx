import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DOMESTIC_AIRPORTS } from "../../lib/airports";
import type { PopularRoute } from "../../types/homeSearch";
import type { PopularRoutesProps } from "./PopularRoutes.types";

const SKELETON_COUNT = 4;

/** Route cards with the computed "from" price; prices come from the API only. */
export function PopularRoutes({
  routes,
  status,
  onRetry,
  onSelect,
}: PopularRoutesProps) {
  const { t } = useTranslation("homeSearch");

  function routeCard(route: PopularRoute) {
    const name = `${route.origin} → ${route.destination}`;
    const isInternational = !DOMESTIC_AIRPORTS.has(route.destination);
    return (
      <li key={route.destination}>
        <button
          type="button"
          aria-label={t("popular.pick", { route: name })}
          onClick={() => onSelect(route)}
          className="flex min-h-11 w-full flex-col items-start gap-2 rounded-lg border border-white/70 bg-white/90 p-5 text-left shadow-card outline-none hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span className="flex min-h-6 w-full items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {isInternational
                ? t("popular.international")
                : t("popular.domestic")}
            </span>
            {isInternational && (
              <span className="rounded-full bg-iris-mist px-3 py-0.5 text-midnight">
                {t("popular.passport")}
              </span>
            )}
          </span>
          <span className="font-display text-2xl font-bold text-midnight">
            {route.origin} → {route.destination}
          </span>
          <span className="text-sm text-muted-foreground">
            {t(`city.${route.origin}`)} – {t(`city.${route.destination}`)}
          </span>
          {route.fromPrice === null ? (
            <span className="text-sm font-medium">{t("popular.noSeats")}</span>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="flex items-baseline gap-1 text-sm text-muted-foreground"
              >
                {t("popular.fromLabel")}
                <span className="font-display text-2xl font-bold text-midnight">
                  {formatBaht(route.fromPrice)}
                </span>
              </span>
              <span className="sr-only">
                {t("popular.from", { price: formatBaht(route.fromPrice) })}
              </span>
            </>
          )}
        </button>
      </li>
    );
  }

  let body;
  if (status === "loading") {
    body = (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li
            key={index}
            data-testid="route-skeleton"
            className={cn("h-40 animate-pulse rounded-lg bg-white/60")}
          />
        ))}
      </ul>
    );
  } else if (status === "error") {
    body = (
      <Alert variant="destructive">
        <p>{t("popular.error")}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {t("common:retry")}
        </Button>
      </Alert>
    );
  } else {
    body = (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {routes.map(routeCard)}
      </ul>
    );
  }

  if (status === "success" && routes.length === 0) return null;

  return (
    <section aria-labelledby="popular-title" className="flex flex-col gap-4">
      <h2
        id="popular-title"
        className="font-display text-[32px] leading-10 font-bold text-midnight"
      >
        {t("popular.title")}
      </h2>
      {body}
    </section>
  );
}
