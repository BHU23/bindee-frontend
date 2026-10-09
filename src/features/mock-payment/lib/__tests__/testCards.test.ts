import { describe, expect, it } from "vitest";
import { validateCardForm } from "../cardForm";
import { TEST_CARDS, valuesForTestCard } from "../testCards";

describe("TEST_CARDS", () => {
  it("UI-MP-02: When listed, should cover success, declined and timeout", () => {
    expect(TEST_CARDS.map((c) => [c.number, c.outcome])).toEqual([
      ["4242 4242 4242 4242", "SUCCESS"],
      ["4000 0000 0000 0002", "DECLINED"],
      ["4000 0000 0000 0119", "TIMEOUT"],
    ]);
  });

  it("UI-MP-02: When a test card fills the form, should produce values that pass validation", () => {
    for (const card of TEST_CARDS) {
      const values = valuesForTestCard(card);
      expect(values.cardNumber).toBe(card.number);
      expect(validateCardForm(values)).toEqual([]);
    }
  });
});
