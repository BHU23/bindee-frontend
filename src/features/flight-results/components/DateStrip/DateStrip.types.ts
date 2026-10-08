export interface DateStripDay {
  /** `YYYY-MM-DD`. */
  date: string;
  label: string;
  price?: string;
  /** Extra line under the price, e.g. seats left. */
  note?: string;
  lowest?: boolean;
  soldOut?: boolean;
}

export interface DateStripProps {
  days: DateStripDay[];
  value?: string;
  /** Locks every tile while a day switch is in flight. */
  disabled?: boolean;
  onValueChange?: (date: string) => void;
}
