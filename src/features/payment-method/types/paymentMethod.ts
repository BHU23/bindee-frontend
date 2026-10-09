export type PaymentMethod = "CARD" | "PROMPTPAY_QR" | "MOBILE_BANKING";

/**
 * Router state handed over by review-hold once the booking exists
 * (a minimal local view: features never import each other).
 */
export interface PaymentFlowState {
  pnr: string;
  /** UTC ISO string; the countdown is driven by it. */
  holdExpiresAt: string;
  /** Booking total in THB. */
  total: number;
}

/** Body of `PUT /bookings/:pnr/payment-method` (specs/payment-method.md). The bank is chosen later. */
export interface SaveMethodBody {
  method: PaymentMethod;
}

/** `200` response of `PUT /bookings/:pnr/payment-method`. */
export interface SaveMethodResponse {
  method: PaymentMethod;
  /** In-app page of the chosen method, e.g. `/pay/card`. */
  next: string;
}

/** Body of `POST /bookings/:pnr/payments` (specs/mock-payment.md). */
export type StartPaymentBody = SaveMethodBody;

/** `201` response of `POST /bookings/:pnr/payments`. */
export interface PaymentResponse {
  paymentId: string;
  status: "PENDING";
  amount: number;
  currency: "THB";
  /** UTC ISO string. */
  expiresAt: string;
  mockRef: string;
}
