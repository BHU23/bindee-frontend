import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersToParams,
  normalizePrices,
  parseFilters,
} from "../filters";

describe("filters <-> URL", () => {
  it("When the URL has no filters, should return the defaults", () => {
    expect(parseFilters(new URLSearchParams("searchId=s1"))).toEqual({
      ...DEFAULT_FILTERS,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it("UI-FR-05: When filters are written and read back, should round-trip", () => {
    const filters = {
      departure: ["morning", "evening"],
      directOnly: true,
      minPrice: 900,
      maxPrice: 2500,
      fare: ["LITE", "VALUE"],
      sort: "duration",
    } as const;
    const params = filtersToParams({
      ...filters,
      departure: [...filters.departure],
      fare: [...filters.fare],
    });
    expect(parseFilters(params)).toEqual(filters);
  });

  it("When the URL holds unknown or malformed values, should drop them", () => {
    const parsed = parseFilters(
      new URLSearchParams(
        "departure=dawn,night&fare=GOLD&sort=cheapest&minPrice=abc&maxPrice=-5&directOnly=1",
      ),
    );
    expect(parsed).toEqual({
      departure: ["night"],
      directOnly: false,
      minPrice: undefined,
      maxPrice: undefined,
      fare: [],
      sort: "price",
    });
  });

  it("When filters are default, should write an empty query", () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
  });
});

describe("countActiveFilters", () => {
  it("UI-FR-05: When counting, should count each used group once and ignore sort", () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, sort: "duration" })).toBe(
      0,
    );
    expect(
      countActiveFilters({
        departure: ["morning", "night"],
        directOnly: true,
        minPrice: 1000,
        maxPrice: 2000,
        fare: ["FLEX"],
        sort: "price",
      }),
    ).toBe(4);
  });
});

describe("normalizePrices", () => {
  const range = { min: 800, max: 3000 };
  it("When a price equals its slider bound, should drop it", () => {
    expect(
      normalizePrices(
        { ...DEFAULT_FILTERS, minPrice: 800, maxPrice: 3000 },
        range,
      ),
    ).toEqual(DEFAULT_FILTERS);
  });
  it("When a price is narrower than the bound, should keep it", () => {
    expect(
      normalizePrices(
        { ...DEFAULT_FILTERS, minPrice: 900, maxPrice: 2000 },
        range,
      ),
    ).toMatchObject({ minPrice: 900, maxPrice: 2000 });
  });
});
