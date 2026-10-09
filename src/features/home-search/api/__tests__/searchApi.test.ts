import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn();
vi.mock("@/services/apiClient", () => ({ apiClient: { request } }));

const { createSearch, getPopularRoutes, getPromotions, getRecentSearches } =
  await import("../searchApi");

describe("searchApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    request.mockResolvedValue("ok");
  });

  it("When creating a search, should POST the query to /searches", async () => {
    const query = {
      tripType: "ONE_WAY",
      origin: "BKK",
      destination: "CNX",
      departDate: "2026-10-08",
      adults: 1,
      children: 0,
      infants: 0,
      cabin: "ECONOMY",
    } as const;
    await expect(createSearch(query)).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith("/searches", {
      method: "POST",
      body: query,
      signal: undefined,
    });
  });

  it.each([
    ["recent searches", getRecentSearches, "/searches/recent"],
    ["popular routes", getPopularRoutes, "/routes/popular"],
    ["promotions", getPromotions, "/promotions"],
  ] as const)("When loading %s, should GET %s", async (_, load, path) => {
    const controller = new AbortController();
    await load(controller.signal);
    expect(request).toHaveBeenCalledWith(path, { signal: controller.signal });
  });
});
