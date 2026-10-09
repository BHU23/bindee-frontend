import type { TestCard } from "../../types/mockPayment";

export interface TestCardListProps {
  cards: readonly TestCard[];
  onSelect: (card: TestCard) => void;
}
