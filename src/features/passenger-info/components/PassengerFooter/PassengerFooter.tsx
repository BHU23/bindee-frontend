import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PriceSummary } from "@/components/common/PriceSummary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBaht } from "@/lib/format";
import type { PassengerFooterProps } from "./PassengerFooter.types";

/** Sticky footer: total for all passengers, price details in a Sheet, and the submit button (UI-PX-07). */
export function PassengerFooter({
  total,
  outboundTotal,
  inboundTotal,
  isSubmitting,
}: PassengerFooterProps) {
  const { t } = useTranslation("passengerInfo");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const lines = [
    { label: t("footer.outbound"), amount: formatBaht(outboundTotal) },
    ...(inboundTotal === undefined
      ? []
      : [{ label: t("footer.inbound"), amount: formatBaht(inboundTotal) }]),
  ];

  return (
    <footer className="sticky bottom-0 flex flex-col gap-2 border-t border-line bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("footer.total")}
          </span>
          <output
            aria-label={t("footer.total")}
            className="font-display text-[22px] leading-7 font-semibold text-midnight tabular-nums"
          >
            {formatBaht(total)}
          </output>
        </div>
        <Button
          type="button"
          variant="link"
          onClick={() => setIsDetailsOpen(true)}
        >
          {t("footer.details")}
        </Button>
      </div>
      <Button type="submit" block disabled={isSubmitting}>
        {isSubmitting ? t("footer.saving") : t("footer.continue")}
      </Button>
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{t("footer.detailsTitle")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PriceSummary lines={lines} total={formatBaht(total)} />
          </div>
        </SheetContent>
      </Sheet>
    </footer>
  );
}
