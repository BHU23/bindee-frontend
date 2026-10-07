import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

type SelectOption = string | { value: string; label: string };

interface SelectProps extends Omit<React.ComponentProps<"select">, "children"> {
  label?: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
}

/** Native select with the Input styling: reliable on mobile keyboards and screen readers. */
function Select({
  className,
  label,
  options,
  hint,
  error,
  id,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const helpId = `${selectId}-help`;
  const help = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[13px] font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          data-slot="select"
          aria-invalid={error ? true : undefined}
          aria-describedby={help ? helpId : undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-sm border border-control-border bg-card pr-10 pl-4 text-[15px] outline-none focus-visible:border-iris focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
            className,
          )}
          {...props}
        >
          {options.map((option) => {
            const { value, label: text } =
              typeof option === "string"
                ? { value: option, label: option }
                : option;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
      </div>
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

export { Select };
export type { SelectOption, SelectProps };
