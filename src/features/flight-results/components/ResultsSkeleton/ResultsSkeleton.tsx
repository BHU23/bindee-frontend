import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

const SKELETON_COUNT = 3;

function Bar({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-sm bg-iris-mist motion-safe:animate-pulse ${className}`}
    />
  );
}

/** Same silhouette as FlightCard so nothing shifts when the list arrives. */
export function ResultsSkeleton() {
  const { t } = useTranslation("flightResults");
  return (
    <div
      role="status"
      aria-label={t("loading")}
      className="flex flex-col gap-3"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <Card
          key={index}
          data-slot="flight-card-skeleton"
          className="gap-3 px-4"
        >
          <Bar className="h-4 w-20" />
          <div className="flex items-center justify-between gap-3">
            <Bar className="h-10 w-16" />
            <Bar className="h-4 w-20" />
            <Bar className="h-10 w-16" />
          </div>
          <Bar className="h-5 w-48" />
        </Card>
      ))}
    </div>
  );
}
