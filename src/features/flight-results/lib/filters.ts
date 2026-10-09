import type {
  DepartureBand,
  FareFamily,
  FlightFilters,
  PriceRangeDto,
  SortKey,
} from "../types/flightResults";

export const DEPARTURE_BANDS: readonly DepartureBand[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];
export const FARE_FAMILIES: readonly FareFamily[] = ["LITE", "VALUE", "FLEX"];
export const SORT_KEYS: readonly SortKey[] = ["price", "departure", "duration"];

export const DEFAULT_FILTERS: FlightFilters = {
  departure: [],
  directOnly: false,
  fare: [],
  sort: "price",
};

function parseList<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T[] {
  const wanted = new Set((raw ?? "").split(","));
  return allowed.filter((value) => wanted.has(value));
}

function parsePrice(raw: string | null): number | undefined {
  if (raw === null || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Filters live in the URL so a reload or a shared link keeps them; unknown values are dropped. */
export function parseFilters(params: URLSearchParams): FlightFilters {
  const sort = params.get("sort");
  return {
    departure: parseList(params.get("departure"), DEPARTURE_BANDS),
    directOnly: params.get("directOnly") === "true",
    minPrice: parsePrice(params.get("minPrice")),
    maxPrice: parsePrice(params.get("maxPrice")),
    fare: parseList(params.get("fare"), FARE_FAMILIES),
    sort: SORT_KEYS.find((key) => key === sort) ?? DEFAULT_FILTERS.sort,
  };
}

/** Only non-default filters are written, so the URL and the API query stay short. */
export function filtersToParams(filters: FlightFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.departure.length > 0)
    params.set("departure", filters.departure.join(","));
  if (filters.directOnly) params.set("directOnly", "true");
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.fare.length > 0) params.set("fare", filters.fare.join(","));
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  return params;
}

/** Number of filter groups in use; sort is not a filter. */
export function countActiveFilters(filters: FlightFilters): number {
  return [
    filters.departure.length > 0,
    filters.directOnly,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.fare.length > 0,
  ].filter(Boolean).length;
}

/** A price equal to the slider bound is "not filtered": drop it so it is not sent or counted. */
export function normalizePrices(
  filters: FlightFilters,
  range: PriceRangeDto,
): FlightFilters {
  return {
    ...filters,
    minPrice:
      filters.minPrice === undefined || filters.minPrice <= range.min
        ? undefined
        : filters.minPrice,
    maxPrice:
      filters.maxPrice === undefined || filters.maxPrice >= range.max
        ? undefined
        : filters.maxPrice,
  };
}
