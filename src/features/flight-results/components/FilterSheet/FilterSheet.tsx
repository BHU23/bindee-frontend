import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBaht } from "@/lib/format";
import {
  DEFAULT_FILTERS,
  DEPARTURE_BANDS,
  FARE_FAMILIES,
  normalizePrices,
} from "../../lib/filters";
import type { FlightFilters, PriceRangeDto } from "../../types/flightResults";
import type { FilterSheetProps } from "./FilterSheet.types";

const PRICE_STEP = 10;

function toggle<T>(list: T[], item: T, on: boolean): T[] {
  const without = list.filter((entry) => entry !== item);
  return on ? [...list, item] : without;
}

interface FilterFormProps {
  filters: FlightFilters;
  priceRange: PriceRangeDto;
  onApply: (filters: FlightFilters) => void;
  onClose: () => void;
}

/** Mounted only while the sheet is open, so every opening starts from the applied filters. */
function FilterForm({
  filters,
  priceRange,
  onApply,
  onClose,
}: FilterFormProps) {
  const { t } = useTranslation("flightResults");
  const [draft, setDraft] = useState(filters);
  const min = draft.minPrice ?? priceRange.min;
  const max = draft.maxPrice ?? priceRange.max;

  function apply(next: FlightFilters) {
    onApply(normalizePrices(next, priceRange));
    onClose();
  }

  return (
    <>
      <div className="flex flex-col gap-5 overflow-y-auto px-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-display text-[15px] font-semibold">
            {t("filter.departure")}
          </legend>
          {DEPARTURE_BANDS.map((band) => (
            <Checkbox
              key={band}
              label={t(`filter.band.${band}`)}
              checked={draft.departure.includes(band)}
              onCheckedChange={(checked) =>
                setDraft({
                  ...draft,
                  departure: toggle(draft.departure, band, checked),
                })
              }
            />
          ))}
        </fieldset>
        <Checkbox
          label={t("filter.directOnly")}
          checked={draft.directOnly}
          onCheckedChange={(checked) =>
            setDraft({ ...draft, directOnly: checked })
          }
        />
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-display text-[15px] font-semibold">
            {t("filter.price")}
          </legend>
          <p className="text-sm text-muted-foreground">
            {formatBaht(min)} – {formatBaht(max)}
          </p>
          <label className="flex flex-col gap-1 text-sm">
            {t("filter.minPrice")}
            <input
              type="range"
              role="slider"
              min={priceRange.min}
              max={priceRange.max}
              step={PRICE_STEP}
              value={min}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  minPrice: Math.min(Number(event.target.value), max),
                })
              }
              className="h-11 w-full accent-midnight"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("filter.maxPrice")}
            <input
              type="range"
              role="slider"
              min={priceRange.min}
              max={priceRange.max}
              step={PRICE_STEP}
              value={max}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  maxPrice: Math.max(Number(event.target.value), min),
                })
              }
              className="h-11 w-full accent-midnight"
            />
          </label>
        </fieldset>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-display text-[15px] font-semibold">
            {t("filter.fare")}
          </legend>
          {FARE_FAMILIES.map((fare) => (
            <Checkbox
              key={fare}
              label={t(`filter.fareFamily.${fare}`)}
              checked={draft.fare.includes(fare)}
              onCheckedChange={(checked) =>
                setDraft({ ...draft, fare: toggle(draft.fare, fare, checked) })
              }
            />
          ))}
        </fieldset>
      </div>
      <SheetFooter>
        <Button block onClick={() => apply(draft)}>
          {t("filter.apply")}
        </Button>
        <Button
          block
          variant="ghost"
          onClick={() => apply({ ...DEFAULT_FILTERS, sort: filters.sort })}
        >
          {t("filter.reset")}
        </Button>
      </SheetFooter>
    </>
  );
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  priceRange,
  onApply,
}: FilterSheetProps) {
  const { t } = useTranslation("flightResults");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>{t("filter.title")}</SheetTitle>
          <SheetDescription>{t("filter.description")}</SheetDescription>
        </SheetHeader>
        <FilterForm
          filters={filters}
          priceRange={priceRange}
          onApply={onApply}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
