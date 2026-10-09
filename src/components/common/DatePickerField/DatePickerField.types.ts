import type { Matcher } from "react-day-picker";

export interface DatePickerFieldProps {
  label: string;
  /** Shown while no day is chosen. */
  placeholder: string;
  /** YYYY-MM-DD, or "" when no day is chosen. */
  value: string;
  onValueChange: (day: string) => void;
  /** Called when the calendar closes, so the parent can validate the field. */
  onBlur?: () => void;
  hint?: string;
  error?: string;
  /** Disables the whole field. */
  disabled?: boolean;
  /** First month the dropdowns and arrows can reach. */
  startMonth?: Date;
  /** Last month the dropdowns and arrows can reach. */
  endMonth?: Date;
  /** Days that cannot be picked, e.g. `{ after: today }`. */
  disabledDays?: Matcher | Matcher[];
  /** Month shown when no day is chosen yet. */
  defaultMonth?: Date;
  id?: string;
}
