import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { HoldCountdown } from "@/components/common/HoldCountdown";
import { Steps } from "@/components/common/Steps";
import { TestModeBanner } from "@/components/common/TestModeBanner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/format";
import { MethodOptions } from "../components/MethodOptions";
import { useStartPayment } from "../hooks/useStartPayment";
import { isPaymentFlow } from "../lib/flow";
import type { PaymentFlowState, PaymentMethod } from "../types/paymentMethod";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 4;
/** Iteration 0: only the card flow exists (mock-payment slice 2); the others are shown but off. */
const DISABLED_METHODS: PaymentMethod[] = ["PROMPTPAY_QR", "MOBILE_BANKING"];

/** Step 5. Without the flow state from review-hold there is no booking to pay, so go back to search. */
export function PaymentMethodPage() {
  const { state } = useLocation() as { state: unknown };
  if (!isPaymentFlow(state)) return <Navigate to="/" replace />;
  return <PaymentMethodScreen flow={state} />;
}

function PaymentMethodScreen({ flow }: { flow: PaymentFlowState }) {
  const { t } = useTranslation("paymentMethod");
  const navigate = useNavigate();
  const payment = useStartPayment(flow);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void payment.submit();
  }

  return (
    <div className="flex flex-col gap-6">
      <AppHeader title={t("title")} onBack={() => void navigate(-1)} />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
      <TestModeBanner />
      <HoldCountdown pnr={flow.pnr} holdExpiresAt={flow.holdExpiresAt} />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <MethodOptions
          value={payment.method}
          disabledMethods={DISABLED_METHODS}
          onChange={payment.selectMethod}
        />
        {payment.submitError && (
          <Alert variant="destructive" role="alert">
            {payment.submitError}
          </Alert>
        )}
        <Button
          type="submit"
          block
          disabled={payment.method === null || payment.isSubmitting}
        >
          {payment.isSubmitting
            ? t("paying")
            : t("pay", { amount: formatBaht(flow.total) })}
        </Button>
      </form>
    </div>
  );
}
