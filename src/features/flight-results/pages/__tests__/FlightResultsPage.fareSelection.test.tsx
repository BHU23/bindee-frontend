import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bookingApi from "@/features/fare-selection/api/bookingApi";
import { faresFixture } from "@/features/fare-selection/__fixtures__/booking";
import { PASSENGERS_PATH, RETURN_FLIGHTS_PATH } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import { resultsFixture } from "../../__fixtures__/flightResults";
import * as api from "../../api/flightResultsApi";
import { FlightResultsPage } from "../FlightResultsPage";

vi.mock("../../api/flightResultsApi");
vi.mock("@/features/fare-selection/api/bookingApi");

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: "/flights", element: <FlightResultsPage /> },
      { path: "*", element: <p>next screen</p> },
    ],
    { initialEntries: ["/flights?searchId=s1"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

async function pickFirstFlightFare() {
  await userEvent.click(
    (await screen.findAllByRole("button", { name: "เลือก" }))[0],
  );
  await userEvent.click(await screen.findByRole("radio", { name: /Value/ }));
  const sheet = await screen.findByRole("dialog");
  await userEvent.click(within(sheet).getByRole("button", { name: "เลือก" }));
}

describe("FlightResultsPage fare selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getFlights).mockResolvedValue(resultsFixture);
    vi.mocked(bookingApi.createDraft).mockResolvedValue({ draftId: "d1" });
    vi.mocked(bookingApi.getFares).mockResolvedValue(faresFixture);
    vi.mocked(bookingApi.selectFare).mockResolvedValue({
      selection: { flightId: "f1", fareFamily: "VALUE" },
      price: { total: 2980, perPax: { adult: 1490, child: 1490, infant: 300 } },
    });
  });

  it("UI-FS-06: When a fare is selected on a one-way search, should go directly to passenger-info", async () => {
    const router = renderPage();
    await pickFirstFlightFare();
    expect(await screen.findByText("next screen")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(PASSENGERS_PATH);
    expect(bookingApi.createDraft).toHaveBeenCalledWith("s1");
    expect(router.state.location.state).toMatchObject({
      draftId: "d1",
      outbound: { fareFamily: "VALUE", total: 2980 },
    });
  });

  it("UI-FS-05: When a fare is selected on a round trip, should go to the return flights", async () => {
    vi.mocked(api.getFlights).mockResolvedValue({
      ...resultsFixture,
      query: { ...resultsFixture.query, tripType: "ROUND_TRIP" },
    });
    const router = renderPage();
    await pickFirstFlightFare();
    expect(await screen.findByText("next screen")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RETURN_FLIGHTS_PATH);
  });

  it("UI-FS-01: When the draft cannot be created, should show an error and no sheet", async () => {
    vi.mocked(bookingApi.createDraft).mockRejectedValue(
      new ApiError(500, "INTERNAL", "x"),
    );
    renderPage();
    await userEvent.click(
      (await screen.findAllByRole("button", { name: "เลือก" }))[0],
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "เริ่มการจองไม่สำเร็จ",
    );
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
