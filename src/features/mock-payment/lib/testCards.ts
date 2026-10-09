import type { CardFormValues, TestCard } from "../types/mockPayment";

/** The only cards the mock accepts (specs/mock-payment.md); tapping one fills the form. */
export const TEST_CARDS: readonly TestCard[] = [
  { number: "4242 4242 4242 4242", outcome: "SUCCESS" },
  { number: "4000 0000 0000 0002", outcome: "DECLINED" },
  { number: "4000 0000 0000 0119", outcome: "TIMEOUT" },
];

const TEST_EXPIRY = "12/30";
const TEST_CVV = "123";

export function valuesForTestCard(card: TestCard): CardFormValues {
  return {
    cardNumber: card.number,
    expiry: TEST_EXPIRY,
    cvv: TEST_CVV,
    name: "",
  };
}
