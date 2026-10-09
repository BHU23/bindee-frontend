import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { formatDateTh } from "@/lib/format";
import { bangkokDay, formatBangkokTime } from "../../lib/itinerary";
import type { ReviewLeg } from "../../types/reviewHold";
import type { ItinerarySectionProps } from "./ItinerarySection.types";

function Leg({ title, leg }: { title: string; leg: ReviewLeg }) {
  const { t } = useTranslation("reviewHold");
  const { flight } = leg;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="font-medium tabular-nums">
        {flight.from} {formatBangkokTime(flight.depart)} → {flight.to}{" "}
        {formatBangkokTime(flight.arrive)}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDateTh(bangkokDay(flight.depart))} · {flight.flightNo} ·{" "}
        {t("itinerary.fareLabel", {
          family: t(`itinerary.fare.${leg.fareFamily}`),
        })}
      </p>
    </div>
  );
}

/** Outbound (and return) flight summary with an edit link (UI-RH-01). */
export function ItinerarySection({
  outbound,
  inbound,
  editTo,
}: ItinerarySectionProps) {
  const { t } = useTranslation("reviewHold");
  return (
    <Card role="group" aria-labelledby="review-itinerary">
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="review-itinerary"
            className="font-display text-[17px] font-semibold text-midnight"
          >
            {t("itinerary.title")}
          </h2>
          <Link
            to={editTo}
            aria-label={t("itinerary.editLabel")}
            className="text-sm text-iris underline-offset-4 hover:underline"
          >
            {t("edit")}
          </Link>
        </div>
        <Leg title={t("itinerary.outbound")} leg={outbound} />
        {inbound && <Leg title={t("itinerary.inbound")} leg={inbound} />}
      </div>
    </Card>
  );
}
