import { describe, expect, it } from "vitest";
import { cardFlow } from "../../__fixtures__/mockPayment";
import { isCardFlow } from "../flow";

describe("isCardFlow", () => {
  it("When the state has pnr, hold expiry, amount and reference, should be true", () => {
    expect(isCardFlow(cardFlow)).toBe(true);
  });

  it.each([
    null,
    undefined,
    "x",
    {},
    { ...cardFlow, pnr: "" },
    { ...cardFlow, amount: "1" },
  ])("When the state is %j, should be false", (state) => {
    expect(isCardFlow(state)).toBe(false);
  });
});
