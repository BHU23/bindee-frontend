export type FareFamily = "LITE" | "VALUE" | "FLEX";
export type PassengerType = "adult" | "child" | "infant";

/** The part of a chosen flight the review shows (a local view of the fare-selection state). */
export interface ReviewFlight {
  flightNo: string;
  from: string;
  to: string;
  /** UTC ISO string. */
  depart: string;
  /** UTC ISO string. */
  arrive: string;
}

export interface ReviewLeg {
  flight: ReviewFlight;
  fareFamily: FareFamily;
  /** Party total in THB. */
  total: number;
}

export interface ReviewPassenger {
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
}

/**
 * Router state handed over by passenger-info once the passengers are saved
 * (a minimal local view: features never import each other).
 */
export interface ReviewFlowState {
  searchId: string;
  draftId: string;
  outbound: ReviewLeg;
  inbound?: ReviewLeg;
  passengers: ReviewPassenger[];
}

/** Body of `POST /bookings` (specs/review-hold.md). */
export interface CreateBookingBody {
  draftId: string;
  acceptTerms: true;
  expectedTotal: number;
}

/** `201` response of `POST /bookings`. */
export interface BookingResponse {
  pnr: string;
  status: "PENDING_PAYMENT";
  /** UTC ISO string; the countdown is driven by it. */
  holdExpiresAt: string;
  total: number;
}
