import { useTranslation } from "react-i18next";
import { Icon } from "@/components/common/Icon";
import { formatDateTh } from "@/lib/format";
import type { RecentSearchesProps } from "./RecentSearches.types";

/** Renders nothing when there are no recents, so Home never shows an empty box. */
export function RecentSearches({
  searches,
  isBusy = false,
  onSelect,
}: RecentSearchesProps) {
  const { t } = useTranslation("homeSearch");
  if (searches.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-3">
      <h2
        id="recent-title"
        className="font-display text-xl font-semibold text-midnight"
      >
        {t("recent.title")}
      </h2>
      <ul className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        {searches.map(({ id, query }) => {
          const route = `${query.origin} → ${query.destination}`;
          const dates = query.returnDate
            ? `${formatDateTh(query.departDate)} - ${formatDateTh(query.returnDate)}`
            : formatDateTh(query.departDate);
          const pax = query.adults + query.children + query.infants;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={isBusy}
                aria-label={t("recent.searchAgain", { route })}
                onClick={() => onSelect(query)}
                className="flex min-h-11 w-full items-center gap-3 rounded-sm border border-control-border bg-card px-4 py-2 text-left text-sm outline-none hover:bg-iris-mist focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50"
              >
                <Icon name="plane" />
                <span className="min-w-0 break-words">
                  <span className="block font-medium">{route}</span>
                  <span className="block text-xs text-muted-foreground">
                    {dates} · {t("recent.pax", { count: pax })} ·{" "}
                    {query.tripType === "ROUND_TRIP"
                      ? t("recent.roundTrip")
                      : t("recent.oneWay")}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
