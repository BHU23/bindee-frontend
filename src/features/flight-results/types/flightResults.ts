import type { SearchQueryDto } from "@/types/search";

export type { CreateSearchResponse, SearchQueryDto } from "@/types/search";

export type DepartureBand = "morning" | "afternoon" | "evening" | "night";
export type FareFamily = "LITE" | "VALUE" | "FLEX";
export type SortKey = "price" | "departure" | "duration";
export type Leg = "outbound" | "return";

export interface FlightFilters {
  departure: DepartureBand[];
  directOnly: boolean;
  /** Undefined until the guest narrows the slider away from the `priceRange` bound. */
  minPrice?: number;
  maxPrice?: number;
  fare: FareFamily[];
  sort: SortKey;
}

/** Contract of `GET /api/v1/searches/:searchId/flights` (specs/flight-results.md). */
export interface FlightCardDto {
  flightId: string;
  flightNo: string;
  from: string;
  to: string;
  /** UTC ISO string. */
  depart: string;
  /** UTC ISO string. */
  arrive: string;
  /** Minutes. */
  duration: number;
  stops: number;
  fromPricePerPax: number;
  seatsLeft?: number;
  lowest: boolean;
}

export interface PriceRangeDto {
  min: number;
  max: number;
}

export interface CalendarDayDto {
  date: string;
  lowestFare: number | null;
  seatsLeft: number;
  soldOut: boolean;
}

export interface FlightResultsResponse {
  query: SearchQueryDto;
  flights: FlightCardDto[];
  priceRange: PriceRangeDto;
  calendar: CalendarDayDto[];
  searchedAt: string;
  expiresAt: string;
}
