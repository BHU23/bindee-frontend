import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SORT_KEYS } from "../../lib/filters";
import type { SortControlProps } from "./SortControl.types";

export function SortControl({ value, onChange }: SortControlProps) {
  const { t } = useTranslation("flightResults");
  return (
    <div role="group" aria-label={t("sort.label")} className="flex gap-2">
      {SORT_KEYS.map((key) => (
        <Button
          key={key}
          variant="outline"
          aria-pressed={key === value}
          className={cn(key === value && "border-midnight bg-iris-mist")}
          onClick={() => onChange(key)}
        >
          {t(`sort.${key}`)}
        </Button>
      ))}
    </div>
  );
}
