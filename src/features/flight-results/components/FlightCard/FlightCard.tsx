import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBaht } from "@/lib/format";
import { formatAirportTime, splitDuration } from "../../lib/time";
import type { FlightCardProps } from "./FlightCard.types";

const SEATS_LEFT_HINT_MAX = 5;

/** One result: times are shown in each airport's own timezone. */
export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const { t } = useTranslation("flightResults");
  const { t: tf } = useTranslation("fareSelection");
  const { hours, minutes } = splitDuration(flight.duration);
  const duration =
    hours === 0
      ? t("card.durationMinutesOnly", { minutes })
      : minutes === 0
        ? t("card.durationHoursOnly", { hours })
        : t("card.duration", { hours, minutes });
  const showSeats =
    flight.seatsLeft !== undefined && flight.seatsLeft <= SEATS_LEFT_HINT_MAX;

  return (
    <Card className="gap-3 px-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold text-midnight">
          {flight.flightNo}
        </span>
        {flight.lowest && <Badge variant="lowest">{t("card.lowest")}</Badge>}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-display text-2xl font-bold text-midnight tabular-nums">
            {formatAirportTime(flight.depart, flight.from)}
          </span>
          <span className="text-sm text-muted-foreground">{flight.from}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center text-xs text-muted-foreground">
          <span>{duration}</span>
          <span aria-hidden="true">────</span>
          <span>
            {flight.stops === 0
              ? t("card.nonstop")
              : t("card.stops", { count: flight.stops })}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-display text-2xl font-bold text-midnight tabular-nums">
            {formatAirportTime(flight.arrive, flight.to)}
          </span>
          <span className="text-sm text-muted-foreground">{flight.to}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-base font-semibold text-foreground">
          {t("card.price", { price: formatBaht(flight.fromPricePerPax) })}
        </span>
        {showSeats && (
          <span className="text-sm font-medium text-sunset-deep">
            {t("card.seatsLeft", { count: flight.seatsLeft })}
          </span>
        )}
      </div>
      {onSelect && (
        <Button onClick={() => onSelect(flight)}>{tf("select")}</Button>
      )}
    </Card>
  );
}
