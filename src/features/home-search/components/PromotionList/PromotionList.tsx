import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTh } from "@/lib/format";
import { bangkokDay } from "../../lib/dates";
import type { PromotionListProps } from "./PromotionList.types";

const SKELETON_COUNT = 3;

export function PromotionList({
  promotions,
  status,
  onRetry,
}: PromotionListProps) {
  const { t } = useTranslation("homeSearch");

  let body;
  if (status === "loading") {
    body = (
      <ul className="grid gap-4 md:grid-cols-3" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index}>
            <Card
              data-testid="promotion-skeleton"
              className="h-36 animate-pulse bg-iris-mist"
            />
          </li>
        ))}
      </ul>
    );
  } else if (status === "error") {
    body = (
      <Alert variant="destructive">
        <p>{t("promotions.error")}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          {t("common:retry")}
        </Button>
      </Alert>
    );
  } else if (promotions.length === 0) {
    body = null;
  } else {
    body = (
      <ul className="grid gap-4 md:grid-cols-3">
        {promotions.map((promotion) => (
          <li key={promotion.id}>
            <Card className="h-full gap-2 px-4">
              <h3 className="font-display text-base font-semibold break-words text-midnight">
                {promotion.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {promotion.origin} → {promotion.destination}
              </p>
              <div>
                <Badge>
                  {t("promotions.code", { code: promotion.promoCode })}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("promotions.validUntil", {
                  date: formatDateTh(bangkokDay(promotion.validUntil)),
                })}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  if (status === "success" && promotions.length === 0) return null;

  return (
    <section
      id="promotions"
      aria-labelledby="promotions-title"
      className="flex flex-col gap-3"
    >
      <h2
        id="promotions-title"
        className="font-display text-xl font-semibold text-midnight"
      >
        {t("promotions.title")}
      </h2>
      {body}
    </section>
  );
}
