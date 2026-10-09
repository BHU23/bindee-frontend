import type {
  PassengerFlowState,
  PassengersResponse,
} from "../types/passengerInfo";

export const flowFixture: PassengerFlowState = {
  searchId: "s1",
  draftId: "d1",
  query: { adults: 2, children: 1, infants: 1, departDate: "2026-10-14" },
  outbound: { total: 9000 },
};

export const singleAdultFlow: PassengerFlowState = {
  ...flowFixture,
  query: { adults: 1, children: 0, infants: 0, departDate: "2026-10-14" },
  outbound: { total: 1190 },
};

export const roundTripFlow: PassengerFlowState = {
  ...singleAdultFlow,
  outbound: { total: 1190 },
  inbound: { total: 1800 },
};

export const savedFixture: PassengersResponse = {
  passengers: [
    {
      type: "adult",
      title: "Mr",
      firstName: "SOMCHAI",
      lastName: "JAIDEE",
      dob: "1990-05-01",
      gender: "M",
      nationality: "TH",
      hasPassport: false,
    },
  ],
  contact: {
    name: "Somchai Jaidee",
    email: "som@example.com",
    phone: "+66812345678",
  },
  consent: { privacy: true, marketing: false },
};

export const emptySaved: PassengersResponse = { passengers: [] };
