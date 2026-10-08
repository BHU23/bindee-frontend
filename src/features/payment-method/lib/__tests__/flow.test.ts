import { describe, expect, it } from "vitest";
import { paymentFlow } from "../../__fixtures__/paymentMethod";
import { isPaymentFlow } from "../flow";

describe("isPaymentFlow", () => {
  it("When the state has a PNR, hold expiry and total, should accept it", () => {
    expect(isPaymentFlow(paymentFlow)).toBe(true);
  });

  it.each([
    null,
    undefined,
    "x",
    {},
    { ...paymentFlow, pnr: "" },
    { ...paymentFlow, holdExpiresAt: undefined },
    { ...paymentFlow, total: "1780" },
  ])("When the state is %j, should reject it", (state) => {
    expect(isPaymentFlow(state)).toBe(false);
  });
});
