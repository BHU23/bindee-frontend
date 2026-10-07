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
import { formatDateTh } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DateFieldProps } from "./DateField.types";

const DAY = "yyyy-MM-dd";

function toDate(day: string): Date | undefined {
  return day ? new Date(`${day}T00:00:00`) : undefined;
}

/** Date picker: a field that opens a Thai month calendar in a popover. */
export function DateField({
  label,
  placeholder,
  value,
  min,
  error,
  onChange,
}: DateFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const selected = toDate(value);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={id} className="text-[13px] font-medium text-foreground">
        {label}
      </span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          aria-labelledby={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-sm border border-control-border bg-card px-4 text-left text-[15px] transition-colors outline-none focus-visible:border-iris focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 break-words">
            {value ? formatDateTh(value) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            locale={th}
            selected={selected}
            defaultMonth={selected ?? toDate(min)}
            disabled={{ before: toDate(min) as Date }}
            onSelect={(day) => {
              if (!day) return;
              onChange(format(day, DAY));
              setIsOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p id={errorId} className="text-xs break-words text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
