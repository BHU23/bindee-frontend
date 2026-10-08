import { describe, expect, it } from "vitest";
import { ApiError } from "@/services/apiClient";
import { queryFixture } from "../../__fixtures__/flightResults";
import { expiredQueryOf, isSearchExpired } from "../expired";

describe("expired search helpers", () => {
  it("UI-FR-08: When the error is 410 SEARCH_EXPIRED, should be detected; other errors should not", () => {
    expect(isSearchExpired(new ApiError(410, "SEARCH_EXPIRED", "gone"))).toBe(
      true,
    );
    expect(isSearchExpired(new ApiError(410, "OTHER", "gone"))).toBe(false);
    expect(isSearchExpired(new ApiError(404, "NOT_FOUND", "no"))).toBe(false);
    expect(isSearchExpired(new Error("x"))).toBe(false);
  });

  it("UI-FR-08: When the body carries the query under error or at top level, should return it", () => {
    const nested = new ApiError(410, "SEARCH_EXPIRED", "gone", undefined, {
      error: { code: "SEARCH_EXPIRED", query: queryFixture },
    });
    const flat = new ApiError(410, "SEARCH_EXPIRED", "gone", undefined, {
      query: queryFixture,
    });
    expect(expiredQueryOf(nested)).toEqual(queryFixture);
    expect(expiredQueryOf(flat)).toEqual(queryFixture);
  });

  it("When the body has no query or the error is not an ApiError, should return null", () => {
    expect(
      expiredQueryOf(new ApiError(410, "SEARCH_EXPIRED", "gone")),
    ).toBeNull();
    expect(expiredQueryOf(new Error("x"))).toBeNull();
  });
});
