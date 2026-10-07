import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionId, resetSessionForTests } from "../guestSession";

describe("getSessionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    resetSessionForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("AC-FND-09: When first called, should create a UUID and store it", () => {
    const id = getSessionId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(window.localStorage.getItem("bindee.sessionId")).toBe(id);
  });

  it("AC-FND-09: When called again, should return the same stored id", () => {
    expect(getSessionId()).toBe(getSessionId());
  });

  it("When storage is blocked, should fall back to an in-memory id that stays stable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const id = getSessionId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(getSessionId()).toBe(id);
  });
});
