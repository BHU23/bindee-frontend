import type { FlightFilters, PriceRangeDto } from "../../types/flightResults";

export interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FlightFilters;
  /** Slider bounds: the min/max price of the unfiltered results. */
  priceRange: PriceRangeDto;
  onApply: (filters: FlightFilters) => void;
}
