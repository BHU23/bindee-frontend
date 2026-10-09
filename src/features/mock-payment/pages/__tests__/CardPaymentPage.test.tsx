import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PAY_CARD_PATH } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import { cardFlow } from "../../__fixtures__/mockPayment";
import * as api from "../../api/cardApi";
import { CardPaymentPage } from "../CardPaymentPage";

vi.mock("../../api/cardApi");

function renderPage(state: unknown = cardFlow, search = "?paymentId=p1") {
  const router = createMemoryRouter(
    [
      { path: PAY_CARD_PATH, element: <CardPaymentPage /> },
      {
        path: "/bookings/:pnr/confirmation",
        element: <p>confirmation page</p>,
      },
      { path: "/before", element: <p>previous page</p> },
      { path: "/", element: <p>home page</p> },
    ],
    {
      initialEntries: ["/before", { pathname: PAY_CARD_PATH, search, state }],
      initialIndex: 1,
    },
  );
  render(<RouterProvider router={router} />);
}

const CTA = { name: /^ยืนยันชำระ|กำลังชำระเงิน/ };

async function fillWith(
  user: ReturnType<typeof userEvent.setup>,
  last4: string,
) {
  await user.click(screen.getByRole("button", { name: new RegExp(last4) }));
}

describe("CardPaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.payWithCard).mockResolvedValue({
      paymentId: "p1",
      status: "SUCCESS",
    });
  });

  it("When there is no flow state or payment id, should redirect to the home page", async () => {
    renderPage(null);
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("When the payment id is missing, should redirect to the home page", async () => {
    renderPage(cardFlow, "");
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("UI-FND-05: When rendered, should show the test-mode banner", () => {
    renderPage();
    expect(screen.getByRole("note")).toHaveTextContent("เป็นการจำลอง");
  });

  it("UI-MP-01: When rendered, should show merchant, amount, PNR and mock reference", () => {
    renderPage();
    expect(screen.getByRole("note")).toHaveTextContent(
      "การชำระเงินในระบบนี้เป็นการจำลอง",
    );
    expect(screen.getByText("Bin Dee Airways (mock)")).toBeInTheDocument();
    const summary = screen.getByText("ยอดชำระ").closest("div") as HTMLElement;
    expect(within(summary).getByText("฿1,780")).toBeInTheDocument();
    const pnr = screen
      .getByText("รหัสจอง", { selector: "dt" })
      .closest("div") as HTMLElement;
    expect(within(pnr).getByText("AB12CD")).toBeInTheDocument();
    expect(screen.getByText("MOCK-1")).toBeInTheDocument();
  });

  it("UI-MP-01: When rendered, should show the hold countdown with the PNR", () => {
    renderPage({
      ...cardFlow,
      holdExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    });
    expect(screen.getByRole("timer")).toHaveTextContent(
      /เหลือเวลา 1[45]:\d\d นาที/,
    );
  });

  it("UI-MP-02: When rendered, should list the three test cards and a CTA with the amount", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /4242/ })).toHaveTextContent(
      "สำเร็จ",
    );
    expect(screen.getByRole("button", { name: /0002/ })).toHaveTextContent(
      "ถูกปฏิเสธ",
    );
    expect(screen.getByRole("button", { name: /0119/ })).toHaveTextContent(
      "หมดเวลา",
    );
    expect(screen.getByRole("button", CTA)).toHaveTextContent(
      "ยืนยันชำระ ฿1,780",
    );
  });

  it("UI-MP-02: When a test card is tapped, should fill the form", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "0002");
    expect(screen.getByLabelText("เลขบัตร")).toHaveValue("4000 0000 0000 0002");
    expect(screen.getByLabelText("วันหมดอายุ (MM/YY)")).toHaveValue("12/30");
    expect(screen.getByLabelText("CVV")).toHaveValue("123");
  });

  it("UI-MP-10: When pressing the CTA with a malformed form, should show a fix-it sentence under each field", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("เลขบัตร"), "4242");
    await user.click(screen.getByRole("button", CTA));
    expect(screen.getByLabelText("เลขบัตร")).toHaveAccessibleDescription(
      "กรอกเลขบัตร 13–19 หลัก",
    );
    expect(
      screen.getByLabelText("วันหมดอายุ (MM/YY)"),
    ).toHaveAccessibleDescription("กรอกวันหมดอายุแบบ MM/YY");
    expect(screen.getByLabelText("CVV")).toHaveAccessibleDescription(
      "กรอก CVV 3–4 หลัก",
    );
    expect(api.payWithCard).not.toHaveBeenCalled();
  });

  it("UI-MP-10: When the backend rejects fields with 400, should show the same sentences", async () => {
    vi.mocked(api.payWithCard).mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "x", { expiry: "bad" }),
    );
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "4242");
    await user.click(screen.getByRole("button", CTA));
    expect(
      await screen.findByText("กรอกวันหมดอายุแบบ MM/YY"),
    ).toBeInTheDocument();
  });

  it("UI-MP-02: When the success card is paid, should send it and open the confirmation route", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "4242");
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByText("confirmation page")).toBeInTheDocument();
    expect(api.payWithCard).toHaveBeenCalledWith("p1", {
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
    });
  });

  it("UI-MP-02: When the CTA is double-clicked, should pay once and disable the button while loading", async () => {
    let resolve: (v: { paymentId: string; status: "SUCCESS" }) => void =
      vi.fn();
    vi.mocked(api.payWithCard).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "4242");
    await user.dblClick(screen.getByRole("button", CTA));
    await waitFor(() =>
      expect(screen.getByRole("button", CTA)).toHaveTextContent(
        "กำลังชำระเงิน",
      ),
    );
    expect(screen.getByRole("button", CTA)).toBeDisabled();
    expect(api.payWithCard).toHaveBeenCalledTimes(1);
    resolve({ paymentId: "p1", status: "SUCCESS" });
    expect(await screen.findByText("confirmation page")).toBeInTheDocument();
  });

  it("When the declined card is paid, should show an inline error and keep the form", async () => {
    vi.mocked(api.payWithCard).mockResolvedValue({
      paymentId: "p1",
      status: "FAILED",
      failureCode: "MOCK_DECLINED",
    });
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "0002");
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent("บัตรถูกปฏิเสธ");
    expect(screen.getByLabelText("เลขบัตร")).toHaveValue("4000 0000 0000 0002");
    expect(screen.getByRole("button", CTA)).toBeEnabled();
  });

  it("When the card is not a test card (422), should show an inline error", async () => {
    vi.mocked(api.payWithCard).mockRejectedValue(
      new ApiError(422, "NOT_A_TEST_CARD", "x"),
    );
    const user = userEvent.setup();
    renderPage();
    await fillWith(user, "4242");
    await user.click(screen.getByRole("button", CTA));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "ไม่ใช่บัตรทดสอบ",
    );
  });

  it("When tapping back, should return to the previous page", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
    expect(await screen.findByText("previous page")).toBeInTheDocument();
  });
});
