import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Icon } from "../Icon";
import type { CounterProps } from "./Counter.types";

export function Counter({
  label,
  description,
  value,
  defaultValue = 0,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  onChange,
}: CounterProps) {
  const { t } = useTranslation();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function handleChange(next: number) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 break-words">
        <p className="text-[15px] font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("counter.decrease", { label })}
          disabled={current <= min}
          onClick={() => handleChange(current - 1)}
        >
          <Icon name="minus" />
        </Button>
        <output
          aria-live="polite"
          className="min-w-6 text-center text-[17px] font-semibold tabular-nums"
        >
          {current}
        </output>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("counter.increase", { label })}
          disabled={current >= max}
          onClick={() => handleChange(current + 1)}
        >
          <Icon name="plus" />
        </Button>
      </div>
    </div>
  );
}
