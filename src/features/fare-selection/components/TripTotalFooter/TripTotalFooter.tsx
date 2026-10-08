import { useTranslation } from "react-i18next";
import { PriceSummary } from "@/components/common/PriceSummary";
import { formatBaht } from "@/lib/format";
import type { TripTotalFooterProps } from "./TripTotalFooter.types";

/** Sticky footer with the running trip total for the whole party. */
export function TripTotalFooter({ selections }: TripTotalFooterProps) {
  const { t } = useTranslation("fareSelection");
  if (selections.length === 0) return null;
  const lines = selections.map((selection, index) => ({
    label: t(index === 0 ? "footer.outbound" : "footer.return", {
      from: selection.flight.from,
      to: selection.flight.to,
    }),
    amount: formatBaht(selection.total),
  }));
  const total = selections.reduce((sum, selection) => sum + selection.total, 0);

  return (
    <footer className="sticky bottom-0 border-t border-line bg-card px-4 py-3">
      <PriceSummary lines={lines} total={formatBaht(total)} />
    </footer>
  );
}
