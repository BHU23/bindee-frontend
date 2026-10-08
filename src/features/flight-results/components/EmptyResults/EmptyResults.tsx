import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatBaht, formatDateTh } from "@/lib/format";
import { DateStrip, type DateStripDay } from "../DateStrip";
import type { EmptyResultsProps } from "./EmptyResults.types";

/** Zero flights: say so plainly, then offer the nearby days that still have seats. */
export function EmptyResults({
  calendar,
  selectedDate,
  busy = false,
  hasActiveFilters = false,
  onSelectDay,
  onEditSearch,
  onResetFilters,
}: EmptyResultsProps) {
  const { t } = useTranslation("flightResults");
  const nearby: DateStripDay[] = calendar
    .filter(
      (day) => !day.soldOut && day.seatsLeft > 0 && day.date !== selectedDate,
    )
    .map((day) => ({
      date: day.date,
      label: formatDateTh(day.date),
      price: formatBaht(day.lowestFare),
      note: t("empty.dayNote", { count: day.seatsLeft }),
    }));

  return (
    <section className="flex flex-col gap-4 rounded-md border border-line bg-card p-6">
      <h2 className="font-display text-xl font-semibold text-midnight">
        {t("empty.title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("empty.body")}</p>
      {nearby.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-[15px] font-semibold">
            {t("empty.nearby")}
          </h3>
          <DateStrip
            days={nearby}
            disabled={busy}
            onValueChange={onSelectDay}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onEditSearch}>
          {t("empty.edit")}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onResetFilters}>
            {t("empty.resetFilters")}
          </Button>
        )}
      </div>
    </section>
  );
}
