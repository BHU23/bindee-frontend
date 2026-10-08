import { apiClient } from "@/services/apiClient";
import type {
  BookingLeg,
  CreateDraftResponse,
  FaresResponse,
  FareFamily,
  ReturnFlightsResponse,
  SelectFareResponse,
} from "../types/booking";

const draftPath = (draftId: string) =>
  `/booking-drafts/${encodeURIComponent(draftId)}`;

export function createDraft(
  searchId: string,
  signal?: AbortSignal,
): Promise<CreateDraftResponse> {
  return apiClient.request<CreateDraftResponse>("/booking-drafts", {
    method: "POST",
    body: { searchId },
    signal,
  });
}

export function getFares(
  draftId: string,
  flightId: string,
  signal?: AbortSignal,
): Promise<FaresResponse> {
  return apiClient.request<FaresResponse>(
    `${draftPath(draftId)}/flights/${encodeURIComponent(flightId)}/fares`,
    { signal },
  );
}

/** Rejects with `ApiError` code `PRICE_CHANGED` (status 409) when the live price moved. */
export function selectFare(
  draftId: string,
  leg: BookingLeg,
  flightId: string,
  fareFamily: FareFamily,
  signal?: AbortSignal,
): Promise<SelectFareResponse> {
  return apiClient.request<SelectFareResponse>(`${draftPath(draftId)}/${leg}`, {
    method: "PUT",
    body: { flightId, fareFamily },
    signal,
  });
}

export function acceptPrice(
  draftId: string,
  leg: BookingLeg,
  newPrice: number,
  signal?: AbortSignal,
): Promise<SelectFareResponse> {
  return apiClient.request<SelectFareResponse>(
    `${draftPath(draftId)}/${leg}/accept-price`,
    { method: "POST", body: { newPrice }, signal },
  );
}

export function getReturnFlights(
  draftId: string,
  signal?: AbortSignal,
): Promise<ReturnFlightsResponse> {
  return apiClient.request<ReturnFlightsResponse>(
    `${draftPath(draftId)}/return-flights`,
    { signal },
  );
}
