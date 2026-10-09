import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useSearchParams } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { HoldCountdown } from "@/components/common/HoldCountdown";
import { Steps } from "@/components/common/Steps";
import { TestModeBanner } from "@/components/common/TestModeBanner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGoBack } from "@/hooks/useGoBack";
import { formatBaht } from "@/lib/format";
import { TestCardList } from "../components/TestCardList";
import { useCardPayment } from "../hooks/useCardPayment";
import { isCardFlow } from "../lib/flow";
import { TEST_CARDS } from "../lib/testCards";
import type { CardFlowState } from "../types/mockPayment";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 4;

/** Mock card page. Without the payment id and the flow state from payment-method there is nothing to pay, so go back to search. */
export function CardPaymentPage() {
  const { state } = useLocation() as { state: unknown };
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  if (!paymentId || !isCardFlow(state)) return <Navigate to="/" replace />;
  return <CardPaymentScreen paymentId={paymentId} flow={state} />;
}

function CardPaymentScreen({
  paymentId,
  flow,
}: {
  paymentId: string;
  flow: CardFlowState;
}) {
  const { t } = useTranslation("mockPayment");
  const goBack = useGoBack("/");
  const card = useCardPayment({ paymentId, flow });
  const amount = formatBaht(flow.amount);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void card.submit();
  }

  const summary: [string, string][] = [
    [t("summary.merchant"), t("summary.merchantName")],
    [t("summary.amount"), amount],
    [t("summary.pnr"), flow.pnr],
    [t("summary.reference"), flow.mockRef],
  ];

  return (
    <div className="flex flex-col gap-6">
      <AppHeader title={t("title")} onBack={goBack} />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
      <TestModeBanner>{t("banner")}</TestModeBanner>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {summary.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium break-words tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <HoldCountdown pnr={flow.pnr} holdExpiresAt={flow.holdExpiresAt} />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t("field.cardNumber")}
          inputMode="numeric"
          autoComplete="cc-number"
          value={card.values.cardNumber}
          error={card.errors.cardNumber}
          onChange={(e) => card.setField("cardNumber", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("field.expiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={card.values.expiry}
            error={card.errors.expiry}
            onChange={(e) => card.setField("expiry", e.target.value)}
          />
          <Input
            label={t("field.cvv")}
            inputMode="numeric"
            autoComplete="cc-csc"
            value={card.values.cvv}
            error={card.errors.cvv}
            onChange={(e) => card.setField("cvv", e.target.value)}
          />
        </div>
        <Input
          label={t("field.name")}
          autoComplete="cc-name"
          value={card.values.name}
          onChange={(e) => card.setField("name", e.target.value)}
        />
        <TestCardList cards={TEST_CARDS} onSelect={card.fillTestCard} />
        {card.submitError && (
          <Alert variant="destructive" role="alert">
            {card.submitError}
          </Alert>
        )}
        <Button type="submit" block disabled={card.isSubmitting}>
          {card.isSubmitting ? t("paying") : t("pay", { amount })}
        </Button>
      </form>
    </div>
  );
}
