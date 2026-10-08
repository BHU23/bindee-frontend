import type {
  FlightCardDto,
  FlightResultsResponse,
  SearchQueryDto,
} from "../types/flightResults";

export const queryFixture: SearchQueryDto = {
  tripType: "ONE_WAY",
  origin: "BKK",
  destination: "CNX",
  departDate: "2026-10-14",
  adults: 2,
  children: 0,
  infants: 0,
  cabin: "ECONOMY",
};

export const flightsFixture: FlightCardDto[] = [
  {
    flightId: "f1",
    flightNo: "BD101",
    from: "BKK",
    to: "CNX",
    depart: "2026-10-14T00:30:00.000Z",
    arrive: "2026-10-14T01:45:00.000Z",
    duration: 75,
    stops: 0,
    fromPricePerPax: 1190,
    seatsLeft: 3,
    lowest: true,
  },
  {
    flightId: "f2",
    flightNo: "BD205",
    from: "BKK",
    to: "CNX",
    depart: "2026-10-14T05:00:00.000Z",
    arrive: "2026-10-14T07:10:00.000Z",
    duration: 130,
    stops: 1,
    fromPricePerPax: 1490,
    seatsLeft: 9,
    lowest: false,
  },
];

export const resultsFixture: FlightResultsResponse = {
  query: queryFixture,
  flights: flightsFixture,
  priceRange: { min: 1190, max: 3200 },
  calendar: [
    { date: "2026-10-11", lowestFare: 1390, seatsLeft: 20, soldOut: false },
    { date: "2026-10-12", lowestFare: null, seatsLeft: 0, soldOut: true },
    { date: "2026-10-13", lowestFare: 1290, seatsLeft: 14, soldOut: false },
    { date: "2026-10-14", lowestFare: 1190, seatsLeft: 12, soldOut: false },
    { date: "2026-10-15", lowestFare: 1250, seatsLeft: 6, soldOut: false },
    { date: "2026-10-16", lowestFare: 1500, seatsLeft: 30, soldOut: false },
    { date: "2026-10-17", lowestFare: 1450, seatsLeft: 2, soldOut: false },
  ],
  searchedAt: "2026-10-07T10:00:00.000Z",
  expiresAt: "2026-10-07T10:20:00.000Z",
};

export const emptyResultsFixture: FlightResultsResponse = {
  ...resultsFixture,
  flights: [],
};
