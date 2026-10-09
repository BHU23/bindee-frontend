import { useId, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { th } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DatePickerFieldProps } from "./DatePickerField.types";

const VALUE_FORMAT = "yyyy-MM-dd";
const DISPLAY_FORMAT = "dd/MM/yyyy";

function toDate(day: string): Date | undefined {
  return day ? new Date(`${day}T00:00:00`) : undefined;
}

/** Date field: a button showing dd/mm/yyyy that opens a Thai calendar with month and year dropdowns. Value is YYYY-MM-DD. */
export function DatePickerField({
  label,
  placeholder,
  value,
  onValueChange,
  onBlur,
  hint,
  error,
  disabled,
  startMonth,
  endMonth,
  disabledDays,
  defaultMonth,
  id,
}: DatePickerFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const labelId = `${fieldId}-label`;
  const valueId = `${fieldId}-value`;
  const helpId = `${fieldId}-help`;
  const help = error ?? hint;
  const [isOpen, setIsOpen] = useState(false);
  const selected = toDate(value);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) onBlur?.();
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="text-[13px] font-medium text-foreground">
        {label}
      </span>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          id={fieldId}
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={help ? helpId : undefined}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-sm border border-control-border bg-card px-4 text-left text-[15px] transition-colors outline-none focus-visible:border-iris focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            !selected && "text-muted-foreground",
          )}
        >
          <CalendarIcon
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
          />
          <span id={valueId} className="min-w-0 break-words">
            {selected ? format(selected, DISPLAY_FORMAT) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            locale={th}
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? defaultMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={disabledDays}
            onSelect={(day) => {
              if (!day) return;
              onValueChange(format(day, VALUE_FORMAT));
              handleOpenChange(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {help && (
        <p
          id={helpId}
          className={cn(
            "text-xs break-words",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {help}
        </p>
      )}
    </div>
  );
}
