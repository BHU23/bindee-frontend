import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { RESULTS_PATH } from "@/lib/routes";
import { createSearch } from "../api/flightResultsApi";
import { filtersToParams } from "../lib/filters";
import type { FlightFilters, SearchQueryDto } from "../types/flightResults";

export interface UseSearchSwitchReturn {
  isBusy: boolean;
  failed: boolean;
  /** Creates a new search from `query` and replaces the `searchId` in the URL. */
  start: (query: SearchQueryDto) => Promise<void>;
}

/** Shared by the day switch and "search again": a new search, then the results URL is replaced. */
export function useSearchSwitch(filters: FlightFilters): UseSearchSwitchReturn {
  const navigate = useNavigate();
  const [isBusy, setIsBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = useCallback(
    async (query: SearchQueryDto) => {
      setIsBusy(true);
      setFailed(false);
      try {
        const { searchId } = await createSearch(query);
        // The price bounds belong to the old day, so only the other filters carry over.
        const params = filtersToParams({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
        });
        params.set("searchId", searchId);
        navigate(`${RESULTS_PATH}?${params.toString()}`, { replace: true });
      } catch {
        setFailed(true);
      } finally {
        setIsBusy(false);
      }
    },
    [filters, navigate],
  );

  return { isBusy, failed, start };
}
