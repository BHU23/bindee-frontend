import { describe, expect, it } from "vitest";
import { formatBaht, formatDateTh, formatTime24 } from "../format";

describe("formatBaht", () => {
  it("UI-FND-07: When the price is 1190, should return ฿1,190", () => {
    expect(formatBaht(1190)).toBe("฿1,190");
  });

  it("When the price has thousands and decimals, should group and keep up to 2 decimals", () => {
    expect(formatBaht(1234567.5)).toBe("฿1,234,567.5");
  });

  it("When the price is null, undefined or NaN, should return an empty string, never NaN", () => {
    expect(formatBaht(null)).toBe("");
    expect(formatBaht(undefined)).toBe("");
    expect(formatBaht(Number.NaN)).toBe("");
  });
});

describe("formatDateTh", () => {
  it("UI-FND-07: When the date is 2026-10-14, should return พ. 14 ต.ค.", () => {
    expect(formatDateTh("2026-10-14")).toBe("พ. 14 ต.ค.");
  });

  it("When given a Date object, should format its local day", () => {
    expect(formatDateTh(new Date(2026, 9, 14))).toBe("พ. 14 ต.ค.");
  });

  it("When given an ISO datetime string, should format it", () => {
    expect(formatDateTh("2026-01-04T10:00:00")).toBe("อา. 4 ม.ค.");
  });

  it("When the input is null, empty or invalid, should return an empty string", () => {
    expect(formatDateTh(null)).toBe("");
    expect(formatDateTh("")).toBe("");
    expect(formatDateTh("not a date")).toBe("");
    expect(formatDateTh(new Date("nope"))).toBe("");
  });
});

describe("formatTime24", () => {
  it("UI-FND-07: When the time is 07:00, should return 07:00", () => {
    expect(formatTime24("07:00")).toBe("07:00");
    expect(formatTime24(new Date(2026, 9, 14, 7, 0))).toBe("07:00");
  });

  it("When given a datetime string, should pad and use 24-hour time", () => {
    expect(formatTime24("2026-10-14T19:05:00")).toBe("19:05");
    expect(formatTime24(new Date(2026, 9, 14, 0, 5))).toBe("00:05");
  });

  it("When the input is null or invalid, should return an empty string", () => {
    expect(formatTime24(null)).toBe("");
    expect(formatTime24(undefined)).toBe("");
    expect(formatTime24("xx")).toBe("");
  });
});
