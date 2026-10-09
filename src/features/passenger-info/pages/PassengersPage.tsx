import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { Steps } from "@/components/common/Steps";
import { Alert } from "@/components/ui/alert";
import { useGoBack } from "@/hooks/useGoBack";
import { RESULTS_PATH, REVIEW_PATH } from "@/lib/routes";
import { ConsentSection } from "../components/ConsentSection";
import { ContactSection } from "../components/ContactSection";
import { PassengerCard } from "../components/PassengerCard";
import { PassengerFooter } from "../components/PassengerFooter";
import { usePassengerForm } from "../hooks/usePassengerForm";
import type { PassengerFlowState } from "../types/passengerInfo";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 1;

function isFlowState(state: unknown): state is PassengerFlowState {
  if (typeof state !== "object" || state === null) return false;
  const flow = state as Partial<PassengerFlowState>;
  return Boolean(flow.draftId && flow.searchId && flow.query && flow.outbound);
}

/** Step 2. Without the flow state from fare-selection there is no draft to fill, so go back to search. */
export function PassengersPage() {
  const { state } = useLocation() as { state: unknown };
  if (!isFlowState(state)) return <Navigate to="/" replace />;
  return <Passengers flow={state} />;
}

function Passengers({ flow }: { flow: PassengerFlowState }) {
  const { t } = useTranslation("passengerInfo");
  const navigate = useNavigate();
  const form = usePassengerForm(flow);
  const goBack = useGoBack(
    `${RESULTS_PATH}?searchId=${encodeURIComponent(flow.searchId)}`,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!(await form.submit())) return;
    // review-hold reads this state; the names are what the guest just saved.
    void navigate(REVIEW_PATH, {
      state: {
        ...flow,
        passengers: form.slots.map((slot, index) => ({
          type: slot.type,
          title: form.passengers[index].title,
          firstName: form.passengers[index].firstName.trim(),
          lastName: form.passengers[index].lastName.trim(),
        })),
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AppHeader title={t("title")} onBack={goBack} />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
      {form.isRestoring ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t("loading")}
        </p>
      ) : (
        <form
          noValidate
          onSubmit={(event) => void handleSubmit(event)}
          className="flex flex-col gap-6"
        >
          <p className="text-sm text-muted-foreground">{t("intro")}</p>
          {form.slots.map((slot, index) => (
            <PassengerCard
              key={`${slot.type}-${slot.number}`}
              index={index}
              slot={slot}
              values={form.passengers[index]}
              gender={form.genders[index]}
              errors={form.errors}
              showPassport={form.isInternational}
              hasSavedPassport={form.hasSavedPassport[index]}
              onChange={(field, value) =>
                form.setPassengerField(index, field, value)
              }
              onBlur={(field) => form.blurPassengerField(index, field)}
            />
          ))}
          <ContactSection
            contact={form.contact}
            errors={form.errors}
            onChange={form.setContactField}
            onBlur={form.blurContactField}
          />
          <ConsentSection
            consent={form.consent}
            privacyError={form.errors["consent.privacy"]}
            onPrivacyChange={form.setPrivacy}
            onMarketingChange={form.setMarketing}
          />
          {form.submitError && (
            <Alert variant="destructive" role="alert">
              {form.submitError}
            </Alert>
          )}
          <PassengerFooter
            total={form.total}
            outboundTotal={flow.outbound.total}
            inboundTotal={flow.inbound?.total}
            isSubmitting={form.isSubmitting}
          />
        </form>
      )}
    </div>
  );
}
