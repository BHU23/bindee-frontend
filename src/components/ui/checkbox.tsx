import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "cn";
import { CheckIcon } from "lucide-react";

interface CheckboxProps extends Omit<CheckboxPrimitive.Root.Props, "children"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

function Checkbox({
  className,
  label,
  description,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = `${checkboxId}-description`;

  return (
    <div className="flex items-start gap-3">
      <CheckboxPrimitive.Root
        id={checkboxId}
        data-slot="checkbox"
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border border-control-border bg-card transition-colors outline-none after:absolute after:-inset-2.5 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current"
        >
          <CheckIcon className="size-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="flex flex-col gap-0.5 break-words">
        <label htmlFor={checkboxId} className="text-[15px] text-foreground">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export { Checkbox };
export type { CheckboxProps };
