import type { PaymentFlowState } from "../types/paymentMethod";

/** Narrows the router state; a missing or malformed state means the guest did not come through the booking. */
export function isPaymentFlow(state: unknown): state is PaymentFlowState {
  if (typeof state !== "object" || state === null) return false;
  const flow = state as Partial<PaymentFlowState>;
  return (
    typeof flow.pnr === "string" &&
    flow.pnr !== "" &&
    typeof flow.holdExpiresAt === "string" &&
    typeof flow.total === "number"
  );
}
