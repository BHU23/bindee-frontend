import { useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SelectFieldOption, SelectFieldProps } from "./SelectField.types";

function toOption(option: string | SelectFieldOption): SelectFieldOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

/** Labelled shadcn Select with hint / error text; the error sets aria-invalid and stays under the field. */
export function SelectField({
  label,
  options,
  value,
  onValueChange,
  onBlur,
  hint,
  error,
  disabled,
  id,
  autoComplete,
  className,
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const labelId = `${fieldId}-label`;
  const helpId = `${fieldId}-help`;
  const help = error ?? hint;
  const items = options.map(toOption);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span id={labelId} className="text-[13px] font-medium text-foreground">
        {label}
      </span>
      <Select
        items={items}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        onValueChange={(next) => onValueChange?.(next ?? "")}
      >
        <SelectTrigger
          id={fieldId}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={help ? helpId : undefined}
          onBlur={onBlur}
          className={cn(value === "" && "text-muted-foreground")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
