import type {
  PaymentFlowState,
  PaymentResponse,
  SaveMethodResponse,
} from "../types/paymentMethod";

export const paymentFlow: PaymentFlowState = {
  pnr: "AB12CD",
  holdExpiresAt: "2026-10-14T00:15:00.000Z",
  total: 1780,
};

export const savedCard: SaveMethodResponse = {
  method: "CARD",
  next: "/pay/card",
};

export const paymentFixture: PaymentResponse = {
  paymentId: "p1",
  status: "PENDING",
  amount: 1780,
  currency: "THB",
  expiresAt: "2026-10-14T00:15:00.000Z",
  mockRef: "MOCK-1",
};
