import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/services/apiClient";
import { payWithCard } from "../cardApi";

vi.mock("@/services/apiClient", () => ({
  apiClient: { request: vi.fn() },
}));

describe("payWithCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-MP-02: When paying, should POST the card body to the payment", async () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      paymentId: "p1",
      status: "SUCCESS",
    });
    const body = {
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
    };
    const result = await payWithCard("p 1", body);
    expect(apiClient.request).toHaveBeenCalledWith("/payments/p%201/card", {
      method: "POST",
      body,
      signal: undefined,
    });
    expect(result.status).toBe("SUCCESS");
  });
});
