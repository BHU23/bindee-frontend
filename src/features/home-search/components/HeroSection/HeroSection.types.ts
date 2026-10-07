import type { ResourceStatus } from "../../hooks/useAsyncResource";
import type { PopularRoute } from "../../types/homeSearch";

export interface HeroSectionProps {
  /** The cheapest-to-show route for the price card; the card is hidden without one. */
  route: PopularRoute | undefined;
  status: ResourceStatus;
}
