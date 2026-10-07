import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import {
  popularRoutesFixture,
  promotionsFixture,
  recentSearchesFixture,
} from "../../__fixtures__/homeSearch";
import * as api from "../../api/searchApi";
import { HomePage } from "../HomePage";

vi.mock("../../api/searchApi");

function renderHome() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <HomePage /> },
      { path: "/flights", element: <p>results page</p> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

/** Waits for the three data sections so no state update lands after the test ends. */
async function settled() {
  await screen.findByRole("heading", { name: "ค้นหาล่าสุด" });
  await screen.findByRole("heading", { name: "เส้นทางยอดนิยม" });
  await screen.findByText("โค้ด BINDEE10");
}

async function openPassengers(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /^ผู้โดยสาร:/ }));
}

function submitButton() {
  return screen.getByRole("button", { name: /ค้นหาเที่ยวบิน|กำลังค้นหา/ });
}

async function chooseAirport(
  user: ReturnType<typeof userEvent.setup>,
  field: "ต้นทาง" | "ปลายทาง",
  option: string,
) {
  await user.click(screen.getByRole("combobox", { name: field }));
  await user.click(await screen.findByRole("option", { name: option }));
}

/** Picks the last enabled day of the month that the calendar popover opens on. */
async function pickLastEnabledDay(
  user: ReturnType<typeof userEvent.setup>,
  field: "วันเดินทางไป" | "วันเดินทางกลับ",
) {
  await user.click(screen.getByRole("button", { name: field }));
  const grid = await screen.findByRole("grid");
  const days = within(grid)
    .getAllByRole("button")
    .filter((day) => !(day as HTMLButtonElement).disabled);
  await user.click(days[days.length - 1] as HTMLElement);
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await chooseAirport(user, "ปลายทาง", "เชียงใหม่ CNX");
  await pickLastEnabledDay(user, "วันเดินทางไป");
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getRecentSearches).mockResolvedValue(recentSearchesFixture);
    vi.mocked(api.getPopularRoutes).mockResolvedValue(popularRoutesFixture);
    vi.mocked(api.getPromotions).mockResolvedValue(promotionsFixture);
    vi.mocked(api.createSearch).mockResolvedValue({
      searchId: "s1",
      expiresAt: "2999-01-01T00:00:00.000Z",
    });
  });

  describe("UI-HS-01 layout", () => {
    it("When rendered, should have exactly one primary CTA and put the search form first", async () => {
      renderHome();
      expect(
        screen.getAllByRole("button", { name: "ค้นหาเที่ยวบิน" }),
      ).toHaveLength(1);
      const form = screen.getByRole("form", { name: "ค้นหาเที่ยวบิน" });
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(
        form.compareDocumentPosition(headings[0] as HTMLElement) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      await settled();
    });

    it("When rendered, should show the promo-code link text pointing at the promotions", async () => {
      renderHome();
      expect(
        screen.getByRole("link", { name: "มีโค้ดส่วนลด?" }),
      ).toHaveAttribute("href", "#promotions");
      await settled();
    });

    it("When rendered, should show no language toggle", async () => {
      renderHome();
      expect(
        screen.queryByRole("button", { name: /EN|English|ภาษา/ }),
      ).not.toBeInTheDocument();
      await settled();
    });
  });

  describe("UI-HS-02 trip type", () => {
    it("When choosing ไป-กลับ, should show the return date; when เที่ยวเดียว, should hide it", async () => {
      const user = userEvent.setup();
      renderHome();
      expect(
        screen.queryByRole("button", { name: "วันเดินทางกลับ" }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("tab", { name: "ไป-กลับ" }));
      expect(
        screen.getByRole("button", { name: "วันเดินทางกลับ" }),
      ).toBeVisible();
      await user.click(screen.getByRole("tab", { name: "เที่ยวเดียว" }));
      expect(
        screen.queryByRole("button", { name: "วันเดินทางกลับ" }),
      ).not.toBeInTheDocument();
      await settled();
    });
  });

  describe("UI-HS-03 same airport", () => {
    it("When origin equals destination, should tell how to fix it and send no request", async () => {
      const user = userEvent.setup();
      renderHome();
      await fillValid(user);
      await chooseAirport(user, "ปลายทาง", "กรุงเทพฯ (สุวรรณภูมิ) BKK");
      await user.click(submitButton());
      expect(
        screen.getByText(/ต้นทางและปลายทางต้องไม่ใช่สนามบินเดียวกัน/),
      ).toBeVisible();
      expect(api.createSearch).not.toHaveBeenCalled();
      await settled();
    });
  });

  describe("UI-HS-04 passenger rules", () => {
    it("When adults=1, should disable + for infants after one infant and show the hint", async () => {
      const user = userEvent.setup();
      renderHome();
      await openPassengers(user);
      const plusInfants = screen.getByRole("button", { name: "เพิ่ม ทารก" });
      await user.click(plusInfants);
      expect(plusInfants).toBeDisabled();
      expect(
        screen.getByText("ทารกต้องมีผู้ใหญ่ดูแลท่านละ 1 คน"),
      ).toBeVisible();
      await settled();
    });

    it("When adults + children reaches 9, should disable + and show the total hint", async () => {
      const user = userEvent.setup();
      renderHome();
      await openPassengers(user);
      const plusChildren = screen.getByRole("button", { name: "เพิ่ม เด็ก" });
      for (let i = 0; i < 8; i += 1) await user.click(plusChildren);
      expect(plusChildren).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "เพิ่ม ผู้ใหญ่" }),
      ).toBeDisabled();
      expect(
        screen.getByText("ผู้ใหญ่และเด็กรวมกันได้ไม่เกิน 9 ท่าน"),
      ).toBeVisible();
      await settled();
    });
  });

  describe("search", () => {
    it("When the form is valid, should create the search and open the results", async () => {
      const user = userEvent.setup();
      const router = renderHome();
      await fillValid(user);
      await user.click(submitButton());
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/flights"),
      );
      expect(router.state.location.search).toBe("?searchId=s1");
      expect(api.createSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: "BKK",
          destination: "CNX",
          adults: 1,
        }),
      );
    });

    it("When the inventory is down, should keep the form values and allow a retry", async () => {
      vi.mocked(api.createSearch).mockRejectedValueOnce(
        new ApiError(503, "INVENTORY_UNAVAILABLE", "down"),
      );
      const user = userEvent.setup();
      const router = renderHome();
      await fillValid(user);
      await user.click(submitButton());
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "ลองอีกครั้งได้เลย",
      );
      expect(screen.getByRole("combobox", { name: "ปลายทาง" })).toHaveValue(
        "เชียงใหม่ CNX",
      );
      await user.click(submitButton());
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/flights"),
      );
    });
  });

  describe("UI-HS-05 recent searches", () => {
    it("When tapping a recent search, should fill the form and run the search again", async () => {
      const user = userEvent.setup();
      const router = renderHome();
      await user.click(
        await screen.findByRole("button", { name: "ค้นหาอีกครั้ง BKK → HKT" }),
      );
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/flights"),
      );
      expect(api.createSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: "HKT",
          departDate: "2026-10-20",
        }),
      );
    });
  });

  describe("UI-HS-06 no recents", () => {
    it("When there are no recent searches, should hide the section", async () => {
      vi.mocked(api.getRecentSearches).mockResolvedValue([]);
      renderHome();
      await screen.findByText("โปรโมชันสำหรับคุณ");
      await waitFor(() => expect(api.getRecentSearches).toHaveBeenCalled());
      expect(
        screen.queryByRole("heading", { name: "ค้นหาล่าสุด" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("UI-HS-07 promotions", () => {
    it("When promotions are loading, should show skeletons and keep the form usable", () => {
      vi.mocked(api.getPromotions).mockReturnValue(
        new Promise(() => undefined),
      );
      renderHome();
      expect(screen.getAllByTestId("promotion-skeleton")).toHaveLength(3);
      expect(submitButton()).toBeEnabled();
    });

    it("When promotions fail, should show an Alert whose retry loads them again", async () => {
      vi.mocked(api.getPromotions).mockRejectedValueOnce(new Error("down"));
      const user = userEvent.setup();
      renderHome();
      const alert = await screen.findByText("โหลดโปรโมชันไม่สำเร็จ");
      await user.click(
        within(alert.closest("[role=alert]") as HTMLElement).getByRole(
          "button",
          {
            name: "ลองอีกครั้ง",
          },
        ),
      );
      expect(await screen.findByText("โค้ด BINDEE10")).toBeVisible();
    });
  });

  describe("UI-HS-09 popular routes", () => {
    it("When a route card is picked, should fill origin and destination", async () => {
      const user = userEvent.setup();
      renderHome();
      await user.click(
        await screen.findByRole("button", { name: "เลือกเส้นทาง BKK → SIN" }),
      );
      expect(screen.getByRole("combobox", { name: "ปลายทาง" })).toHaveValue(
        "สิงคโปร์ SIN",
      );
      expect(screen.getAllByText("เริ่มต้น ฿990 / ท่าน รวมภาษี")).toHaveLength(
        2,
      );
    });
  });
});
