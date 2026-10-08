import type { LegSelection } from "../../types/booking";

export interface TripTotalFooterProps {
  /** Chosen legs in trip order: outbound only, or outbound then return. */
  selections: LegSelection[];
}
