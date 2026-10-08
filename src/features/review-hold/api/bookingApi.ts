import { apiClient } from "@/services/apiClient";
import type { BookingResponse, CreateBookingBody } from "../types/reviewHold";

/**
 * Creates the PNR and holds the seats. Pass the same `idempotencyKey` when retrying the same
 * confirmation. Rejects with `ApiError` 409 `PRICE_CHANGED` / `SEAT_UNAVAILABLE`, 410 `SEARCH_EXPIRED`, 400.
 */
export function createBooking(
  body: CreateBookingBody,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<BookingResponse> {
  return apiClient.request<BookingResponse>("/bookings", {
    method: "POST",
    body,
    idempotent: idempotencyKey,
    signal,
  });
}
