import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  hint?: string;
  error?: string;
}

function Input({
  className,
  type,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const help = error ?? hint;

  const field = (
    <InputPrimitive
      id={inputId}
      type={type}
      data-slot="input"
      aria-invalid={error ? true : undefined}
      aria-describedby={help ? helpId : undefined}
      className={cn(
        "h-11 w-full min-w-0 rounded-sm border border-control-border bg-card px-4 py-1 text-[15px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-iris focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );

  if (!label && !help) return field;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-foreground"
        >
          {label}
        </label>
      )}
      {field}
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

export { Input };
export type { InputProps };
