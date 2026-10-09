import type { LinkProps } from "react-router";
import type { ReviewPassenger } from "../../types/reviewHold";

export interface PassengersSectionProps {
  passengers: ReviewPassenger[];
  /** Edit link target (the passenger screen) and the router state it needs. */
  editTo: string;
  editState: LinkProps["state"];
}
