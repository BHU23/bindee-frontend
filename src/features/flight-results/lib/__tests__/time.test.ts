import { describe, expect, it } from "vitest";
import { timezoneOf } from "../airportTimezones";
import { formatAirportTime, splitDuration } from "../time";

describe("formatAirportTime", () => {
  it.each([
    ["BKK", "2026-10-14T00:30:00.000Z", "07:30"],
    ["DMK", "2026-10-14T16:59:00.000Z", "23:59"],
    ["SIN", "2026-10-14T00:30:00.000Z", "08:30"],
    ["NRT", "2026-10-14T00:30:00.000Z", "09:30"],
  ])(
    "UI-FR-01: When formatting a UTC time at %s, should use the airport timezone",
    (airport, iso, expected) => {
      expect(formatAirportTime(iso, airport)).toBe(expected);
    },
  );

  it("When the instant is midnight local time, should print 00:xx not 24:xx", () => {
    expect(formatAirportTime("2026-10-14T17:05:00.000Z", "BKK")).toBe("00:05");
  });

  it("When the airport is unknown, should fall back to UTC; invalid input gives an empty string", () => {
    expect(timezoneOf("XXX")).toBe("UTC");
    expect(formatAirportTime("2026-10-14T00:30:00.000Z", "XXX")).toBe("00:30");
    expect(formatAirportTime("nope", "BKK")).toBe("");
  });
});

describe("splitDuration", () => {
  it("When splitting minutes, should return hours and minutes", () => {
    expect(splitDuration(75)).toEqual({ hours: 1, minutes: 15 });
    expect(splitDuration(120)).toEqual({ hours: 2, minutes: 0 });
    expect(splitDuration(-5)).toEqual({ hours: 0, minutes: 0 });
  });
});
