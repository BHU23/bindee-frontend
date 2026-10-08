import { act, renderHook, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PASSENGERS_PATH } from "@/lib/routes";
import {
  flowFixture,
  returnFlightsFixture,
  returnSelectionFixture,
} from "../../__fixtures__/flow";
import * as api from "../../api/bookingApi";
import type { PriceChangedError } from "../../types/booking";
import { useReturnLeg } from "../useReturnLeg";

vi.mock("../../api/bookingApi");

const change: PriceChangedError = {
  code: "PRICE_CHANGED",
  message: "changed",
  oldPrice: 1800,
  newPrice: 1900,
  diff: 100,
  reason: "PRICE_UPDATED",
};

function setup() {
  return renderHook(() => useReturnLeg(flowFixture), {
    wrapper: ({ children }) => (
      <RouterProvider
        router={createMemoryRouter(
          [
            { path: "/", element: children },
            { path: PASSENGERS_PATH, element: <p>passengers</p> },
          ],
          { initialEntries: ["/"] },
        )}
      />
    ),
  });
}

describe("useReturnLeg", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When starting, should hold no return selection (UI-FS-09)", () => {
    const { result } = setup();
    expect(result.current.returnSelection).toBeNull();
    expect(result.current.priceChange).toBeNull();
  });

  it("When the price changed and the user accepts, should post the new price and complete the leg", async () => {
    vi.mocked(api.acceptPrice).mockResolvedValue({
      selection: { flightId: "r1", fareFamily: "LITE" },
      price: { total: 1900, perPax: { adult: 950, child: 0, infant: 0 } },
    });
    const { result } = setup();
    act(() => result.current.openFlight(returnFlightsFixture[0]));
    act(() => result.current.handlePriceChanged(change));
    expect(result.current.priceChange).toEqual(change);
    await act(() => result.current.acceptNewPrice());
    expect(api.acceptPrice).toHaveBeenCalledWith("d1", "return", 1900);
    await waitFor(() =>
      expect(result.current.returnSelection).toMatchObject({
        fareFamily: "LITE",
        total: 1900,
      }),
    );
    expect(result.current.priceChange).toBeNull();
  });

  it("When accepting the new price fails, should flag it and keep the change", async () => {
    vi.mocked(api.acceptPrice).mockRejectedValue(new Error("boom"));
    const { result } = setup();
    act(() => result.current.openFlight(returnFlightsFixture[0]));
    act(() => result.current.handlePriceChanged(change));
    await act(() => result.current.acceptNewPrice());
    expect(result.current.acceptFailed).toBe(true);
    expect(result.current.priceChange).toEqual(change);
  });

  it("When there is no price change, should ignore accept", async () => {
    const { result } = setup();
    await act(() => result.current.acceptNewPrice());
    expect(api.acceptPrice).not.toHaveBeenCalled();
  });

  it("When going back to flights, should clear the change and close the sheet", () => {
    const { result } = setup();
    act(() => result.current.openFlight(returnFlightsFixture[0]));
    act(() => result.current.handlePriceChanged(change));
    act(() => result.current.backToFlights());
    expect(result.current.priceChange).toBeNull();
    expect(result.current.selectedFlight).toBeNull();
  });

  it("When a fare is selected, should record it", () => {
    const { result } = setup();
    act(() => result.current.handleSelected(returnSelectionFixture));
    expect(result.current.returnSelection).toEqual(returnSelectionFixture);
  });
});
