import { act, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import { cardFlow } from "../../__fixtures__/mockPayment";
import * as api from "../../api/cardApi";
import { TEST_CARDS } from "../../lib/testCards";
import { useCardPayment } from "../useCardPayment";

vi.mock("../../api/cardApi");

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/pay/card"]}>
      {children}
      <Where />
    </MemoryRouter>
  );
}

function setup() {
  return renderHook(() => useCardPayment({ paymentId: "p1", flow: cardFlow }), {
    wrapper: Wrapper,
  });
}

function fillValid(result: ReturnType<typeof setup>["result"]) {
  act(() => result.current.fillTestCard(TEST_CARDS[0]));
}

describe("useCardPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.payWithCard).mockResolvedValue({
      paymentId: "p1",
      status: "SUCCESS",
    });
  });

  it("UI-MP-10: When submitting an empty form, should set a fix-it message per field and not call the API", async () => {
    const { result } = setup();
    await act(() => result.current.submit());
    expect(result.current.errors).toEqual({
      cardNumber: "กรอกเลขบัตร 13–19 หลัก",
      expiry: "กรอกวันหมดอายุแบบ MM/YY",
      cvv: "กรอก CVV 3–4 หลัก",
    });
    expect(api.payWithCard).not.toHaveBeenCalled();
  });

  it("UI-MP-10: When a field is edited after an error, should clear only that field's message", async () => {
    const { result } = setup();
    await act(() => result.current.submit());
    act(() => result.current.setField("cvv", "123"));
    expect(result.current.errors.cvv).toBeUndefined();
    expect(result.current.errors.cardNumber).toBeDefined();
  });

  it("UI-MP-10: When typing, should format the number and expiry", () => {
    const { result } = setup();
    act(() => result.current.setField("cardNumber", "4242424242424242"));
    act(() => result.current.setField("expiry", "1230"));
    expect(result.current.values.cardNumber).toBe("4242 4242 4242 4242");
    expect(result.current.values.expiry).toBe("12/30");
  });

  it("UI-MP-10: When the backend returns 400 with fields, should show the same messages under those fields", async () => {
    vi.mocked(api.payWithCard).mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "x", {
        cardNumber: "bad",
        cvv: "bad",
      }),
    );
    const { result } = setup();
    fillValid(result);
    await act(() => result.current.submit());
    expect(result.current.errors).toEqual({
      cardNumber: "กรอกเลขบัตร 13–19 หลัก",
      cvv: "กรอก CVV 3–4 หลัก",
    });
    expect(result.current.submitError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("UI-MP-02: When the card succeeds, should send digits only and open the confirmation route", async () => {
    const { result } = setup();
    fillValid(result);
    await act(() => result.current.submit());
    expect(api.payWithCard).toHaveBeenCalledWith("p1", {
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
    });
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        "/bookings/AB12CD/confirmation",
      ),
    );
  });

  it.each([
    ["MOCK_DECLINED", "บัตรถูกปฏิเสธ"],
    ["MOCK_TIMEOUT", "หมดเวลา"],
  ] as const)(
    "When the result is FAILED %s, should show a message and stay on the page",
    async (failureCode, text) => {
      vi.mocked(api.payWithCard).mockResolvedValue({
        paymentId: "p1",
        status: "FAILED",
        failureCode,
      });
      const { result } = setup();
      fillValid(result);
      await act(() => result.current.submit());
      expect(result.current.submitError).toContain(text);
      expect(result.current.isSubmitting).toBe(false);
      expect(screen.getByTestId("where")).toHaveTextContent("/pay/card");
    },
  );

  it.each([
    [422, "NOT_A_TEST_CARD", "ไม่ใช่บัตรทดสอบ"],
    [410, "HOLD_EXPIRED", "หมดเวลาการจองแล้ว"],
    [409, "INVALID_STATE_TRANSITION", "ชำระเงินไปแล้ว"],
    [500, "INTERNAL", "ชำระเงินไม่สำเร็จ"],
    [400, "VALIDATION_ERROR", "ชำระเงินไม่สำเร็จ"],
  ])(
    "When the API answers %i %s, should show the matching message",
    async (status, code, text) => {
      vi.mocked(api.payWithCard).mockRejectedValue(
        new ApiError(status, code, "x"),
      );
      const { result } = setup();
      fillValid(result);
      await act(() => result.current.submit());
      expect(result.current.submitError).toContain(text);
    },
  );

  it("UI-MP-02: When submit is pressed twice at once, should call the API once", async () => {
    let resolve: (v: { paymentId: string; status: "SUCCESS" }) => void =
      vi.fn();
    vi.mocked(api.payWithCard).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const { result } = setup();
    fillValid(result);
    act(() => {
      void result.current.submit();
      void result.current.submit();
    });
    expect(result.current.isSubmitting).toBe(true);
    expect(api.payWithCard).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ paymentId: "p1", status: "SUCCESS" }));
  });
});
