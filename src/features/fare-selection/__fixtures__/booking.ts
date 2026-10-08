import { flightsFixture } from "@/features/flight-results/__fixtures__/flightResults";
import type {
  FareDetailDto,
  FaresResponse,
  LegSelection,
} from "../types/booking";

export const outboundFlight = flightsFixture[0];
export const returnFlight = {
  ...flightsFixture[0],
  flightId: "r1",
  flightNo: "BD102",
  from: "CNX",
  to: "BKK",
};

export const faresFixture: FaresResponse = {
  flightId: "f1",
  fares: [
    {
      family: "LITE",
      perAdult: 1190,
      perChild: 1190,
      perInfant: 300,
      total: 2380,
      cabinBagKg: 7,
      checkedBagKg: 0,
      changeAllowed: false,
      changeFee: 0,
      refundAllowed: false,
      refundFee: 0,
      seatIncluded: false,
    },
    {
      family: "VALUE",
      perAdult: 1490,
      perChild: 1490,
      perInfant: 300,
      total: 2980,
      cabinBagKg: 7,
      checkedBagKg: 20,
      changeAllowed: true,
      changeFee: 500,
      refundAllowed: false,
      refundFee: 0,
      seatIncluded: true,
    },
    {
      family: "FLEX",
      perAdult: 1990,
      perChild: 1990,
      perInfant: 300,
      total: 3980,
      cabinBagKg: 7,
      checkedBagKg: 30,
      changeAllowed: true,
      changeFee: 0,
      refundAllowed: true,
      refundFee: 200,
      seatIncluded: true,
    },
  ] satisfies FareDetailDto[],
};

export const outboundSelection: LegSelection = {
  flight: outboundFlight,
  fareFamily: "VALUE",
  total: 2980,
};

export const returnSelection: LegSelection = {
  flight: returnFlight,
  fareFamily: "LITE",
  total: 2380,
};
