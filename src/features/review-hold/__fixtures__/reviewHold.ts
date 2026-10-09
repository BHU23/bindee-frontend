import type {
  BookingResponse,
  ReviewFlowState,
  ReviewLeg,
} from "../types/reviewHold";

export const outboundLeg: ReviewLeg = {
  flight: {
    flightNo: "BD101",
    from: "BKK",
    to: "CNX",
    depart: "2026-10-14T00:30:00.000Z",
    arrive: "2026-10-14T01:45:00.000Z",
  },
  fareFamily: "VALUE",
  total: 1090,
};

export const inboundLeg: ReviewLeg = {
  flight: {
    flightNo: "BD102",
    from: "CNX",
    to: "BKK",
    depart: "2026-10-18T10:00:00.000Z",
    arrive: "2026-10-18T11:15:00.000Z",
  },
  fareFamily: "LITE",
  total: 690,
};

export const reviewFlow: ReviewFlowState = {
  searchId: "s1",
  draftId: "d1",
  outbound: outboundLeg,
  passengers: [
    { type: "adult", title: "Mr", firstName: "Somchai", lastName: "Jaidee" },
  ],
};

export const roundTripReviewFlow: ReviewFlowState = {
  ...reviewFlow,
  inbound: inboundLeg,
};

export const bookingFixture: BookingResponse = {
  pnr: "AB12CD",
  status: "PENDING_PAYMENT",
  holdExpiresAt: "2026-10-14T00:15:00.000Z",
  total: 1090,
};
