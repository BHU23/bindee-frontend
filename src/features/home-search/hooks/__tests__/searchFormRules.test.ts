import { describe, expect, it } from "vitest";
import type { SearchFormValues } from "../../types/homeSearch";
import {
  getPaxLimits,
  serverFieldErrors,
  toFormValues,
  toSearchQuery,
  validateSearchForm,
} from "../searchFormRules";

const TODAY = "2026-10-07";

function values(overrides: Partial<SearchFormValues> = {}): SearchFormValues {
  return {
    tripType: "ONE_WAY",
    origin: "BKK",
    destination: "CNX",
    departDate: "2026-10-08",
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "ECONOMY",
    ...overrides,
  };
}

describe("validateSearchForm", () => {
  it("When the form is valid, should return no errors", () => {
    expect(validateSearchForm(values(), TODAY)).toEqual({});
  });

  it("UI-HS-03: When origin equals destination, should flag destination as sameAirport", () => {
    expect(validateSearchForm(values({ destination: "BKK" }), TODAY)).toEqual({
      destination: "sameAirport",
    });
  });

  it("When required fields are empty, should flag each as required", () => {
    expect(
      validateSearchForm(
        values({ origin: "", destination: "", departDate: "" }),
        TODAY,
      ),
    ).toEqual({
      origin: "required",
      destination: "required",
      departDate: "required",
    });
  });

  it("When the depart date is in the past, should flag pastDate", () => {
    expect(
      validateSearchForm(values({ departDate: "2026-10-06" }), TODAY),
    ).toEqual({ departDate: "pastDate" });
  });

  it("UI-HS-02: When a round trip has no return date, should flag returnDate", () => {
    expect(
      validateSearchForm(values({ tripType: "ROUND_TRIP" }), TODAY),
    ).toEqual({ returnDate: "required" });
  });

  it("When a round trip returns before departing, should flag returnBeforeDepart", () => {
    expect(
      validateSearchForm(
        values({
          tripType: "ROUND_TRIP",
          departDate: "2026-10-10",
          returnDate: "2026-10-09",
        }),
        TODAY,
      ),
    ).toEqual({ returnDate: "returnBeforeDepart" });
  });

  it("When a one-way trip has a stale return date, should ignore it", () => {
    expect(
      validateSearchForm(values({ returnDate: "2020-01-01" }), TODAY),
    ).toEqual({});
  });
});

describe("getPaxLimits", () => {
  it("UI-HS-04: When adults=1, should cap infants at 1 and children at 8", () => {
    expect(getPaxLimits(values())).toMatchObject({
      maxInfants: 1,
      maxChildren: 8,
      minAdults: 1,
    });
  });

  it("UI-HS-04: When infants=2, should not let adults drop below 2", () => {
    expect(getPaxLimits(values({ adults: 3, infants: 2 })).minAdults).toBe(2);
  });

  it("UI-HS-04: When children=4, should cap adults at 5", () => {
    expect(getPaxLimits(values({ adults: 2, children: 4 })).maxAdults).toBe(5);
  });
});

describe("mapping", () => {
  it("When one-way, should omit returnDate from the query", () => {
    expect(
      toSearchQuery(values({ returnDate: "2026-10-12" })).returnDate,
    ).toBeUndefined();
  });

  it("When round trip, should include returnDate in the query", () => {
    expect(
      toSearchQuery(
        values({ tripType: "ROUND_TRIP", returnDate: "2026-10-12" }),
      ).returnDate,
    ).toBe("2026-10-12");
  });

  it("When refilling from a one-way query, should use an empty return date", () => {
    expect(toFormValues(toSearchQuery(values())).returnDate).toBe("");
  });

  it("When the server names fields, should map known ones and ignore others", () => {
    expect(serverFieldErrors({ departDate: "x", bogus: "y" })).toEqual({
      departDate: "invalid",
    });
    expect(serverFieldErrors(undefined)).toEqual({});
  });
});
