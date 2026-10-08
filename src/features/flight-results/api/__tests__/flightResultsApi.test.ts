import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTERS } from "../../lib/filters";
import { queryFixture } from "../../__fixtures__/flightResults";

const request = vi.fn();
vi.mock("@/services/apiClient", () => ({ apiClient: { request } }));

const { createSearch, getFlights } = await import("../flightResultsApi");

describe("flightResultsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    request.mockResolvedValue("ok");
  });

  it("When loading with default filters, should GET the outbound leg only", async () => {
    await expect(getFlights("s 1", DEFAULT_FILTERS)).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith(
      "/searches/s%201/flights?leg=outbound",
      {
        signal: undefined,
      },
    );
  });

  it("UI-FR-05: When filters are set, should send them as query parameters", async () => {
    const controller = new AbortController();
    await getFlights(
      "s1",
      {
        departure: ["morning", "evening"],
        directOnly: true,
        minPrice: 900,
        maxPrice: 2500,
        fare: ["LITE"],
        sort: "departure",
      },
      controller.signal,
    );
    const [path, options] = request.mock.calls[0] as [string, unknown];
    const params = new URL(path, "http://x").searchParams;
    expect(Object.fromEntries(params)).toEqual({
      departure: "morning,evening",
      directOnly: "true",
      minPrice: "900",
      maxPrice: "2500",
      fare: "LITE",
      sort: "departure",
      leg: "outbound",
    });
    expect(options).toEqual({ signal: controller.signal });
  });

  it("UI-FR-04: When creating a search for another day, should POST the query to /searches", async () => {
    const query = { ...queryFixture, departDate: "2026-10-15" };
    await createSearch(query);
    expect(request).toHaveBeenCalledWith("/searches", {
      method: "POST",
      body: query,
      signal: undefined,
    });
  });
});
