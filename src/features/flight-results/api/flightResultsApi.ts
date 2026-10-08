import { apiClient } from "@/services/apiClient";
import { filtersToParams } from "../lib/filters";
import type {
  CreateSearchResponse,
  FlightFilters,
  FlightResultsResponse,
  Leg,
  SearchQueryDto,
} from "../types/flightResults";

export function getFlights(
  searchId: string,
  filters: FlightFilters,
  signal?: AbortSignal,
  leg: Leg = "outbound",
): Promise<FlightResultsResponse> {
  const params = filtersToParams(filters);
  params.set("leg", leg);
  return apiClient.request<FlightResultsResponse>(
    `/searches/${encodeURIComponent(searchId)}/flights?${params.toString()}`,
    { signal },
  );
}

/** Day switch: same criteria, new `departDate` (the results endpoint has no date parameter). */
export function createSearch(
  query: SearchQueryDto,
  signal?: AbortSignal,
): Promise<CreateSearchResponse> {
  return apiClient.request<CreateSearchResponse>("/searches", {
    method: "POST",
    body: query,
    signal,
  });
}
