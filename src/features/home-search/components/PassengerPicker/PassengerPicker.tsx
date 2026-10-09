import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Counter } from "@/components/common/Counter";
import { Icon } from "@/components/common/Icon";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PassengerPickerProps } from "./PassengerPicker.types";

/** One field that summarises the party and opens the counters (and cabin) in a popover. */
export function PassengerPicker({
  values,
  limits,
  onChange,
}: PassengerPickerProps) {
  const { t } = useTranslation("homeSearch");
  const [isOpen, setIsOpen] = useState(false);

  const summary = [
    t("pax.summaryAdults", { count: values.adults }),
    values.children > 0
      ? t("pax.summaryChildren", { count: values.children })
      : null,
    values.infants > 0
      ? t("pax.summaryInfants", { count: values.infants })
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const isTotalFull = values.adults + values.children >= 9;
  const isInfantsFull = values.infants >= values.adults;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-foreground">
        {t("pax.label")}
      </span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          aria-label={`${t("pax.label")}: ${summary}`}
          className="flex h-11 w-full items-center gap-2 rounded-sm border border-control-border bg-card px-4 text-left text-[15px] transition-colors outline-none focus-visible:border-iris focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <Icon name="user" className="shrink-0 text-muted-foreground" />
          <span className="min-w-0 break-words">{summary}</span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
          <Counter
            label={t("pax.adults")}
            description={t("pax.adultsHint")}
            value={values.adults}
            min={limits.minAdults}
            max={limits.maxAdults}
            onChange={(next) => onChange("adults", next)}
          />
          <Counter
            label={t("pax.children")}
            description={t("pax.childrenHint")}
            value={values.children}
            min={0}
            max={limits.maxChildren}
            onChange={(next) => onChange("children", next)}
          />
          <Counter
            label={t("pax.infants")}
            description={t("pax.infantsHint")}
            value={values.infants}
            min={0}
            max={limits.maxInfants}
            onChange={(next) => onChange("infants", next)}
          />
          {isTotalFull && (
            <p className="text-xs text-muted-foreground">
              {t("pax.limitTotal")}
            </p>
          )}
          {isInfantsFull && (
            <p className="text-xs text-muted-foreground">
              {t("pax.limitInfants")}
            </p>
          )}
          <SelectField
            label={t("field.cabin")}
            options={[{ value: "ECONOMY", label: t("cabin.economy") }]}
            value={values.cabin}
            disabled
          />
          <Button size="sm" onClick={() => setIsOpen(false)}>
            {t("pax.done")}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
