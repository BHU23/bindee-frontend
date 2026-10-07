import { useMemo } from "react";
import { getPromotions } from "../api/searchApi";
import type { Promotion, PromotionResponse } from "../types/homeSearch";
import { useAsyncResource, type ResourceStatus } from "./useAsyncResource";

export interface UsePromotionsReturn {
  promotions: Promotion[];
  status: ResourceStatus;
  reload: () => void;
}

export function toPromotion(dto: PromotionResponse): Promotion {
  return {
    id: dto.id,
    title: dto.title,
    imageUrl: dto.imageUrl,
    origin: dto.route.origin,
    destination: dto.route.destination,
    promoCode: dto.promoCode,
    validUntil: dto.validUntil,
  };
}

export function usePromotions(): UsePromotionsReturn {
  const { data, status, reload } = useAsyncResource(getPromotions);
  const promotions = useMemo(() => (data ?? []).map(toPromotion), [data]);
  return { promotions, status, reload };
}
