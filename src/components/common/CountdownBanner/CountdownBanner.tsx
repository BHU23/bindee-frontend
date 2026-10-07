import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Icon } from "../Icon";
import type { CountdownBannerProps } from "./CountdownBanner.types";

export const URGENT_BELOW_SECONDS = 180;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Seat hold timer. Calm wording; under 3 minutes it switches to the solid warning style. */
export function CountdownBanner({
  minutes,
  seconds = 0,
  pnr,
}: CountdownBannerProps) {
  const { t } = useTranslation();
  const isUrgent = minutes * 60 + seconds < URGENT_BELOW_SECONDS;
  const time = `${pad(minutes)}:${pad(seconds)}`;

  return (
    <div
      role="timer"
      data-urgent={isUrgent || undefined}
      className={cn(
        "flex items-start gap-3 rounded-sm px-4 py-3 text-sm break-words",
        isUrgent
          ? "bg-warning text-primary-foreground"
          : "bg-iris-mist text-midnight",
      )}
    >
      <Icon name="clock" />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium tabular-nums">
          {t(isUrgent ? "countdown.urgent" : "countdown.calm", { time })}
        </p>
        {pnr && (
          <p className="text-xs tabular-nums">{t("countdown.pnr", { pnr })}</p>
        )}
      </div>
    </div>
  );
}
