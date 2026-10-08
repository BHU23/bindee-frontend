import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PrivacyPolicy } from "../PrivacyPolicy";
import type { ConsentSectionProps } from "./ConsentSection.types";

/** PDPA consents. The policy opens in a Sheet so typed form data and checkbox state are kept (UI-PX-10). */
export function ConsentSection({
  consent,
  privacyError,
  onPrivacyChange,
  onMarketingChange,
}: ConsentSectionProps) {
  const { t } = useTranslation("passengerInfo");
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  return (
    <Card role="group" aria-labelledby="consent-title">
      <div className="flex flex-col gap-4 px-4">
        <h2
          id="consent-title"
          className="font-display text-[17px] font-semibold text-midnight"
        >
          {t("consent.title")}
        </h2>
        <Checkbox
          checked={consent.privacy}
          onCheckedChange={(checked) => onPrivacyChange(checked)}
          aria-invalid={privacyError ? true : undefined}
          label={
            <>
              {t("consent.privacyBefore")}
              <Button
                type="button"
                variant="link"
                className="h-auto px-1 py-0 align-baseline text-[15px]"
                onClick={(event) => {
                  event.preventDefault();
                  setIsPolicyOpen(true);
                }}
              >
                {t("consent.privacyLink")}
              </Button>
              {t("consent.privacyAfter")}
            </>
          }
          description={
            privacyError && (
              <span className="text-destructive">{privacyError}</span>
            )
          }
        />
        <Checkbox
          checked={consent.marketing}
          onCheckedChange={(checked) => onMarketingChange(checked)}
          label={t("consent.marketing")}
        />
      </div>
      <Sheet open={isPolicyOpen} onOpenChange={setIsPolicyOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("privacy.title")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <PrivacyPolicy />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
