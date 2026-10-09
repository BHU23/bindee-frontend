import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Icon } from "../Icon";
import type { StepsProps } from "./Steps.types";

export function Steps({ steps, current }: StepsProps) {
  const { t } = useTranslation();
  return (
    <ol aria-label={t("steps.label")} className="flex w-full items-start gap-2">
      {steps.map((label, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "upcoming";
        return (
          <li
            key={label}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                state === "done" && "bg-iris text-primary-foreground",
                state === "current" && "bg-midnight text-primary-foreground",
                state === "upcoming" &&
                  "border border-control-border bg-card text-muted-foreground",
              )}
            >
              {state === "done" ? <Icon name="check" size={16} /> : index + 1}
            </span>
            <span
              className={cn(
                "text-xs break-words",
                state === "upcoming"
                  ? "text-muted-foreground"
                  : "font-medium text-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
