import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient, createApiClient } from "../apiClient";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function headersOf(
  fetchFn: ReturnType<typeof vi.fn<typeof fetch>>,
  call: number,
): Record<string, string> {
  const init = fetchFn.mock.calls[call]?.[1];
  return (init?.headers ?? {}) as Record<string, string>;
}

function setup(fetchFn: typeof fetch) {
  return createApiClient({
    baseUrl: "http://api.test",
    fetchFn,
    getSessionId: () => "sess-1",
  });
}

describe("apiClient", () => {
  const fetchFn = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AC-FND-09 session header", () => {
    it("When making any call, should send X-Session-Id", async () => {
      fetchFn.mockResolvedValue(jsonResponse(200, { ok: true }));
      await setup(fetchFn).request("/ping");
      const init = fetchFn.mock.calls[0]?.[1];
      expect(headersOf(fetchFn, 0)["X-Session-Id"]).toBe("sess-1");
      expect(init?.method).toBe("GET");
    });
  });

  describe("Idempotency-Key", () => {
    it("When idempotent is true, should generate a key", async () => {
      fetchFn.mockResolvedValue(jsonResponse(201, { id: 1 }));
      await setup(fetchFn).request("/bookings", {
        method: "POST",
        body: { a: 1 },
        idempotent: true,
      });
      const headers = headersOf(fetchFn, 0);
      expect(headers["Idempotency-Key"]).toMatch(/^[0-9a-f-]{36}$/);
      expect(headers["Content-Type"]).toBe("application/json");
      expect(fetchFn.mock.calls[0]?.[1]?.body).toBe('{"a":1}');
    });

    it("When idempotent is a string, should reuse that key; otherwise send none", async () => {
      fetchFn.mockImplementation(async () => jsonResponse(200, {}));
      const client = setup(fetchFn);
      await client.request("/x", { method: "POST", idempotent: "my-key" });
      await client.request("/y", { method: "POST" });
      expect(headersOf(fetchFn, 0)["Idempotency-Key"]).toBe("my-key");
      expect(headersOf(fetchFn, 1)).not.toHaveProperty("Idempotency-Key");
    });
  });

  describe("errors", () => {
    it("When the server returns the error shape, should throw ApiError with status, code, message and fields", async () => {
      fetchFn.mockResolvedValue(
        jsonResponse(400, {
          error: {
            code: "VALIDATION_ERROR",
            message: "bad",
            fields: { name: "required" },
          },
        }),
      );
      const error = await setup(fetchFn)
        .request("/x")
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 400,
        code: "VALIDATION_ERROR",
        message: "bad",
        fields: { name: "required" },
      });
    });

    it("When the error body is not JSON, should throw UNKNOWN_ERROR with the status text", async () => {
      fetchFn.mockResolvedValue(
        new Response("boom", { status: 502, statusText: "Bad Gateway" }),
      );
      await expect(setup(fetchFn).request("/x")).rejects.toMatchObject({
        status: 502,
        code: "UNKNOWN_ERROR",
        message: "Bad Gateway",
      });
    });

    it("When fetch fails, should throw ApiError status 0 NETWORK_ERROR", async () => {
      fetchFn.mockRejectedValue(new TypeError("Failed to fetch"));
      await expect(setup(fetchFn).request("/x")).rejects.toMatchObject({
        status: 0,
        code: "NETWORK_ERROR",
      });
    });

    it("When fetch rejects with a non-Error, should still throw NETWORK_ERROR", async () => {
      fetchFn.mockRejectedValue("offline");
      await expect(setup(fetchFn).request("/x")).rejects.toMatchObject({
        status: 0,
        code: "NETWORK_ERROR",
      });
    });
  });

  it("When the response is 204, should resolve undefined", async () => {
    fetchFn.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(
      setup(fetchFn).request("/x", { method: "DELETE" }),
    ).resolves.toBeUndefined();
  });

  it("When using the default client, should call the /api/v1 base URL with the guest session", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { ok: true }));
    await apiClient.request("/health");
    const call = spy.mock.calls[0] ?? [];
    expect(String(call[0])).toMatch(/\/api\/v1\/health$/);
    const init: RequestInit = call[1] ?? {};
    expect((init.headers as Record<string, string>)["X-Session-Id"]).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    spy.mockRestore();
  });
});
