import type { ReviewLeg } from "../../types/reviewHold";

export interface ItinerarySectionProps {
  outbound: ReviewLeg;
  /** Present for round trips. */
  inbound?: ReviewLeg;
  /** Where the edit link goes (back to the results of the same search). */
  editTo: string;
}
