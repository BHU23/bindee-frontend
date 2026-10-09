import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn();
vi.mock("@/services/apiClient", () => ({ apiClient: { request } }));

const { createBooking } = await import("../bookingApi");

describe("bookingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    request.mockResolvedValue("ok");
  });

  it("UI-RH-05: When confirming, should POST /bookings with the given idempotency key", async () => {
    const body = {
      draftId: "d1",
      acceptTerms: true as const,
      expectedTotal: 1090,
    };
    const controller = new AbortController();
    await expect(createBooking(body, "key-1", controller.signal)).resolves.toBe(
      "ok",
    );
    expect(request).toHaveBeenCalledWith("/bookings", {
      method: "POST",
      body,
      idempotent: "key-1",
      signal: controller.signal,
    });
  });
});
