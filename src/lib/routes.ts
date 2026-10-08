/** Flight-results route, shared so features navigate to it without importing each other. */
export const RESULTS_PATH = "/flights";
/** Return-flight list of a round trip (fare-selection). Router state: `FareFlowState`. */
export const RETURN_FLIGHTS_PATH = "/booking/return";
/** Passenger-info (a later spec); fare-selection navigates here after the last leg. */
export const PASSENGERS_PATH = "/booking/passengers";
/** Static demo privacy policy (passenger-info); also shown in a Sheet next to the consent checkbox. */
export const PRIVACY_PATH = "/privacy";
