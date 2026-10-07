import { describe, expect, it } from "vitest";
import { bangkokDay } from "../dates";

describe("bangkokDay", () => {
  it("When it is already the next day in Bangkok, should use the Bangkok day", () => {
    expect(bangkokDay("2026-10-07T18:00:00.000Z")).toBe("2026-10-08");
  });

  it("When the instant is a code's valid-until, should give that code's calendar day", () => {
    expect(bangkokDay("2026-12-31T16:59:59.999Z")).toBe("2026-12-31");
  });

  it("When called without an argument, should return a YYYY-MM-DD day", () => {
    expect(bangkokDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
