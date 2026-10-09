import { describe, expect, it } from "vitest";
import { reviewFlow, roundTripReviewFlow } from "../../__fixtures__/reviewHold";
import {
  bangkokDay,
  formatBangkokTime,
  isReviewFlow,
  tripTotal,
} from "../itinerary";

describe("itinerary", () => {
  describe("formatBangkokTime", () => {
    it("When given a UTC instant, should show the Bangkok clock time", () => {
      expect(formatBangkokTime("2026-10-14T00:30:00.000Z")).toBe("07:30");
    });

    it("When the value is invalid, should return an empty string", () => {
      expect(formatBangkokTime("nope")).toBe("");
    });
  });

  describe("bangkokDay", () => {
    it("When the UTC instant is already the next day in Bangkok, should return the Bangkok day", () => {
      expect(bangkokDay("2026-10-13T18:00:00.000Z")).toBe("2026-10-14");
    });

    it("When the value is invalid, should return an empty string", () => {
      expect(bangkokDay("nope")).toBe("");
    });
  });

  describe("tripTotal", () => {
    it("UI-RH-01: When one way, should be the outbound total", () => {
      expect(tripTotal(reviewFlow)).toBe(1090);
    });

    it("UI-RH-01: When round trip, should add both legs", () => {
      expect(tripTotal(roundTripReviewFlow)).toBe(1780);
    });
  });

  describe("isReviewFlow", () => {
    it("When the state is complete, should accept it", () => {
      expect(isReviewFlow(reviewFlow)).toBe(true);
      expect(isReviewFlow(roundTripReviewFlow)).toBe(true);
    });

    it.each([
      ["null", null],
      ["a string", "x"],
      ["no draft", { ...reviewFlow, draftId: "" }],
      ["no outbound", { ...reviewFlow, outbound: undefined }],
      ["outbound null", { ...reviewFlow, outbound: null }],
      ["outbound without flight", { ...reviewFlow, outbound: { total: 1 } }],
      ["bad inbound", { ...reviewFlow, inbound: { total: 1 } }],
      ["no passengers", { ...reviewFlow, passengers: [] }],
      ["passengers not a list", { ...reviewFlow, passengers: "x" }],
    ])("When the state has %s, should reject it", (_name, state) => {
      expect(isReviewFlow(state)).toBe(false);
    });
  });
});
