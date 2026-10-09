import type { ResourceStatus } from "@/hooks/useAsyncResource";
import type { Promotion } from "../../types/homeSearch";

export interface PromotionListProps {
  promotions: Promotion[];
  status: ResourceStatus;
  onRetry: () => void;
}
