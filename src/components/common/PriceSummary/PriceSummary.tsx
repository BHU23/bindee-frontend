import { useTranslation } from "react-i18next";
import type { PriceSummaryProps } from "./PriceSummary.types";

/** Price lines and the total; amounts arrive already formatted (see `formatBaht`). */
export function PriceSummary({
  lines,
  total,
  currency = "THB",
}: PriceSummaryProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <li
            key={line.label}
            className="flex items-start justify-between gap-4 text-[15px]"
          >
            <span className="break-words text-muted-foreground">
              {line.label}
            </span>
            <span className="text-right break-words tabular-nums">
              {line.amount}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-start justify-between gap-4 border-t border-line pt-3">
        <span className="font-display font-semibold">
          {t("priceSummary.total")}
        </span>
        <span className="text-right font-display text-[22px] leading-7 font-semibold break-words text-midnight tabular-nums">
          {total}
          <span className="sr-only"> {currency}</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("priceSummary.includesTaxes")}
      </p>
    </div>
  );
}
