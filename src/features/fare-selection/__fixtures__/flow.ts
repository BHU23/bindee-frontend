import {
  flightsFixture,
  queryFixture,
} from "@/features/flight-results/__fixtures__/flightResults";
import type { FareFlowState, LegSelection } from "../types/booking";

export const outboundFixture: LegSelection = {
  flight: flightsFixture[0],
  fareFamily: "VALUE",
  total: 3000,
};

export const newOutboundFixture: LegSelection = {
  flight: flightsFixture[1],
  fareFamily: "LITE",
  total: 2000,
};

export const returnFlightsFixture = [
  {
    ...flightsFixture[0],
    flightId: "r1",
    flightNo: "BD102",
    from: "CNX",
    to: "BKK",
  },
  {
    ...flightsFixture[1],
    flightId: "r2",
    flightNo: "BD206",
    from: "CNX",
    to: "BKK",
  },
];

export const flowFixture: FareFlowState = {
  searchId: "s1",
  draftId: "d1",
  query: { ...queryFixture, tripType: "ROUND_TRIP", returnDate: "2026-10-18" },
  outbound: outboundFixture,
};

export const returnSelectionFixture: LegSelection = {
  flight: returnFlightsFixture[0],
  fareFamily: "LITE",
  total: 1800,
};
