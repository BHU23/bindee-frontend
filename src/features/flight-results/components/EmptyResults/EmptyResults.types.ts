import type { CalendarDayDto } from "../../types/flightResults";

export interface EmptyResultsProps {
  calendar: CalendarDayDto[];
  /** The searched day; it is not offered as a nearby day. */
  selectedDate: string;
  /** Locks the nearby days while a day switch is in flight. */
  busy?: boolean;
  /** True when the empty list may be caused by the filters the guest set. */
  hasActiveFilters?: boolean;
  onSelectDay: (date: string) => void;
  onEditSearch: () => void;
  onResetFilters?: () => void;
}
