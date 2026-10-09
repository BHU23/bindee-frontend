import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn();
vi.mock("@/services/apiClient", () => ({ apiClient: { request } }));

const { getPassengers, savePassengers } = await import("../passengerApi");

describe("passengerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    request.mockResolvedValue("ok");
  });

  it("UI-PX-08: When loading saved passengers, should GET the draft passengers", async () => {
    const controller = new AbortController();
    await expect(getPassengers("d/1", controller.signal)).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith("/booking-drafts/d%2F1/passengers", {
      signal: controller.signal,
    });
  });

  it("When saving, should PUT the body to the draft passengers", async () => {
    const body = {
      passengers: [],
      contact: { name: "A", email: "a@b.co", phone: "+66812345678" },
      consent: { privacy: true as const, marketing: false },
    };
    await expect(savePassengers("d1", body)).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith("/booking-drafts/d1/passengers", {
      method: "PUT",
      body,
      signal: undefined,
    });
  });
});
