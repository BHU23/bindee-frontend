import { apiClient } from "@/services/apiClient";
import type {
  CardPaymentBody,
  CardPaymentResponse,
} from "../types/mockPayment";

/**
 * Pays with a test card. A declined or timed-out card is still `200` with `status: "FAILED"`.
 * Rejects with `ApiError`: 400 `VALIDATION_ERROR` (`fields`), 422 `NOT_A_TEST_CARD`,
 * 409 `INVALID_STATE_TRANSITION`, 410 `HOLD_EXPIRED`, 404 `PAYMENT_NOT_FOUND`.
 */
export function payWithCard(
  paymentId: string,
  body: CardPaymentBody,
  signal?: AbortSignal,
): Promise<CardPaymentResponse> {
  return apiClient.request<CardPaymentResponse>(
    `/payments/${encodeURIComponent(paymentId)}/card`,
    { method: "POST", body, signal },
  );
}
