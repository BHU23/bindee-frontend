import { apiClient } from "@/services/apiClient";
import type {
  PaymentResponse,
  SaveMethodBody,
  SaveMethodResponse,
  StartPaymentBody,
} from "../types/paymentMethod";

function bookingPath(pnr: string): string {
  return `/bookings/${encodeURIComponent(pnr)}`;
}

/** Records the chosen method (idempotent PUT). Rejects with `ApiError` 409 `INVALID_STATE_TRANSITION` or 410 `HOLD_EXPIRED`. */
export function savePaymentMethod(
  pnr: string,
  body: SaveMethodBody,
  signal?: AbortSignal,
): Promise<SaveMethodResponse> {
  return apiClient.request<SaveMethodResponse>(
    `${bookingPath(pnr)}/payment-method`,
    { method: "PUT", body, signal },
  );
}

/** Creates the payment (mock-payment). Pass the same `idempotencyKey` when retrying so no duplicate is created. */
export function startPayment(
  pnr: string,
  body: StartPaymentBody,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<PaymentResponse> {
  return apiClient.request<PaymentResponse>(`${bookingPath(pnr)}/payments`, {
    method: "POST",
    body,
    idempotent: idempotencyKey,
    signal,
  });
}
