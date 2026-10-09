import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  popularRoutesFixture,
  promotionsFixture,
  recentSearchesFixture,
} from "../../__fixtures__/homeSearch";
import * as api from "../../api/searchApi";
import { usePopularRoutes } from "../usePopularRoutes";
import { usePromotions } from "../usePromotions";
import { useRecentSearches } from "../useRecentSearches";

vi.mock("../../api/searchApi");

describe("useRecentSearches", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-05: When recents load, should map them to refillable queries", async () => {
    vi.mocked(api.getRecentSearches).mockResolvedValue(recentSearchesFixture);
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.searches[0]).toEqual({
      id: "r1",
      query: {
        tripType: "ROUND_TRIP",
        origin: "BKK",
        destination: "CNX",
        departDate: "2026-10-14",
        returnDate: "2026-10-18",
        adults: 2,
        children: 1,
        infants: 0,
        cabin: "ECONOMY",
      },
    });
    expect(result.current.searches[1]?.query.returnDate).toBeUndefined();
  });

  it("UI-HS-06: When the load fails, should expose no recents instead of throwing", async () => {
    vi.mocked(api.getRecentSearches).mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useRecentSearches());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.searches).toEqual([]);
  });
});

describe("usePopularRoutes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-09: When routes load, should expose the computed price as fromPrice", async () => {
    vi.mocked(api.getPopularRoutes).mockResolvedValue(popularRoutesFixture);
    const { result } = renderHook(() => usePopularRoutes());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.routes[0]).toEqual({
      origin: "BKK",
      destination: "CNX",
      city: "Chiang Mai",
      fromPrice: 990,
    });
    expect(result.current.routes[3]?.fromPrice).toBeNull();
  });

  it("When the load fails and the guest retries, should load again", async () => {
    vi.mocked(api.getPopularRoutes)
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(popularRoutesFixture);
    const { result } = renderHook(() => usePopularRoutes());
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.routes).toHaveLength(4);
  });
});

describe("usePromotions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-07: When promotions load, should map route, code and valid-until", async () => {
    vi.mocked(api.getPromotions).mockResolvedValue(promotionsFixture);
    const { result } = renderHook(() => usePromotions());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.promotions[0]).toMatchObject({
      origin: "BKK",
      destination: "HKT",
      promoCode: "BINDEE10",
      validUntil: "2026-12-31T16:59:59.999Z",
    });
  });

  it("UI-HS-07: When the load fails, should report an error status for the retry Alert", async () => {
    vi.mocked(api.getPromotions).mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => usePromotions());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("When unmounted before the response, should ignore the late result", async () => {
    let resolve!: (value: typeof promotionsFixture) => void;
    vi.mocked(api.getPromotions).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result, unmount } = renderHook(() => usePromotions());
    unmount();
    resolve(promotionsFixture);
    expect(result.current.status).toBe("loading");
  });
});
