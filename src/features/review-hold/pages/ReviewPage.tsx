import { useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { Steps } from "@/components/common/Steps";
import { Alert } from "@/components/ui/alert";
import { formatBaht } from "@/lib/format";
import {
  PASSENGERS_PATH,
  PAYMENT_METHOD_PATH,
  RESULTS_PATH,
} from "@/lib/routes";
import { ConfirmSection } from "../components/ConfirmSection";
import { ItinerarySection } from "../components/ItinerarySection";
import { PassengersSection } from "../components/PassengersSection";
import { useConfirmBooking } from "../hooks/useConfirmBooking";
import { isReviewFlow } from "../lib/itinerary";
import type { ReviewFlowState } from "../types/reviewHold";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 3;

/** Step 4. Without the flow state from passenger-info there is nothing to review, so go back to search. */
export function ReviewPage() {
  const { state } = useLocation() as { state: unknown };
  if (!isReviewFlow(state)) return <Navigate to="/" replace />;
  return <Review flow={state} />;
}

function Review({ flow }: { flow: ReviewFlowState }) {
  const { t } = useTranslation("reviewHold");
  const navigate = useNavigate();
  const confirm = useConfirmBooking(flow);
  const resultsPath = `${RESULTS_PATH}?searchId=${encodeURIComponent(flow.searchId)}`;
  const lines = [
    { label: t("price.outbound"), amount: formatBaht(flow.outbound.total) },
    ...(flow.inbound
      ? [{ label: t("price.inbound"), amount: formatBaht(flow.inbound.total) }]
      : []),
  ];

  const { booking } = confirm;
  // The booking exists: continue to the payment method (payment-method reads this state).
  useEffect(() => {
    if (!booking) return;
    void navigate(PAYMENT_METHOD_PATH, {
      state: {
        pnr: booking.pnr,
        holdExpiresAt: booking.holdExpiresAt,
        total: booking.total,
      },
    });
  }, [booking, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void confirm.submit();
  }

  return (
    <div className="flex flex-col gap-6">
      <AppHeader
        title={t("title")}
        onBack={() => void navigate(PASSENGERS_PATH, { state: flow })}
      />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <ItinerarySection
          outbound={flow.outbound}
          inbound={flow.inbound}
          editTo={resultsPath}
        />
        <PassengersSection
          passengers={flow.passengers}
          editTo={PASSENGERS_PATH}
          editState={flow}
        />
        <ConfirmSection
          lines={lines}
          total={formatBaht(confirm.total)}
          hasAcceptedTerms={confirm.hasAcceptedTerms}
          hasTermsError={confirm.hasTermsError}
          isSubmitting={confirm.isSubmitting}
          isBooked={confirm.booking !== null}
          onTermsChange={confirm.setAcceptTerms}
        />
        {confirm.submitError && (
          <Alert variant="destructive" role="alert">
            {confirm.submitError}
          </Alert>
        )}
      </form>
    </div>
  );
}
