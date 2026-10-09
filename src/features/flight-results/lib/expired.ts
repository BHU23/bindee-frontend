import { ApiError } from "@/services/apiClient";
import type { SearchQueryDto } from "../types/flightResults";

export const SEARCH_EXPIRED_CODE = "SEARCH_EXPIRED";
const GONE = 410;

export function isSearchExpired(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === GONE &&
    error.code === SEARCH_EXPIRED_CODE
  );
}

interface ExpiredBody {
  query?: SearchQueryDto;
  error?: { query?: SearchQueryDto };
}

/** The 410 body carries the criteria of the expired search (`error.query`, or top-level `query`). */
export function expiredQueryOf(error: unknown): SearchQueryDto | null {
  if (!(error instanceof ApiError)) return null;
  const body = (error.body ?? {}) as ExpiredBody;
  return body.error?.query ?? body.query ?? null;
}
