import type {
  CardField,
  CardFormValues,
  CardPaymentBody,
} from "../types/mockPayment";

const MIN_CARD_DIGITS = 13;
const MAX_CARD_DIGITS = 19;
const MAX_CVV_DIGITS = 4;
const MIN_CVV_DIGITS = 3;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/** `42424242` → `4242 4242`; anything but digits is dropped, at most 19 digits. */
export function formatCardNumberInput(value: string): string {
  return (
    digitsOf(value)
      .slice(0, MAX_CARD_DIGITS)
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}

/** `1230` → `12/30`; the slash appears once a third digit is typed. */
export function formatExpiryInput(value: string): string {
  const digits = digitsOf(value).slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

export function formatCvvInput(value: string): string {
  return digitsOf(value).slice(0, MAX_CVV_DIGITS);
}

/**
 * Format-only validation (AC-MP-13): no Luhn, and a past expiry is accepted.
 * Returns the invalid fields in form order; empty means the form can be sent.
 */
export function validateCardForm(values: CardFormValues): CardField[] {
  const invalid: CardField[] = [];
  const cardDigits = digitsOf(values.cardNumber).length;
  if (cardDigits < MIN_CARD_DIGITS || cardDigits > MAX_CARD_DIGITS)
    invalid.push("cardNumber");
  if (!EXPIRY_PATTERN.test(values.expiry)) invalid.push("expiry");
  const cvvDigits = digitsOf(values.cvv).length;
  if (cvvDigits < MIN_CVV_DIGITS || cvvDigits > MAX_CVV_DIGITS)
    invalid.push("cvv");
  return invalid;
}

export function isCardField(value: string): value is CardField {
  return value === "cardNumber" || value === "expiry" || value === "cvv";
}

/** Wire body: digits only for the number; a blank name is omitted. */
export function toCardBody(values: CardFormValues): CardPaymentBody {
  const name = values.name.trim();
  return {
    cardNumber: digitsOf(values.cardNumber),
    expiry: values.expiry,
    cvv: values.cvv,
    ...(name === "" ? {} : { name }),
  };
}
