import { useTranslation } from "react-i18next";
import { PriceSummary } from "@/components/common/PriceSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConfirmSectionProps } from "./ConfirmSection.types";

/** Price breakdown, T&C checkbox and the pay button (UI-RH-03, UI-RH-05). */
export function ConfirmSection({
  lines,
  total,
  hasAcceptedTerms,
  hasTermsError,
  isSubmitting,
  isBooked,
  onTermsChange,
}: ConfirmSectionProps) {
  const { t } = useTranslation("reviewHold");
  return (
    <Card role="group" aria-labelledby="review-price">
      <div className="flex flex-col gap-4 px-4">
        <h2
          id="review-price"
          className="font-display text-[17px] font-semibold text-midnight"
        >
          {t("price.title")}
        </h2>
        <PriceSummary lines={lines} total={total} />
        <Checkbox
          checked={hasAcceptedTerms}
          onCheckedChange={(checked) => onTermsChange(checked)}
          disabled={isBooked}
          aria-invalid={hasTermsError ? true : undefined}
          label={t("terms.label")}
          description={
            hasTermsError && (
              <span className="text-destructive">{t("terms.error")}</span>
            )
          }
        />
        {/* Not disabled while the T&C is unchecked: a tap must still flag the checkbox. */}
        <Button type="submit" block disabled={isSubmitting || isBooked}>
          {isSubmitting ? t("confirming") : t("confirm")}
        </Button>
      </div>
    </Card>
  );
}
