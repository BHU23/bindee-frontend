import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import {
  emptyResultsFixture,
  queryFixture,
  resultsFixture,
} from "../../__fixtures__/flightResults";
import * as api from "../../api/flightResultsApi";
import { DEFAULT_FILTERS } from "../../lib/filters";
import { FlightResultsPage } from "../FlightResultsPage";

vi.mock("../../api/flightResultsApi");

function renderPage(url = "/flights?searchId=s1") {
  const router = createMemoryRouter(
    [
      { path: "/flights", element: <FlightResultsPage /> },
      { path: "/", element: <p>home page</p> },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function lastFilters(): unknown {
  const calls = vi.mocked(api.getFlights).mock.calls;
  return calls[calls.length - 1]?.[1];
}

const expiredError = new ApiError(410, "SEARCH_EXPIRED", "expired", undefined, {
  error: { code: "SEARCH_EXPIRED", query: queryFixture },
});

describe("FlightResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getFlights).mockResolvedValue(resultsFixture);
    vi.mocked(api.createSearch).mockResolvedValue({
      searchId: "s2",
      expiresAt: "2999-01-01T00:00:00.000Z",
    });
  });

  it("When there is no searchId in the URL, should go back to the home page", async () => {
    renderPage("/flights");
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(api.getFlights).not.toHaveBeenCalled();
  });

  it("UI-FR-06: While loading, should show card-shaped skeletons inside the screen frame", async () => {
    vi.mocked(api.getFlights).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(
      screen.getByRole("status", { name: "กำลังค้นหาเที่ยวบิน" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "เลือกเที่ยวบิน" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "ขั้นตอนการจอง" }),
    ).toBeInTheDocument();
  });

  it("UI-FR-01: When results load, should list the flights with the price note and request the outbound list for the searchId", async () => {
    renderPage();
    expect(await screen.findByText("BD101")).toBeInTheDocument();
    expect(screen.getByText("BD205")).toBeInTheDocument();
    expect(screen.getByText("พบ 2 เที่ยวบิน")).toBeInTheDocument();
    expect(
      screen.getByText("ยืนยันราคาจริงเมื่อเลือกเที่ยวบิน"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "BKK → CNX" }),
    ).toBeInTheDocument();
    expect(api.getFlights).toHaveBeenCalledWith(
      "s1",
      expect.anything(),
      expect.any(AbortSignal),
    );
    expect(lastFilters()).toMatchObject({ ...DEFAULT_FILTERS });
  });

  it("UI-FR-02: When results load, should show the lowest badge once", async () => {
    renderPage();
    await screen.findByText("BD101");
    expect(screen.getAllByText("ราคาต่ำสุด")).toHaveLength(1);
  });

  it("UI-FR-04: When the user selects another day, should create a new search with the same criteria, replace the searchId and reload", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText("BD101");
    expect(screen.getByRole("button", { name: /พ\. 14 ต\.ค\./ })).toHaveClass(
      "bg-midnight",
    );
    await user.click(screen.getByRole("button", { name: /พฤ\. 15 ต\.ค\./ }));
    expect(api.createSearch).toHaveBeenCalledWith({
      ...queryFixture,
      departDate: "2026-10-15",
    });
    await waitFor(() =>
      expect(router.state.location.search).toContain("searchId=s2"),
    );
    await waitFor(() =>
      expect(api.getFlights).toHaveBeenLastCalledWith(
        "s2",
        expect.anything(),
        expect.any(AbortSignal),
      ),
    );
    // replaced, not pushed: going back leaves the results screen instead of returning to s1.
    expect(router.state.historyAction).toBe("REPLACE");
    await screen.findByText("BD101");
  });

  it("UI-FR-04: When a day is sold out, should not be selectable", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("BD101");
    const soldOut = screen.getByRole("button", { name: /จ\. 12 ต\.ค\./ });
    expect(soldOut).toBeDisabled();
    await user.click(soldOut);
    expect(api.createSearch).not.toHaveBeenCalled();
  });

  it("UI-FR-04: When creating the new search fails, should keep the current results and tell the guest", async () => {
    vi.mocked(api.createSearch).mockRejectedValue(
      new ApiError(0, "NETWORK_ERROR", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("BD101");
    await user.click(screen.getByRole("button", { name: /พฤ\. 15 ต\.ค\./ }));
    expect(
      await screen.findByText("เปลี่ยนวันไม่สำเร็จ กรุณาลองอีกครั้ง"),
    ).toBeInTheDocument();
    expect(screen.getByText("BD101")).toBeInTheDocument();
  });

  it("UI-FR-05: When the filter sheet opens, should bound the price slider by priceRange; applying updates the list request, the count and the URL; reset clears", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await screen.findByText("BD101");
    await user.click(screen.getByRole("button", { name: "ตัวกรอง" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("slider", { name: "ราคาสูงสุด" }),
    ).toHaveAttribute("max", "3200");
    await user.click(
      within(dialog).getByRole("checkbox", { name: "เฉพาะบินตรง" }),
    );
    await user.click(within(dialog).getByRole("checkbox", { name: "Lite" }));
    await user.click(
      within(dialog).getByRole("button", { name: "ใช้ตัวกรอง" }),
    );
    await waitFor(() =>
      expect(lastFilters()).toMatchObject({ directOnly: true, fare: ["LITE"] }),
    );
    expect(router.state.location.search).toContain("directOnly=true");
    expect(router.state.location.search).toContain("searchId=s1");
    expect(
      await screen.findByRole("button", { name: "ตัวกรอง (2)" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ตัวกรอง (2)" }));
    await user.click(
      await screen.findByRole("button", { name: "ล้างตัวกรอง" }),
    );
    await waitFor(() =>
      expect(lastFilters()).toMatchObject({ directOnly: false, fare: [] }),
    );
    expect(
      await screen.findByRole("button", { name: "ตัวกรอง" }),
    ).toBeInTheDocument();
    expect(router.state.location.search).toBe("?searchId=s1");
  });

  it("UI-FR-05: When the user changes the sort, should request that sort and keep the filters", async () => {
    const user = userEvent.setup();
    renderPage("/flights?searchId=s1&directOnly=true");
    await screen.findByText("BD101");
    await user.click(screen.getByRole("button", { name: "ระยะเวลา" }));
    await waitFor(() =>
      expect(lastFilters()).toMatchObject({
        sort: "duration",
        directOnly: true,
      }),
    );
    expect(screen.getByRole("button", { name: "ระยะเวลา" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UI-FR-07: When there are zero flights, should show the empty screen with nearby days; picking one switches day", async () => {
    vi.mocked(api.getFlights).mockResolvedValue(emptyResultsFixture);
    const user = userEvent.setup();
    const router = renderPage();
    expect(
      await screen.findByRole("heading", { name: "ไม่มีที่นั่งว่างในวันนี้" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("ยืนยันราคาจริงเมื่อเลือกเที่ยวบิน"),
    ).not.toBeInTheDocument();
    const nearby = screen.getByRole("button", { name: /อ\. 13 ต\.ค\./ });
    expect(nearby).toHaveTextContent("เหลือ 14 ที่นั่ง");
    expect(nearby).toHaveTextContent("฿1,290");
    await user.click(nearby);
    await waitFor(() =>
      expect(router.state.location.search).toContain("searchId=s2"),
    );
    expect(api.createSearch).toHaveBeenCalledWith({
      ...queryFixture,
      departDate: "2026-10-13",
    });
  });

  it("UI-FR-07: When the user taps edit search, should go to the search form", async () => {
    vi.mocked(api.getFlights).mockResolvedValue(emptyResultsFixture);
    renderPage();
    await userEvent.click(
      await screen.findByRole("button", { name: "แก้ไขการค้นหา" }),
    );
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("When the empty list comes with active filters, should offer a reset that reloads without them", async () => {
    vi.mocked(api.getFlights).mockResolvedValue(emptyResultsFixture);
    renderPage("/flights?searchId=s1&directOnly=true&sort=duration");
    await userEvent.click(
      await screen.findByRole("button", { name: "ล้างตัวกรอง" }),
    );
    await waitFor(() =>
      expect(lastFilters()).toMatchObject({
        directOnly: false,
        sort: "duration",
      }),
    );
  });

  it("UI-FR-08: When the API answers 410, should show the expired screen with the query; the CTA searches again with the same criteria", async () => {
    vi.mocked(api.getFlights).mockRejectedValueOnce(expiredError);
    const user = userEvent.setup();
    const router = renderPage();
    expect(
      await screen.findByRole("heading", { name: "ผลการค้นหาหมดอายุแล้ว" }),
    ).toBeInTheDocument();
    expect(screen.getByText("BKK → CNX")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ค้นหาอีกครั้ง" }));
    expect(api.createSearch).toHaveBeenCalledWith(queryFixture);
    await waitFor(() =>
      expect(router.state.location.search).toContain("searchId=s2"),
    );
    expect(await screen.findByText("BD101")).toBeInTheDocument();
  });

  it("UI-FR-08: When the 410 body has no query, the CTA should go back to the search form", async () => {
    vi.mocked(api.getFlights).mockRejectedValueOnce(
      new ApiError(410, "SEARCH_EXPIRED", "expired"),
    );
    renderPage();
    await userEvent.click(
      await screen.findByRole("button", { name: "ค้นหาอีกครั้ง" }),
    );
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(api.createSearch).not.toHaveBeenCalled();
  });

  it.each([
    ["network", new ApiError(0, "NETWORK_ERROR", "offline")],
    ["404", new ApiError(404, "NOT_FOUND", "nope")],
    ["400", new ApiError(400, "VALIDATION_ERROR", "bad")],
  ])(
    "UI-FR-09: When the API fails (%s), should show an alert whose retry reloads with the same filters",
    async (_, failure) => {
      vi.mocked(api.getFlights).mockRejectedValueOnce(failure);
      const user = userEvent.setup();
      renderPage(
        "/flights?searchId=s1&directOnly=true&fare=VALUE&sort=departure",
      );
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "โหลดเที่ยวบินไม่สำเร็จ",
      );
      await user.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
      expect(await screen.findByText("BD101")).toBeInTheDocument();
      expect(api.getFlights).toHaveBeenCalledTimes(2);
      for (const call of vi.mocked(api.getFlights).mock.calls) {
        expect(call[0]).toBe("s1");
        expect(call[1]).toMatchObject({
          directOnly: true,
          fare: ["VALUE"],
          sort: "departure",
        });
      }
      expect(
        screen.getByRole("button", { name: "ตัวกรอง (2)" }),
      ).toBeInTheDocument();
    },
  );
});
