import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PopularRoute } from "../../types/homeSearch";
import type { PopularRoutesProps } from "./PopularRoutes.types";

const SKELETON_COUNT = 4;

/** The first route is the hero card; the rest are route cards. Prices come from the API only. */
export function PopularRoutes({
  routes,
  status,
  onRetry,
  onSelect,
}: PopularRoutesProps) {
  const { t } = useTranslation("homeSearch");

  function routeCard(route: PopularRoute, isHero: boolean) {
    const name = `${route.origin} → ${route.destination}`;
    return (
      <li key={route.destination} className={cn(isHero && "md:col-span-2")}>
        <button
          type="button"
          aria-label={t("popular.pick", { route: name })}
          onClick={() => onSelect(route)}
          className={cn(
            "flex min-h-11 w-full flex-col items-start gap-1 rounded-md border border-line bg-card p-4 text-left shadow-card outline-none hover:bg-iris-mist focus-visible:ring-3 focus-visible:ring-ring/40",
            isHero && "bg-linear-to-br from-lilac via-sky to-blush p-6",
          )}
        >
          <span
            className={cn(
              "font-display font-semibold break-words text-midnight",
              isHero ? "text-2xl" : "text-base",
            )}
          >
            {route.city}
          </span>
          <span className="text-sm text-muted-foreground">{name}</span>
          <span className="text-sm font-medium text-foreground">
            {route.fromPrice === null
              ? t("popular.noSeats")
              : t("popular.from", { price: formatBaht(route.fromPrice) })}
          </span>
        </button>
      </li>
    );
  }

  let body;
  if (status === "loading") {
    body = (
      <ul className="grid gap-4 md:grid-cols-4" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li
            key={index}
            data-testid="route-skeleton"
            className={cn(
              "h-28 animate-pulse rounded-md bg-iris-mist",
              index === 0 && "md:col-span-2",
            )}
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
      <ul className="grid gap-4 md:grid-cols-4">
        {routes.map((route, index) => routeCard(route, index === 0))}
      </ul>
    );
  }

  if (status === "success" && routes.length === 0) return null;

  return (
    <section aria-labelledby="popular-title" className="flex flex-col gap-3">
      <h2
        id="popular-title"
        className="font-display text-xl font-semibold text-midnight"
      >
        {t("popular.title")}
      </h2>
      {body}
    </section>
  );
}
