import type { ResourceStatus } from "../../hooks/useAsyncResource";
import type { PopularRoute } from "../../types/homeSearch";

export interface PopularRoutesProps {
  routes: PopularRoute[];
  status: ResourceStatus;
  onRetry: () => void;
  onSelect: (route: PopularRoute) => void;
}
