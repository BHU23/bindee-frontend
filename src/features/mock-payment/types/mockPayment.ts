/**
 * Router state handed over by payment-method once the payment exists
 * (a minimal local view: features never import each other).
 */
export interface CardFlowState {
  pnr: string;
  /** UTC ISO string; the countdown is driven by it. */
  holdExpiresAt: string;
  /** Payment amount in THB. */
  amount: number;
  /** Mock payment reference shown to the guest. */
  mockRef: string;
}

export type CardField = "cardNumber" | "expiry" | "cvv";

/** What the guest typed; all strings exactly as shown in the inputs. */
export interface CardFormValues {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

export type CardFieldErrors = Partial<Record<CardField, string>>;

export type CardOutcome = "SUCCESS" | "DECLINED" | "TIMEOUT";

export interface TestCard {
  number: string;
  outcome: CardOutcome;
}

/** Body of `POST /payments/:paymentId/card` (specs/mock-payment.md). */
export interface CardPaymentBody {
  cardNumber: string;
  name?: string;
  expiry?: string;
  cvv?: string;
}

export type CardFailureCode = "MOCK_DECLINED" | "MOCK_TIMEOUT";

/** `200` response of `POST /payments/:paymentId/card`. */
export type CardPaymentResponse =
  | { paymentId: string; status: "SUCCESS" }
  | { paymentId: string; status: "FAILED"; failureCode: CardFailureCode };
