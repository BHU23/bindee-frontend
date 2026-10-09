import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import type { PassengersSectionProps } from "./PassengersSection.types";

/** Passenger names with an edit link back to the passenger screen (UI-RH-01). */
export function PassengersSection({
  passengers,
  editTo,
  editState,
}: PassengersSectionProps) {
  const { t } = useTranslation("reviewHold");
  return (
    <Card role="group" aria-labelledby="review-passengers">
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="review-passengers"
            className="font-display text-[17px] font-semibold text-midnight"
          >
            {t("passengers.title")}
          </h2>
          <Link
            to={editTo}
            state={editState}
            aria-label={t("passengers.editLabel")}
            className="text-sm text-iris underline-offset-4 hover:underline"
          >
            {t("edit")}
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {passengers.map((p, index) => (
            <li key={index} className="flex flex-col break-words">
              <span className="font-medium">
                {p.title} {p.firstName} {p.lastName}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(`passengers.type.${p.type}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
