import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-sm border px-4 py-3 text-left text-sm break-words has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        info: "border-iris/30 bg-iris-mist text-midnight",
        warning: "border-warning/40 bg-sunset-tint text-sunset-deep",
        destructive: "border-destructive/40 bg-card text-destructive",
        success: "border-success/40 bg-card text-success",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

interface AlertProps
  extends
    Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
}

function Alert({
  className,
  variant,
  title,
  icon,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon}
      {title && (
        <div className="font-medium group-has-[>svg]/alert:col-start-2">
          {title}
        </div>
      )}
      {children && (
        <div className="text-sm group-has-[>svg]/alert:col-start-2">
          {children}
        </div>
      )}
    </div>
  );
}

export { Alert };
export type { AlertProps };
