import { apiClient } from "@/services/apiClient";
import type {
  CreateSearchResponse,
  PopularRouteResponse,
  PromotionResponse,
  RecentSearchResponse,
  SearchQueryDto,
} from "../types/homeSearch";

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

export function getRecentSearches(
  signal?: AbortSignal,
): Promise<RecentSearchResponse[]> {
  return apiClient.request<RecentSearchResponse[]>("/searches/recent", {
    signal,
  });
}

export function getPopularRoutes(
  signal?: AbortSignal,
): Promise<PopularRouteResponse[]> {
  return apiClient.request<PopularRouteResponse[]>("/routes/popular", {
    signal,
  });
}

export function getPromotions(
  signal?: AbortSignal,
): Promise<PromotionResponse[]> {
  return apiClient.request<PromotionResponse[]>("/promotions", { signal });
}
