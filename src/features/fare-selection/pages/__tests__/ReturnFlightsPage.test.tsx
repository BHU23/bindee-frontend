import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryFixture } from "@/features/flight-results/__fixtures__/flightResults";
import {
  PASSENGERS_PATH,
  RESULTS_PATH,
  RETURN_FLIGHTS_PATH,
} from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import {
  flowFixture,
  newOutboundFixture,
  returnFlightsFixture,
  returnSelectionFixture,
} from "../../__fixtures__/flow";
import * as api from "../../api/bookingApi";
import type { FareSelectionSheetProps } from "../../components/FareSelectionSheet";
import type { TripTotalFooterProps } from "../../components/TripTotalFooter";
import { ReturnFlightsPage } from "../ReturnFlightsPage";

vi.mock("../../api/bookingApi");
vi.mock("../../components/FareSelectionSheet", () => ({
  FareSelectionSheet: (props: FareSelectionSheetProps) =>
    props.open ? (
      <div role="dialog">
        <span>sheet {props.flight?.flightNo}</span>
        <button onClick={() => props.onSelected(returnSelectionFixture)}>
          pick fare
        </button>
        <button onClick={() => props.onOpenChange(false)}>close sheet</button>
      </div>
    ) : null,
}));
vi.mock("../../components/TripTotalFooter", () => ({
  TripTotalFooter: ({ selections }: TripTotalFooterProps) => (
    <output aria-label="footer total">
      {selections.reduce((sum, s) => sum + s.total, 0)}
    </output>
  ),
}));

function Probe({ label }: { label: string }) {
  const location = useLocation();
  return (
    <p>
      {label} {location.search}
    </p>
  );
}

function renderPage(state: unknown = flowFixture) {
  const router = createMemoryRouter(
    [
      { path: RETURN_FLIGHTS_PATH, element: <ReturnFlightsPage /> },
      { path: RESULTS_PATH, element: <Probe label="results" /> },
      { path: PASSENGERS_PATH, element: <Probe label="passengers" /> },
      { path: "/", element: <p>home page</p> },
    ],
    { initialEntries: [{ pathname: RETURN_FLIGHTS_PATH, state }] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("ReturnFlightsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getReturnFlights).mockResolvedValue({
      flights: returnFlightsFixture,
    });
  });

  it("When there is no flow state, should redirect to the results route", async () => {
    renderPage(null);
    expect(await screen.findByText(/^results/)).toBeInTheDocument();
    expect(api.getReturnFlights).not.toHaveBeenCalled();
  });

  it("UI-FS-05: When opened, should show the outbound summary, the notice and the return flights", async () => {
    renderPage();
    expect(await screen.findByText("BD102")).toBeInTheDocument();
    expect(api.getReturnFlights).toHaveBeenCalledWith("d1", expect.anything());
    expect(
      screen.getByRole("button", { name: "เปลี่ยนเที่ยวบินขาไป" }),
    ).toHaveTextContent("เปลี่ยน");
    expect(
      screen.getByText(
        "แสดงเฉพาะเที่ยวบินที่ออกหลังเที่ยวขาไปถึงอย่างน้อย 1 ชม.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/BD101/)).toBeInTheDocument();
  });

  it("When loading, should show a skeleton", () => {
    vi.mocked(api.getReturnFlights).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(
      screen.getByRole("status", { name: "กำลังค้นหาเที่ยวบิน" }),
    ).toBeInTheDocument();
  });

  it("UI-FS-08: When there are no eligible flights, should offer changing the outbound flight", async () => {
    vi.mocked(api.getReturnFlights).mockResolvedValue({ flights: [] });
    const user = userEvent.setup();
    const router = renderPage();
    expect(
      await screen.findByText("ไม่มีเที่ยวบินขากลับที่เลือกได้"),
    ).toBeInTheDocument();
    const empty = screen
      .getByText("ไม่มีเที่ยวบินขากลับที่เลือกได้")
      .closest("section") as HTMLElement;
    await user.click(
      within(empty).getByRole("button", { name: "เปลี่ยนเที่ยวบินขาไป" }),
    );
    expect(await screen.findByText("results ?searchId=s1")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RESULTS_PATH);
  });

  it("When loading fails, should show an error and retry", async () => {
    vi.mocked(api.getReturnFlights)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue({ flights: returnFlightsFixture });
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "ลองอีกครั้ง" }),
    );
    expect(await screen.findByText("BD102")).toBeInTheDocument();
  });

  it("When the search expired, should show a message and go home on action", async () => {
    vi.mocked(api.getReturnFlights).mockRejectedValue(
      new ApiError(410, "SEARCH_EXPIRED", "expired", undefined, {
        error: { query: queryFixture },
      }),
    );
    const user = userEvent.setup();
    renderPage();
    expect(
      await screen.findByText("ผลการค้นหาหมดอายุแล้ว"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ค้นหาใหม่" }));
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("UI-FS-09: When tapping เปลี่ยน, should go to the results of the same search", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(
      await screen.findByRole("button", { name: "เปลี่ยนเที่ยวบินขาไป" }),
    );
    expect(await screen.findByText("results ?searchId=s1")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(RESULTS_PATH);
  });

  it("When tapping a return flight and choosing a fare, should go to passengers with both legs", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(await screen.findByRole("button", { name: /BD102/ }));
    expect(screen.getByText("sheet BD102")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "pick fare" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(PASSENGERS_PATH),
    );
    expect(router.state.location.state).toMatchObject({
      draftId: "d1",
      outbound: flowFixture.outbound,
      inbound: returnSelectionFixture,
    });
  });

  it("When the sheet is closed, should hide it without leaving", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: /BD206/ }));
    await user.click(screen.getByRole("button", { name: "close sheet" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UI-FS-09: When returning with a new outbound, should total only the new outbound and keep no old return", async () => {
    const router = renderPage();
    const footer = await screen.findByLabelText("footer total");
    expect(footer).toHaveTextContent("3000");
    await router.navigate(
      { pathname: RETURN_FLIGHTS_PATH },
      { state: { ...flowFixture, outbound: newOutboundFixture } },
    );
    await waitFor(() =>
      expect(
        within(screen.getByLabelText("footer total")).getByText("2000"),
      ).toBeInTheDocument(),
    );
    expect(api.getReturnFlights).toHaveBeenCalledTimes(2);
  });
});
