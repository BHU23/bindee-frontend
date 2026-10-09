import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PASSENGERS_PATH,
  PAYMENT_METHOD_PATH,
  RESULTS_PATH,
  REVIEW_PATH,
} from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import {
  bookingFixture,
  reviewFlow,
  roundTripReviewFlow,
} from "../../__fixtures__/reviewHold";
import * as api from "../../api/bookingApi";
import { ReviewPage } from "../ReviewPage";

vi.mock("../../api/bookingApi");

function renderPage(state: unknown = reviewFlow) {
  const router = createMemoryRouter(
    [
      { path: REVIEW_PATH, element: <ReviewPage /> },
      { path: RESULTS_PATH, element: <p>results page</p> },
      { path: PASSENGERS_PATH, element: <p>passengers page</p> },
      { path: PAYMENT_METHOD_PATH, element: <p>payment page</p> },
      { path: "/", element: <p>home page</p> },
    ],
    { initialEntries: [{ pathname: REVIEW_PATH, state }] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function deferredBooking() {
  let resolve: (value: typeof bookingFixture) => void = vi.fn();
  const promise = new Promise<typeof bookingFixture>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const CTA = { name: "ไปชำระเงิน" };

function holdIn(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

describe("ReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.createBooking).mockResolvedValue({
      ...bookingFixture,
      holdExpiresAt: holdIn(15),
    });
  });

  it("When there is no flow state, should redirect to the home page", async () => {
    renderPage(null);
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("UI-RH-01: When rendered, should show the itinerary, passengers and price breakdown", () => {
    renderPage();
    const itinerary = screen.getByRole("group", { name: "เที่ยวบิน" });
    expect(itinerary).toHaveTextContent("BKK 07:30 → CNX 08:45");
    expect(itinerary).toHaveTextContent("BD101");
    expect(itinerary).toHaveTextContent("ตั๋ว Value");
    expect(itinerary).toHaveTextContent("พ. 14 ต.ค.");
    expect(screen.getByRole("group", { name: "ผู้โดยสาร" })).toHaveTextContent(
      "Mr Somchai Jaidee",
    );
    const price = screen.getByRole("group", { name: "รายละเอียดราคา" });
    expect(price).toHaveTextContent("เที่ยวบินขาไป");
    expect(within(price).getAllByText("฿1,090")).toHaveLength(2);
    expect(screen.getByText("ยอดรวม").nextSibling).toHaveTextContent("฿1,090");
  });

  it("UI-RH-01: When round trip, should also show the return flight and add both legs", () => {
    renderPage(roundTripReviewFlow);
    expect(screen.getByRole("group", { name: "เที่ยวบิน" })).toHaveTextContent(
      "CNX 17:00 → BKK 18:15",
    );
    expect(screen.getByText("ยอดรวม").nextSibling).toHaveTextContent("฿1,780");
  });

  it("UI-RH-01: When tapping the edit link of the itinerary, should go back to the results of the same search", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(screen.getByRole("link", { name: "แก้ไขเที่ยวบิน" }));
    expect(await screen.findByText("results page")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?searchId=s1");
  });

  it("UI-RH-01: When tapping the edit link of the passengers, should open the passenger screen", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("link", { name: "แก้ไขผู้โดยสาร" }));
    expect(await screen.findByText("passengers page")).toBeInTheDocument();
  });

  it("When tapping back, should return to the passenger screen", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
    expect(await screen.findByText("passengers page")).toBeInTheDocument();
  });

  it("UI-RH-03: When tapping ไปชำระเงิน without accepting the terms, should block and flag the checkbox", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", CTA));
    expect(api.createBooking).not.toHaveBeenCalled();
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("กรุณายอมรับเงื่อนไขเพื่อไปชำระเงิน"),
    ).toBeInTheDocument();
  });

  it("UI-RH-03: When the terms are accepted after a blocked attempt, should clear the flag", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", CTA));
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    expect(
      screen.queryByText("กรุณายอมรับเงื่อนไขเพื่อไปชำระเงิน"),
    ).not.toBeInTheDocument();
  });

  it("UI-RH-03: When the terms are accepted and then unticked, should block again", async () => {
    const user = userEvent.setup();
    renderPage();
    const terms = screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ });
    await user.click(terms);
    await user.click(terms);
    await user.click(screen.getByRole("button", CTA));
    expect(api.createBooking).not.toHaveBeenCalled();
    expect(terms).toHaveAttribute("aria-invalid", "true");
  });

  it("When the terms are accepted, should confirm with the draft, acceptTerms and the expected total", async () => {
    const user = userEvent.setup();
    renderPage(roundTripReviewFlow);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    await user.click(screen.getByRole("button", CTA));
    await waitFor(() => expect(api.createBooking).toHaveBeenCalledTimes(1));
    expect(vi.mocked(api.createBooking).mock.calls[0][0]).toEqual({
      draftId: "d1",
      acceptTerms: true,
      expectedTotal: 1780,
    });
  });

  it("UI-RH-04: When the booking is created, should open the payment method page with the PNR, hold expiry and total", async () => {
    const holdExpiresAt = holdIn(15);
    vi.mocked(api.createBooking).mockResolvedValue({
      ...bookingFixture,
      holdExpiresAt,
    });
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByText("payment page")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(PAYMENT_METHOD_PATH);
    expect(router.state.location.state).toEqual({
      pnr: "AB12CD",
      holdExpiresAt,
      total: 1090,
    });
  });

  it("UI-RH-05: When the CTA is double-clicked, should send only one request and disable the button", async () => {
    const deferred = deferredBooking();
    vi.mocked(api.createBooking).mockReturnValue(deferred.promise);
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    await user.dblClick(screen.getByRole("button", CTA));
    expect(api.createBooking).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "กำลังยืนยันการจอง" }),
    ).toBeDisabled();
    deferred.resolve({ ...bookingFixture, holdExpiresAt: holdIn(15) });
    expect(await screen.findByText("payment page")).toBeInTheDocument();
  });

  it("UI-RH-05: When a failed confirmation is retried, should reuse the same idempotency key", async () => {
    vi.mocked(api.createBooking).mockRejectedValueOnce(
      new ApiError(0, "NETWORK_ERROR", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ยืนยันการจองไม่สำเร็จ",
    );
    await user.click(screen.getByRole("button", CTA));
    await screen.findByText("payment page");
    const [first, second] = vi.mocked(api.createBooking).mock.calls;
    expect(first[1]).toBeTruthy();
    expect(second[1]).toBe(first[1]);
  });

  it("When the search has expired (410), should say so", async () => {
    vi.mocked(api.createBooking).mockRejectedValue(
      new ApiError(410, "SEARCH_EXPIRED", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้าได้อ่าน/ }));
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ผลการค้นหาหมดอายุแล้ว",
    );
  });
});
