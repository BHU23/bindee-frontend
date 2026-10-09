import { describe, expect, it } from "vitest";
import type { CardFormValues } from "../../types/mockPayment";
import {
  formatCardNumberInput,
  formatCvvInput,
  formatExpiryInput,
  isCardField,
  toCardBody,
  validateCardForm,
} from "../cardForm";

const valid: CardFormValues = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvv: "123",
  name: "",
};

describe("validateCardForm", () => {
  it("UI-MP-10: When all fields are well formed, should report no errors", () => {
    expect(validateCardForm(valid)).toEqual([]);
  });

  it("UI-MP-10: When the form is empty, should flag number, expiry and CVV in form order", () => {
    expect(
      validateCardForm({ cardNumber: "", expiry: "", cvv: "", name: "" }),
    ).toEqual(["cardNumber", "expiry", "cvv"]);
  });

  it.each([
    ["12 digits", "4242 4242 4242", false],
    ["13 digits", "4242424242424", true],
    ["19 digits", "4242 4242 4242 4242 424", true],
    ["20 digits", "4242 4242 4242 4242 4242", false],
  ])("UI-MP-10: When the number has %s, valid is %s", (_label, number, ok) => {
    const result = validateCardForm({ ...valid, cardNumber: number });
    expect(result.includes("cardNumber")).toBe(!ok);
  });

  it("UI-MP-10: When the number is not Luhn-valid, should still accept it (format only)", () => {
    expect(
      validateCardForm({ ...valid, cardNumber: "1111111111111111" }),
    ).toEqual([]);
  });

  it.each(["00/30", "13/30", "1230", "1/30", "12/3"])(
    "UI-MP-10: When the expiry is %s, should flag it",
    (expiry) => {
      expect(validateCardForm({ ...valid, expiry })).toEqual(["expiry"]);
    },
  );

  it("UI-MP-10: When the expiry is in the past, should accept it", () => {
    expect(validateCardForm({ ...valid, expiry: "01/20" })).toEqual([]);
  });

  it.each([
    ["12", true],
    ["123", false],
    ["1234", false],
    ["12345", true],
  ])("UI-MP-10: When the CVV is %s, invalid is %s", (cvv, invalid) => {
    expect(validateCardForm({ ...valid, cvv }).includes("cvv")).toBe(invalid);
  });
});

describe("input formatters", () => {
  it("When typing a number, should group by four and drop non-digits", () => {
    expect(formatCardNumberInput("4242a42424242 4242")).toBe(
      "4242 4242 4242 4242",
    );
  });

  it("When the number is longer than 19 digits, should cut it", () => {
    expect(formatCardNumberInput("1".repeat(25))).toBe(
      "1111 1111 1111 1111 111",
    );
  });

  it("When typing an expiry, should add the slash after two digits", () => {
    expect(formatExpiryInput("12")).toBe("12");
    expect(formatExpiryInput("123")).toBe("12/3");
    expect(formatExpiryInput("12/30999")).toBe("12/30");
  });

  it("When typing a CVV, should keep at most four digits", () => {
    expect(formatCvvInput("12a345")).toBe("1234");
  });
});

describe("toCardBody", () => {
  it("When the name is blank, should send digits only and omit the name", () => {
    expect(toCardBody({ ...valid, name: "  " })).toEqual({
      cardNumber: "4242424242424242",
      expiry: "12/30",
      cvv: "123",
    });
  });

  it("When a name is given, should send it trimmed", () => {
    expect(toCardBody({ ...valid, name: " Somchai " }).name).toBe("Somchai");
  });
});

describe("isCardField", () => {
  it("When the key is a card field, should be true; otherwise false", () => {
    expect(isCardField("cvv")).toBe(true);
    expect(isCardField("name")).toBe(false);
  });
});
