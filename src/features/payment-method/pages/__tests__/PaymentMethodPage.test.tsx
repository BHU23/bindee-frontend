import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAYMENT_METHOD_PATH } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import {
  paymentFixture,
  paymentFlow,
  savedCard,
} from "../../__fixtures__/paymentMethod";
import * as api from "../../api/paymentApi";
import { PaymentMethodPage } from "../PaymentMethodPage";

vi.mock("../../api/paymentApi");

function renderPage(state: unknown = paymentFlow) {
  const router = createMemoryRouter(
    [
      { path: PAYMENT_METHOD_PATH, element: <PaymentMethodPage /> },
      { path: "/pay/card", element: <p>card page</p> },
      { path: "/before", element: <p>previous page</p> },
      { path: "/", element: <p>home page</p> },
    ],
    {
      initialEntries: ["/before", { pathname: PAYMENT_METHOD_PATH, state }],
      initialIndex: 1,
    },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function holdIn(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

const CTA = { name: /^ชำระเงิน|กำลังเริ่มการชำระเงิน/ };
const CARD = { name: /บัตรเครดิต/ };

async function chooseCard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", CARD));
}

function deferred<T>() {
  let resolve: (value: T) => void = vi.fn();
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("PaymentMethodPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.savePaymentMethod).mockResolvedValue(savedCard);
    vi.mocked(api.startPayment).mockResolvedValue(paymentFixture);
  });

  it("When there is no flow state, should redirect to the home page", async () => {
    renderPage(null);
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("UI-PM-01: When rendered, should show the test-mode banner and three method cards with only card enabled", () => {
    renderPage();
    expect(screen.getByRole("note")).toHaveTextContent("โหมดทดสอบ");
    expect(screen.getByRole("group", { name: "วิธีชำระเงิน" })).toBeVisible();
    expect(screen.getByRole("radio", CARD)).toBeEnabled();
    expect(screen.getByRole("radio", { name: /PromptPay/ })).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: /Mobile banking/ }),
    ).toBeDisabled();
    expect(screen.getByText("ใช้บัตรทดสอบเท่านั้น")).toBeInTheDocument();
  });

  it("UI-PM-03: When rendered, should show the remaining hold time with the PNR", () => {
    renderPage({ ...paymentFlow, holdExpiresAt: holdIn(15) });
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent("รหัสจอง AB12CD");
    expect(timer).toHaveTextContent(/เหลือเวลา 1[45]:\d\d นาที/);
  });

  it("UI-PM-02: When no method is chosen, should disable the CTA showing the total", () => {
    renderPage();
    expect(screen.getByRole("button", CTA)).toBeDisabled();
    expect(screen.getByRole("button", CTA)).toHaveTextContent(
      "ชำระเงิน ฿1,780",
    );
  });

  it("UI-PM-02: When a method is chosen, should enable the CTA", async () => {
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    expect(screen.getByRole("button", CTA)).toBeEnabled();
  });

  it("UI-PM-02: When pressing the CTA, should save the method, start the payment and open the card page with the payment id", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await chooseCard(user);
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByText("card page")).toBeInTheDocument();
    expect(api.savePaymentMethod).toHaveBeenCalledWith("AB12CD", {
      method: "CARD",
    });
    expect(api.startPayment).toHaveBeenCalledWith(
      "AB12CD",
      { method: "CARD" },
      expect.any(String),
    );
    expect(router.state.location.pathname).toBe("/pay/card");
    expect(router.state.location.search).toBe("?paymentId=p1");
  });

  it("UI-PM-02: When the CTA is double-clicked, should create one payment and disable the button while loading", async () => {
    const pending = deferred<typeof paymentFixture>();
    vi.mocked(api.startPayment).mockReturnValue(pending.promise);
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    await user.dblClick(screen.getByRole("button", CTA));
    await waitFor(() =>
      expect(screen.getByRole("button", CTA)).toHaveTextContent(
        "กำลังเริ่มการชำระเงิน",
      ),
    );
    expect(screen.getByRole("button", CTA)).toBeDisabled();
    expect(api.savePaymentMethod).toHaveBeenCalledTimes(1);
    expect(api.startPayment).toHaveBeenCalledTimes(1);
    pending.resolve(paymentFixture);
    expect(await screen.findByText("card page")).toBeInTheDocument();
  });

  it("AC-PM-07: When starting the payment fails and the CTA is pressed again, should reuse the same idempotency key and keep the method", async () => {
    vi.mocked(api.startPayment).mockRejectedValueOnce(
      new ApiError(0, "NETWORK_ERROR", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "เริ่มการชำระเงินไม่สำเร็จ",
    );
    expect(screen.getByRole("radio", CARD)).toBeChecked();
    expect(screen.getByRole("button", CTA)).toBeEnabled();
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByText("card page")).toBeInTheDocument();
    const [first, second] = vi.mocked(api.startPayment).mock.calls;
    expect(first[2]).toBeTruthy();
    expect(second[2]).toBe(first[2]);
  });

  it("When saving the method fails, should not start the payment and keep the selection", async () => {
    vi.mocked(api.savePaymentMethod).mockRejectedValueOnce(
      new ApiError(500, "INTERNAL", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(api.startPayment).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", CARD)).toBeChecked();
  });

  it("When the hold has expired (410), should say so", async () => {
    vi.mocked(api.savePaymentMethod).mockRejectedValue(
      new ApiError(410, "HOLD_EXPIRED", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "หมดเวลาการจองแล้ว",
    );
  });

  it("When the booking cannot be paid any more (409), should say so", async () => {
    vi.mocked(api.savePaymentMethod).mockRejectedValue(
      new ApiError(409, "INVALID_STATE_TRANSITION", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await chooseCard(user);
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ไม่สามารถชำระเงินได้แล้ว",
    );
  });

  it("UI-PM-06: When using only the keyboard, should select with Enter and start the payment from the CTA", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("radio", CARD)).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("radio", CARD)).toBeChecked();
    expect(api.startPayment).not.toHaveBeenCalled();
  });

  it("When tapping back, should return to the previous page", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
    expect(await screen.findByText("previous page")).toBeInTheDocument();
  });
});
