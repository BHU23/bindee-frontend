import { useMemo } from "react";
import { getPopularRoutes } from "../api/searchApi";
import type { PopularRoute, PopularRouteResponse } from "../types/homeSearch";
import { useAsyncResource, type ResourceStatus } from "./useAsyncResource";

export interface UsePopularRoutesReturn {
  routes: PopularRoute[];
  status: ResourceStatus;
  reload: () => void;
}

export function toPopularRoute(dto: PopularRouteResponse): PopularRoute {
  return {
    origin: dto.origin,
    destination: dto.destination,
    city: dto.city,
    fromPrice: dto.fromPricePerPax,
  };
}

export function usePopularRoutes(): UsePopularRoutesReturn {
  const { data, status, reload } = useAsyncResource(getPopularRoutes);
  const routes = useMemo(() => (data ?? []).map(toPopularRoute), [data]);
  return { routes, status, reload };
}
