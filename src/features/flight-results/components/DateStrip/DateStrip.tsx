import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DateStripProps } from "./DateStrip.types";

/** Lowest-fare calendar strip: selected = solid midnight, cheapest = sunset-deep, sold out = disabled. */
export function DateStrip({
  days,
  value,
  disabled = false,
  onValueChange,
}: DateStripProps) {
  const { t } = useTranslation("flightResults");
  return (
    <ul
      aria-label={t("dateStrip.label")}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {days.map((day) => {
        const selected = day.date === value;
        return (
          <li key={day.date} className="shrink-0">
            <button
              type="button"
              aria-pressed={selected}
              disabled={disabled || day.soldOut}
              onClick={() => {
                if (!selected) onValueChange?.(day.date);
              }}
              className={cn(
                "flex min-h-14 min-w-24 flex-col items-center justify-center gap-0.5 rounded-md border px-3 py-2 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed",
                selected
                  ? "border-midnight bg-midnight text-primary-foreground"
                  : "border-control-border bg-card text-foreground hover:bg-iris-mist disabled:bg-card disabled:text-muted-foreground",
              )}
            >
              <span className="text-xs font-medium">{day.label}</span>
              {day.soldOut ? (
                <span className="text-sm">{t("dateStrip.soldOut")}</span>
              ) : (
                <>
                  {day.price && (
                    <span
                      className={cn(
                        "font-display text-sm font-semibold",
                        day.lowest && !selected && "text-sunset-deep",
                      )}
                    >
                      {day.price}
                    </span>
                  )}
                  {day.note && <span className="text-xs">{day.note}</span>}
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
