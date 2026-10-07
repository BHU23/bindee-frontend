import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

/** Month grid with 44 px day cells; the selected day is a midnight pill, today an iris ring. */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("[--cell-size:--spacing(11)]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaults.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-(--cell-size) select-none aria-disabled:opacity-40",
          defaults.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-(--cell-size) select-none aria-disabled:opacity-40",
          defaults.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) font-display text-base font-semibold text-midnight",
          defaults.month_caption,
        ),
        caption_label: cn("select-none", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "flex-1 py-1 text-xs font-medium text-muted-foreground select-none",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "group/day relative size-(--cell-size) flex-1 p-0 text-center select-none",
          defaults.day,
        ),
        day_button: cn(
          "flex size-(--cell-size) w-full items-center justify-center rounded-full text-[15px] font-medium outline-none transition-colors hover:bg-iris-mist focus-visible:ring-3 focus-visible:ring-ring/40 group-data-[selected=true]/day:bg-midnight group-data-[selected=true]/day:text-primary-foreground group-data-[selected=true]/day:hover:bg-midnight group-data-[disabled=true]/day:pointer-events-none",
          defaults.day_button,
        ),
        today: cn(
          "[&>button]:ring-2 [&>button]:ring-iris/50 [&>button]:ring-inset",
          defaults.today,
        ),
        outside: cn("text-muted-foreground/60", defaults.outside),
        disabled: cn(
          "text-muted-foreground/40 line-through",
          defaults.disabled,
        ),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClass }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-5", iconClass)} />
          ) : (
            <ChevronRightIcon className={cn("size-5", iconClass)} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
