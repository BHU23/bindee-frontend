import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatBaht } from "@/lib/format";
import type { FareCardProps } from "./FareCard.types";

/** One selectable fare: a radio wrapped in a card. */
export function FareCard({ fare, name, selected, onSelect }: FareCardProps) {
  const { t } = useTranslation("fareSelection");
  const change = !fare.changeAllowed
    ? t("fare.changeNotAllowed")
    : fare.changeFee === 0
      ? t("fare.changeFree")
      : t("fare.changeFee", { fee: formatBaht(fare.changeFee) });
  const refund = !fare.refundAllowed
    ? t("fare.refundNotAllowed")
    : fare.refundFee === 0
      ? t("fare.refundFree")
      : t("fare.refundFee", { fee: formatBaht(fare.refundFee) });
  const rules = [
    t("fare.cabinBag", { kg: fare.cabinBagKg }),
    fare.checkedBagKg > 0
      ? t("fare.checkedBag", { kg: fare.checkedBagKg })
      : t("fare.noCheckedBag"),
    change,
    refund,
    fare.seatIncluded ? t("fare.seatIncluded") : t("fare.seatNotIncluded"),
  ];

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 has-focus-visible:ring-2 has-focus-visible:ring-ring",
        selected ? "border-iris bg-iris-mist" : "border-line",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            checked={selected}
            onChange={onSelect}
            className="size-4 accent-iris"
          />
          <span className="font-display text-base font-semibold text-midnight">
            {t(`fare.name.${fare.family}`)}
          </span>
        </span>
        <span className="font-display text-base font-semibold tabular-nums">
          {t("fare.price", { price: formatBaht(fare.perAdult) })}
        </span>
      </span>
      <ul className="flex flex-col gap-1 pl-6 text-sm text-muted-foreground">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </label>
  );
}
