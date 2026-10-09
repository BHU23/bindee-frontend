import type { FareFlowState, LegSelection } from "./booking";

/** Router state sent to passenger-info once the return fare is chosen. */
export interface RoundTripFlowState extends FareFlowState {
  inbound: LegSelection;
}
