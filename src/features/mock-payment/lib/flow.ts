import type { CardFlowState } from "../types/mockPayment";

/** Narrows the router state; a missing or malformed state means the guest did not come through payment-method. */
export function isCardFlow(state: unknown): state is CardFlowState {
  if (typeof state !== "object" || state === null) return false;
  const flow = state as Partial<CardFlowState>;
  return (
    typeof flow.pnr === "string" &&
    flow.pnr !== "" &&
    typeof flow.holdExpiresAt === "string" &&
    typeof flow.amount === "number" &&
    typeof flow.mockRef === "string"
  );
}
