import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBaht, formatTime24 } from "@/lib/format";

import type { PriceChangedDialogProps } from "./PriceChangedDialog.types";

const MAX_ALTERNATIVES = 3;

function formatDiff(diff: number): string {
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return `${sign}${formatBaht(Math.abs(diff))}`;
}

export function PriceChangedDialog({
  open,
  change,
  busy = false,
  onAccept,
  onBack,
}: PriceChangedDialogProps) {
  const { t } = useTranslation("priceChanged");
  const isSoldOut = change.reason === "FARE_SOLD_OUT";
  const alternatives = (change.alternatives ?? []).slice(0, MAX_ALTERNATIVES);

  // UI-FS-04: a choice is required, so every dismissal request is ignored.
  function handleOpenChange() {}

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t(`title.${change.reason}`)}</DialogTitle>
          <DialogDescription>{t(`reason.${change.reason}`)}</DialogDescription>
        </DialogHeader>

        {!isSoldOut && (
          <dl className="grid grid-cols-[1fr_auto] gap-y-2">
            <dt className="text-muted-foreground">{t("oldPrice")}</dt>
            <dd>{formatBaht(change.oldPrice)}</dd>
            <dt className="text-muted-foreground">{t("diff")}</dt>
            <dd>{formatDiff(change.diff)}</dd>
            <dt className="font-medium">{t("newPrice")}</dt>
            <dd className="font-medium">{formatBaht(change.newPrice)}</dd>
          </dl>
        )}

        {isSoldOut && alternatives.length > 0 && (
          <section className="grid gap-2">
            <h3 className="text-muted-foreground">{t("alternativesHint")}</h3>
            <ul className="grid gap-1">
              {alternatives.map((flight) => (
                <li key={flight.flightId} className="flex justify-between">
                  <span>
                    {flight.flightNo} {formatTime24(flight.depart)}
                  </span>
                  <span>
                    {t("alternativeFrom", {
                      price: formatBaht(flight.fromPricePerPax),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onBack} disabled={busy}>
            {t("back")}
          </Button>
          {!isSoldOut && (
            <Button onClick={onAccept} disabled={busy} aria-busy={busy}>
              {busy ? t("accepting") : t("accept")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
