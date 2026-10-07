import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import * as api from "../../api/searchApi";
import { useSearchForm } from "../useSearchForm";

vi.mock("../../api/searchApi");

const TODAY = "2026-10-07";
const onSearched = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function setup() {
  return renderHook(() => useSearchForm({ today: TODAY, onSearched }));
}

function fillValid(result: ReturnType<typeof setup>["result"]) {
  act(() => {
    result.current.setField("destination", "CNX");
    result.current.setField("departDate", "2026-10-08");
  });
}

describe("useSearchForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.createSearch).mockResolvedValue({
      searchId: "s1",
      expiresAt: "2026-10-07T04:00:00.000Z",
    });
  });

  it("UI-HS-03: When origin equals destination, should show the error and send no request", async () => {
    const { result } = setup();
    fillValid(result);
    act(() => result.current.setField("destination", "BKK"));
    await act(() => result.current.submit());
    expect(result.current.errors.destination).toBe("sameAirport");
    expect(api.createSearch).not.toHaveBeenCalled();
  });

  it("When the guest fixes a field, should clear only that field's error", async () => {
    const { result } = setup();
    await act(() => result.current.submit());
    expect(result.current.errors).toMatchObject({
      destination: "required",
      departDate: "required",
    });
    act(() => result.current.setField("destination", "CNX"));
    expect(result.current.errors.destination).toBeUndefined();
    expect(result.current.errors.departDate).toBe("required");
  });

  it("When the form is valid, should create the search and report the result", async () => {
    const { result } = setup();
    fillValid(result);
    await act(() => result.current.submit());
    expect(onSearched).toHaveBeenCalledWith({
      searchId: "s1",
      query: expect.objectContaining({ origin: "BKK", destination: "CNX" }),
    });
  });

  it("When Search is double-clicked, should create one search and navigate once", async () => {
    const pending = deferred<{ searchId: string; expiresAt: string }>();
    vi.mocked(api.createSearch).mockReturnValue(pending.promise);
    const { result } = setup();
    fillValid(result);
    await act(async () => {
      void result.current.submit();
      void result.current.submit();
    });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => pending.resolve({ searchId: "s1", expiresAt: "x" }));
    expect(api.createSearch).toHaveBeenCalledTimes(1);
    expect(onSearched).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("When the inventory is down (503), should keep the values and show a retryable error", async () => {
    vi.mocked(api.createSearch).mockRejectedValue(
      new ApiError(503, "INVENTORY_UNAVAILABLE", "down"),
    );
    const { result } = setup();
    fillValid(result);
    await act(() => result.current.submit());
    expect(result.current.submitError).toBe("inventoryUnavailable");
    expect(result.current.values.destination).toBe("CNX");
    vi.mocked(api.createSearch).mockResolvedValue({
      searchId: "s2",
      expiresAt: "x",
    });
    await act(() => result.current.submit());
    expect(result.current.submitError).toBeNull();
    expect(onSearched).toHaveBeenCalledTimes(1);
  });

  it.each([
    [new ApiError(0, "NETWORK_ERROR", "offline"), "network"],
    [new ApiError(500, "UNKNOWN_ERROR", "boom"), "unknown"],
    [new Error("weird"), "unknown"],
  ] as const)(
    "When the request fails with %s, should report %s",
    async (error, expected) => {
      vi.mocked(api.createSearch).mockRejectedValue(error);
      const { result } = setup();
      fillValid(result);
      await act(() => result.current.submit());
      expect(result.current.submitError).toBe(expected);
    },
  );

  it("When the server rejects a field (400), should show it under that field", async () => {
    vi.mocked(api.createSearch).mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "bad", { departDate: "past" }),
    );
    const { result } = setup();
    fillValid(result);
    await act(() => result.current.submit());
    expect(result.current.errors.departDate).toBe("invalid");
  });

  it("UI-HS-05: When searching again from a recent search, should fill the form and run it", async () => {
    const { result } = setup();
    await act(() =>
      result.current.searchAgain({
        tripType: "ROUND_TRIP",
        origin: "BKK",
        destination: "HKT",
        departDate: "2026-10-14",
        returnDate: "2026-10-18",
        adults: 2,
        children: 1,
        infants: 0,
        cabin: "ECONOMY",
      }),
    );
    expect(result.current.values).toMatchObject({
      destination: "HKT",
      returnDate: "2026-10-18",
      adults: 2,
    });
    expect(api.createSearch).toHaveBeenCalledTimes(1);
    expect(onSearched).toHaveBeenCalledTimes(1);
  });

  it("When swapping airports, should exchange origin and destination", () => {
    const { result } = setup();
    fillValid(result);
    act(() => result.current.swapAirports());
    expect(result.current.values).toMatchObject({
      origin: "CNX",
      destination: "BKK",
    });
  });

  it("UI-HS-04: When adults change, should recompute the passenger limits", () => {
    const { result } = setup();
    act(() => result.current.setField("adults", 3));
    expect(result.current.paxLimits.maxInfants).toBe(3);
  });
});
