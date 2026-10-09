/** Flight-results route, shared so features navigate to it without importing each other. */
export const RESULTS_PATH = "/flights";
/** Return-flight list of a round trip (fare-selection). Router state: `FareFlowState`. */
export const RETURN_FLIGHTS_PATH = "/booking/return";
/** Passenger-info (a later spec); fare-selection navigates here after the last leg. */
export const PASSENGERS_PATH = "/booking/passengers";
/** Static demo privacy policy (passenger-info); also shown in a Sheet next to the consent checkbox. */
export const PRIVACY_PATH = "/privacy";
/** Review & hold (review-hold); passenger-info navigates here after saving. Router state: `ReviewFlowState`. */
export const REVIEW_PATH = "/booking/review";
/** Payment method (payment-method); review-hold navigates here after the booking is created. Router state: `PaymentFlowState`. */
export const PAYMENT_METHOD_PATH = "/booking/payment";
/** Mock card page (mock-payment); payment-method navigates here with `?paymentId=` and router state `CardFlowState`. */
export const PAY_CARD_PATH = "/pay/card";
/** Booking confirmation (ticketing-confirmation, not built yet: shows the not-found page until then). */
export function confirmationPath(pnr: string): string {
  return `/bookings/${encodeURIComponent(pnr)}/confirmation`;
}
