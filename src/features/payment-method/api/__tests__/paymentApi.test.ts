import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/services/apiClient";
import { savePaymentMethod, startPayment } from "../paymentApi";

vi.mock("@/services/apiClient", () => ({
  apiClient: { request: vi.fn() },
}));

describe("paymentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When saving the method, should PUT it to the booking by PNR", async () => {
    vi.mocked(apiClient.request).mockResolvedValue({ next: "/pay/card" });
    await savePaymentMethod("AB12CD", { method: "CARD" });
    expect(apiClient.request).toHaveBeenCalledWith(
      "/bookings/AB12CD/payment-method",
      { method: "PUT", body: { method: "CARD" }, signal: undefined },
    );
  });

  it("UI-PM-02: When starting the payment, should POST with the given idempotency key", async () => {
    vi.mocked(apiClient.request).mockResolvedValue({ paymentId: "p1" });
    await startPayment("AB12CD", { method: "CARD" }, "key-1");
    expect(apiClient.request).toHaveBeenCalledWith(
      "/bookings/AB12CD/payments",
      {
        method: "POST",
        body: { method: "CARD" },
        idempotent: "key-1",
        signal: undefined,
      },
    );
  });
});
