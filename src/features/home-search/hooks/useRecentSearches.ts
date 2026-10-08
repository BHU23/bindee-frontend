import { useMemo } from "react";
import { getRecentSearches } from "../api/searchApi";
import type { RecentSearch, RecentSearchResponse } from "../types/homeSearch";
import {
  useAsyncResource,
  type ResourceStatus,
} from "@/hooks/useAsyncResource";

export interface UseRecentSearchesReturn {
  searches: RecentSearch[];
  status: ResourceStatus;
}

export function toRecentSearch(dto: RecentSearchResponse): RecentSearch {
  return {
    id: dto.id,
    query: {
      tripType: dto.tripType,
      origin: dto.route.origin,
      destination: dto.route.destination,
      departDate: dto.dates.depart,
      ...(dto.dates.return ? { returnDate: dto.dates.return } : {}),
      adults: dto.pax.adults,
      children: dto.pax.children,
      infants: dto.pax.infants,
      cabin: dto.cabin,
    },
  };
}

/** A failed load is treated as "no recents": the section is optional, so it never blocks Home. */
export function useRecentSearches(): UseRecentSearchesReturn {
  const { data, status } = useAsyncResource(getRecentSearches);
  const searches = useMemo(() => (data ?? []).map(toRecentSearch), [data]);
  return { searches, status };
}
