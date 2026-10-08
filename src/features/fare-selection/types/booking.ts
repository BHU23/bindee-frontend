import type {
  FlightCardDto,
  FareFamily,
} from "@/features/flight-results/types/flightResults";
import type { SearchQueryDto } from "@/types/search";

export type { FareFamily, FlightCardDto, SearchQueryDto };
export type BookingLeg = "outbound" | "return";

export interface PerPaxPrice {
  adult: number;
  child: number;
  infant: number;
}

/** One fare of `GET /api/v1/booking-drafts/:draftId/flights/:flightId/fares` (specs/fare-selection.v2.md, AC-FS-11). */
export interface FareDetailDto {
  family: FareFamily;
  /** Price per person incl. tax (THB). */
  perAdult: number;
  perChild: number;
  perInfant: number;
  /** Total for the whole party. */
  total: number;
  cabinBagKg: number;
  checkedBagKg: number;
  changeAllowed: boolean;
  changeFee: number;
  refundAllowed: boolean;
  refundFee: number;
  seatIncluded: boolean;
}

export interface FaresResponse {
  flightId: string;
  fares: FareDetailDto[];
}

export interface CreateDraftResponse {
  draftId: string;
}

/** Body of `PUT /outbound|/return` and `POST /outbound|/return/accept-price` on success. */
export interface SelectFareResponse {
  selection: { flightId: string; fareFamily: FareFamily };
  price: { total: number; perPax: PerPaxPrice };
}

export type PriceChangedReason = "PRICE_UPDATED" | "FARE_SOLD_OUT";

/** The `error` object of a `409 PRICE_CHANGED` response; read it from `ApiError.body`. */
export interface PriceChangedError {
  code: "PRICE_CHANGED";
  message: string;
  oldPrice: number;
  newPrice: number;
  /** newPrice - oldPrice (negative when cheaper). */
  diff: number;
  reason: PriceChangedReason;
  /** Present when reason is FARE_SOLD_OUT. */
  alternatives?: FlightCardDto[];
}

export interface ReturnFlightsResponse {
  flights: FlightCardDto[];
}

/** A chosen leg kept on the client so the footer can show the running total (UI-FS-07). */
export interface LegSelection {
  flight: FlightCardDto;
  fareFamily: FareFamily;
  /** Party total in THB from the select response. */
  total: number;
}

/**
 * Router state handed from the fare sheet to the next screen
 * (return flights for ROUND_TRIP, passenger-info for ONE_WAY).
 */
export interface FareFlowState {
  searchId: string;
  draftId: string;
  query: SearchQueryDto;
  outbound: LegSelection;
}
