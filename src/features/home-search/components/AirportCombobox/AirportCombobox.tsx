import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import type {
  AirportComboboxProps,
  AirportOption,
} from "./AirportCombobox.types";

/** Searchable airport picker: type a city or code, or open the list. */
export function AirportCombobox({
  label,
  placeholder,
  options,
  value,
  error,
  onChange,
}: AirportComboboxProps) {
  const { t } = useTranslation();
  const id = useId();
  const errorId = `${id}-error`;
  const selected = options.find((option) => option.code === value) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <Combobox<AirportOption>
        items={options}
        value={selected}
        onValueChange={(next) => onChange(next?.code ?? "")}
        itemToStringLabel={(option) => option.label}
        isItemEqualToValue={(a, b) => a.code === b.code}
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <ComboboxContent>
          <ComboboxEmpty>{t("combobox.empty")}</ComboboxEmpty>
          <ComboboxList>
            {(option: AirportOption) => (
              <ComboboxItem key={option.code} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error && (
        <p id={errorId} className={cn("text-xs break-words text-destructive")}>
          {error}
        </p>
      )}
    </div>
  );
}
