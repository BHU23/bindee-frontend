import { useTranslation } from "react-i18next";
import type { TestCardListProps } from "./TestCardList.types";

/** Tappable test cards with the outcome each one produces (UI-MP-02). */
export function TestCardList({ cards, onSelect }: TestCardListProps) {
  const { t } = useTranslation("mockPayment");
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[13px] font-medium">{t("testCards.title")}</h2>
      <ul className="flex flex-col gap-2">
        {cards.map((card) => {
          const outcome = t(`testCards.outcome.${card.outcome}`);
          return (
            <li key={card.number}>
              <button
                type="button"
                aria-label={t("testCards.fill", {
                  number: card.number,
                  outcome,
                })}
                onClick={() => onSelect(card)}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-sm border border-dashed border-control-border bg-card px-4 py-2 text-left text-[15px] outline-none hover:bg-iris-mist focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <span className="tabular-nums">{card.number}</span>
                <span className="text-sm text-muted-foreground">{outcome}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
