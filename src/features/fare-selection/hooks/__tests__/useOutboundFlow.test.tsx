import { act, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryFixture } from "@/features/flight-results/__fixtures__/flightResults";
import { PASSENGERS_PATH, RETURN_FLIGHTS_PATH } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import * as api from "../../api/bookingApi";
import { outboundFlight, outboundSelection } from "../../__fixtures__/booking";
import type { PriceChangedError, SearchQueryDto } from "../../types/booking";
import {
  useOutboundFlow,
  type UseOutboundFlowReturn,
} from "../useOutboundFlow";

vi.mock("../../api/bookingApi");

const change: PriceChangedError = {
  code: "PRICE_CHANGED",
  message: "changed",
  oldPrice: 2980,
  newPrice: 3200,
  diff: 220,
  reason: "PRICE_UPDATED",
};
const roundTrip: SearchQueryDto = { ...queryFixture, tripType: "ROUND_TRIP" };
const accepted = {
  selection: { flightId: "f1", fareFamily: "VALUE" as const },
  price: { total: 3200, perPax: { adult: 1600, child: 1600, infant: 0 } },
};

function setup(query: SearchQueryDto | null = queryFixture) {
  const ref: { current: UseOutboundFlowReturn | null } = { current: null };
  function Harness() {
    ref.current = useOutboundFlow({
      searchId: "s1",
      query: query ?? undefined,
    });
    return null;
  }
  const router = createMemoryRouter([
    { path: "/", element: <Harness /> },
    { path: "*", element: <p>next</p> },
  ]);
  render(<RouterProvider router={router} />);
  return {
    router,
    flow: () => ref.current as UseOutboundFlowReturn,
  };
}

describe("useOutboundFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.createDraft).mockResolvedValue({ draftId: "d1" });
    vi.mocked(api.acceptPrice).mockResolvedValue(accepted);
  });

  it("UI-FS-01: When a flight is tapped, should create the draft for the searchId and open the sheet", async () => {
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    expect(api.createDraft).toHaveBeenCalledWith("s1");
    expect(flow().draftId).toBe("d1");
    expect(flow().flight).toBe(outboundFlight);
    expect(flow().isSheetOpen).toBe(true);
  });

  it("UI-FS-01: When flights are tapped again, should reuse the draft", async () => {
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    await act(() => flow().selectFlight(outboundFlight));
    expect(api.createDraft).toHaveBeenCalledOnce();
  });

  it("UI-FS-01: When creating the draft fails, should flag an error, keep the sheet closed and retry on the next tap", async () => {
    vi.mocked(api.createDraft).mockRejectedValueOnce(
      new ApiError(500, "INTERNAL", "x"),
    );
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    expect(flow().hasError).toBe(true);
    expect(flow().isSheetOpen).toBe(false);
    await act(() => flow().selectFlight(outboundFlight));
    expect(flow().hasError).toBe(false);
    expect(flow().isSheetOpen).toBe(true);
  });

  it("UI-FS-06: When a one-way fare is selected, should go straight to passenger-info with the flow state", async () => {
    const { flow, router } = setup(queryFixture);
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handleSelected(outboundSelection));
    expect(router.state.location.pathname).toBe(PASSENGERS_PATH);
    expect(router.state.location.state).toEqual({
      searchId: "s1",
      draftId: "d1",
      query: queryFixture,
      outbound: outboundSelection,
    });
  });

  it("UI-FS-05: When a round-trip outbound fare is selected, should go to the return flights", async () => {
    const { flow, router } = setup(roundTrip);
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handleSelected(outboundSelection));
    expect(router.state.location.pathname).toBe(RETURN_FLIGHTS_PATH);
  });

  it("UI-FS-06: When the results query is not loaded, should not navigate", async () => {
    const { flow, router } = setup(null);
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handleSelected(outboundSelection));
    expect(router.state.location.pathname).toBe("/");
  });

  it("UI-FS-03: When the price changed, should keep the change and leave the sheet open", async () => {
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handlePriceChanged(change));
    expect(flow().priceChange).toBe(change);
    expect(flow().isSheetOpen).toBe(true);
  });

  it("UI-FS-03: When the new price is accepted, should accept it for the outbound and continue like a normal selection", async () => {
    const { flow, router } = setup(roundTrip);
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handlePriceChanged(change));
    await act(() => flow().acceptNewPrice());
    expect(api.acceptPrice).toHaveBeenCalledWith("d1", "outbound", 3200);
    expect(flow().priceChange).toBeNull();
    expect(router.state.location.pathname).toBe(RETURN_FLIGHTS_PATH);
    expect(router.state.location.state.outbound).toEqual({
      flight: outboundFlight,
      fareFamily: "VALUE",
      total: 3200,
    });
  });

  it("UI-FS-03: When accepting the new price fails, should keep the change and flag an error", async () => {
    vi.mocked(api.acceptPrice).mockRejectedValue(
      new ApiError(500, "INTERNAL", "x"),
    );
    const { flow, router } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handlePriceChanged(change));
    await act(() => flow().acceptNewPrice());
    expect(flow().hasError).toBe(true);
    expect(flow().priceChange).toBe(change);
    expect(flow().isAccepting).toBe(false);
    expect(router.state.location.pathname).toBe("/");
  });

  it("UI-FS-03: When there is no price change, should not call acceptPrice", async () => {
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    await act(() => flow().acceptNewPrice());
    expect(api.acceptPrice).not.toHaveBeenCalled();
  });

  it("UI-FS-03: When the user goes back to flights, should clear the change and close the sheet", async () => {
    const { flow } = setup();
    await act(() => flow().selectFlight(outboundFlight));
    act(() => flow().handlePriceChanged(change));
    act(() => flow().backToFlights());
    expect(flow().priceChange).toBeNull();
    expect(flow().isSheetOpen).toBe(false);
  });
});
