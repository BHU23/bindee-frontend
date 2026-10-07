export type TripType = "ONE_WAY" | "ROUND_TRIP";
export type Cabin = "ECONOMY";

export interface SearchQueryDto {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
}

export interface CreateSearchResponse {
  searchId: string;
  expiresAt: string;
}

export interface RecentSearchResponse {
  id: string;
  tripType: TripType;
  route: { origin: string; destination: string };
  dates: { depart: string; return?: string };
  pax: { adults: number; children: number; infants: number };
  cabin: Cabin;
}

export interface PopularRouteResponse {
  origin: string;
  destination: string;
  city: string;
  fromPricePerPax: number | null;
}

export interface PromotionResponse {
  id: string;
  title: string;
  imageUrl: string;
  route: { origin: string; destination: string };
  promoCode: string;
  validUntil: string;
}

/** Form state: dates are empty strings until the guest picks them. */
export interface SearchFormValues {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
}

export type SearchFieldName =
  | "origin"
  | "destination"
  | "departDate"
  | "returnDate"
  | "adults"
  | "children"
  | "infants";

export type SearchFieldError =
  "required" | "sameAirport" | "pastDate" | "returnBeforeDepart" | "invalid";

export type SearchFormErrors = Partial<
  Record<SearchFieldName, SearchFieldError>
>;

export type SearchSubmitError = "inventoryUnavailable" | "network" | "unknown";

/** Mapped recent search: the query to refill the form plus display fields. */
export interface RecentSearch {
  id: string;
  query: SearchQueryDto;
}

export interface PopularRoute {
  origin: string;
  destination: string;
  city: string;
  /** Null when the route has no seats in the next 30 days. */
  fromPrice: number | null;
}

export interface Promotion {
  id: string;
  title: string;
  imageUrl: string;
  origin: string;
  destination: string;
  promoCode: string;
  validUntil: string;
}
