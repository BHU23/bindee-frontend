import { apiClient } from "@/services/apiClient";
import type {
  PassengersResponse,
  SavePassengersBody,
} from "../types/passengerInfo";

function passengersPath(draftId: string): string {
  return `/booking-drafts/${encodeURIComponent(draftId)}/passengers`;
}

/** Saved passengers of a draft; `passengers` is empty when nothing was saved yet. No passport numbers. */
export function getPassengers(
  draftId: string,
  signal?: AbortSignal,
): Promise<PassengersResponse> {
  return apiClient.request<PassengersResponse>(passengersPath(draftId), {
    signal,
  });
}

/** Replaces the whole list. Rejects with `ApiError` 400 `VALIDATION_ERROR` (see `fields`) or a pax-rule code. */
export function savePassengers(
  draftId: string,
  body: SavePassengersBody,
  signal?: AbortSignal,
): Promise<PassengersResponse> {
  return apiClient.request<PassengersResponse>(passengersPath(draftId), {
    method: "PUT",
    body,
    signal,
  });
}
