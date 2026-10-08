import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { ApiError } from "@/services/apiClient";
import { getFares, selectFare } from "../../api/bookingApi";
import type {
  FareFamily,
  FlightCardDto,
  PriceChangedError,
} from "../../types/booking";
import { FareCard } from "../FareCard";
import type { FareSelectionSheetProps } from "./FareSelectionSheet.types";

const RADIO_GROUP = "fare-family";

function priceChangedOf(error: unknown): PriceChangedError | null {
  if (!(error instanceof ApiError) || error.code !== "PRICE_CHANGED")
    return null;
  const body = error.body as { error?: PriceChangedError } | undefined;
  return body?.error ?? null;
}

interface FareFormProps extends Omit<
  FareSelectionSheetProps,
  "open" | "onOpenChange" | "flight"
> {
  flight: FlightCardDto;
}

/** Mounted only while the sheet is open, so every opening loads fresh fares. */
function FareForm({
  flight,
  draftId,
  leg,
  onSelected,
  onPriceChanged,
}: FareFormProps) {
  const { t } = useTranslation("fareSelection");
  const { t: tc } = useTranslation();
  const fares = useAsyncResource(
    (signal) => getFares(draftId, flight.flightId, signal),
    [draftId, flight.flightId],
  );
  const [family, setFamily] = useState<FareFamily | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSelectError, setHasSelectError] = useState(false);

  async function handleSelect() {
    if (family === null) return;
    setIsSubmitting(true);
    setHasSelectError(false);
    try {
      const result = await selectFare(draftId, leg, flight.flightId, family);
      onSelected({
        flight,
        fareFamily: result.selection.fareFamily,
        total: result.price.total,
      });
    } catch (error) {
      const change = priceChangedOf(error);
      if (change) onPriceChanged(change);
      else if (!(error instanceof ApiError && error.code === "SEARCH_EXPIRED"))
        setHasSelectError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 overflow-y-auto px-4">
        {fares.status === "loading" && (
          <div
            role="status"
            aria-label={t("sheet.loading")}
            className="flex flex-col gap-3"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        )}
        {fares.status === "error" && (
          <Alert variant="destructive" title={t("sheet.loadError")}>
            <Button variant="outline" onClick={fares.reload}>
              {tc("retry")}
            </Button>
          </Alert>
        )}
        {fares.status === "success" && fares.data && (
          <div
            role="radiogroup"
            aria-label={t("sheet.fareGroup")}
            className="flex flex-col gap-3"
          >
            {fares.data.fares.map((fare) => (
              <FareCard
                key={fare.family}
                fare={fare}
                name={RADIO_GROUP}
                selected={family === fare.family}
                onSelect={() => setFamily(fare.family)}
              />
            ))}
          </div>
        )}
        {hasSelectError && (
          <p role="alert" className="text-sm text-destructive">
            {t("sheet.selectError")}
          </p>
        )}
      </div>
      <SheetFooter>
        <Button
          disabled={family === null || isSubmitting}
          onClick={() => void handleSelect()}
        >
          {hasSelectError ? t("sheet.retry") : t("select")}
        </Button>
      </SheetFooter>
    </>
  );
}

/** Bottom sheet that lists the fares of one flight and saves the chosen one into the draft. */
export function FareSelectionSheet({
  open,
  onOpenChange,
  flight,
  ...formProps
}: FareSelectionSheetProps) {
  const { t } = useTranslation("fareSelection");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>{t("sheet.title")}</SheetTitle>
          <SheetDescription>
            {flight
              ? t("sheet.description", {
                  flightNo: flight.flightNo,
                  from: flight.from,
                  to: flight.to,
                })
              : ""}
          </SheetDescription>
        </SheetHeader>
        {flight && <FareForm flight={flight} {...formProps} />}
      </SheetContent>
    </Sheet>
  );
}
