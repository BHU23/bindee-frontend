import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "cn";

interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Pill segmented control (active = midnight) for 2–3 mutually exclusive choices. */
function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(next) => onValueChange?.(String(next))}
      className={className}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className="inline-flex w-fit items-center gap-1 rounded-full bg-white/70 p-1"
      >
        {items.map((item) => (
          <TabsPrimitive.Tab
            key={item.value}
            value={item.value}
            data-slot="tabs-trigger"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full px-5 font-display text-[15px] font-semibold whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 data-active:bg-midnight data-active:text-primary-foreground",
            )}
          >
            {item.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export { Tabs };
export type { TabItem, TabsProps };
