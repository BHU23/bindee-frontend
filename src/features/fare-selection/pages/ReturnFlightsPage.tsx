import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { Steps } from "@/components/common/Steps";
import { Alert } from "@/components/ui/alert";
import { useGoBack } from "@/hooks/useGoBack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlightCard } from "@/features/flight-results/components/FlightCard";
import { ResultsError } from "@/features/flight-results/components/ResultsError";
import { ResultsSkeleton } from "@/features/flight-results/components/ResultsSkeleton";
import { isSearchExpired } from "@/features/flight-results/lib/expired";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { formatAirportTime } from "@/features/flight-results/lib/time";
import { formatBaht } from "@/lib/format";
import { RESULTS_PATH } from "@/lib/routes";
import { getReturnFlights } from "../api/bookingApi";
import { FareSelectionSheet } from "../components/FareSelectionSheet";
import { TripTotalFooter } from "../components/TripTotalFooter";
import { useReturnLeg } from "../hooks/useReturnLeg";
import type {
  FareFlowState,
  LegSelection,
  ReturnFlightsResponse,
} from "../types/booking";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 0;

function isFlowState(state: unknown): state is FareFlowState {
  if (typeof state !== "object" || state === null) return false;
  const flow = state as Partial<FareFlowState>;
  return Boolean(flow.draftId && flow.searchId && flow.outbound);
}

/** Round-trip step 2. Without the flow state from the fare sheet there is nothing to continue. */
export function ReturnFlightsPage() {
  const { state } = useLocation() as { state: unknown };
  if (!isFlowState(state)) return <Navigate to={RESULTS_PATH} replace />;
  // Keyed by the outbound so a different outbound starts with a clean return selection (UI-FS-09).
  const outboundKey = `${state.draftId}:${state.outbound.flight.flightId}:${state.outbound.fareFamily}`;
  return <ReturnFlights key={outboundKey} flow={state} />;
}

function OutboundSummary({
  outbound,
  onChange,
}: {
  outbound: LegSelection;
  onChange: () => void;
}) {
  const { t } = useTranslation("returnFlights");
  const { flight } = outbound;
  return (
    <Card className="gap-2 px-4" data-slot="outbound-summary">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {t("outbound.label")}
        </span>
        <Button
          variant="link"
          aria-label={t("outbound.changeAria")}
          onClick={onChange}
        >
          {t("outbound.change")}
        </Button>
      </div>
      <p className="font-display text-base font-semibold text-midnight">
        {t("route", { origin: flight.from, destination: flight.to })}
      </p>
      <p className="text-sm">
        {flight.flightNo} · {formatAirportTime(flight.depart, flight.from)} →{" "}
        {formatAirportTime(flight.arrive, flight.to)} ·{" "}
        {formatBaht(outbound.total)}
      </p>
    </Card>
  );
}

function ReturnFlights({ flow }: { flow: FareFlowState }) {
  const { t } = useTranslation("returnFlights");
  const navigate = useNavigate();
  const goBack = useGoBack(
    `${RESULTS_PATH}?searchId=${encodeURIComponent(flow.searchId)}`,
  );
  const leg = useReturnLeg(flow);
  const { data, status, error, reload } =
    useAsyncResource<ReturnFlightsResponse>(
      (signal) => getReturnFlights(flow.draftId, signal),
      [flow.draftId],
    );

  function changeOutbound() {
    void navigate(
      `${RESULTS_PATH}?searchId=${encodeURIComponent(flow.searchId)}`,
    );
  }

  const header = (
    <>
      <AppHeader title={t("title")} onBack={goBack} />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
    </>
  );

  if (status === "error" && isSearchExpired(error)) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <section className="flex flex-col gap-4 rounded-md border border-line bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-midnight">
            {t("expired.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("expired.body")}</p>
          <Button block onClick={() => void navigate("/")}>
            {t("expired.searchAgain")}
          </Button>
        </section>
      </div>
    );
  }

  const flights = data?.flights ?? [];
  const isEmpty = status === "success" && flights.length === 0;
  const selections = leg.returnSelection
    ? [flow.outbound, leg.returnSelection]
    : [flow.outbound];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {header}
      <OutboundSummary outbound={flow.outbound} onChange={changeOutbound} />
      <Alert variant="info">{t("notice")}</Alert>
      {status === "loading" && <ResultsSkeleton />}
      {status === "error" && <ResultsError onRetry={reload} />}
      {isEmpty && (
        <section className="flex flex-col gap-4 rounded-md border border-line bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-midnight">
            {t("empty.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("empty.body")}</p>
          <Button block onClick={changeOutbound}>
            {t("empty.changeOutbound")}
          </Button>
        </section>
      )}
      {status === "success" && !isEmpty && (
        <>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t("resultCount", { count: flights.length })}
          </p>
          <ul className="flex flex-col gap-3">
            {flights.map((flight) => (
              <li key={flight.flightId}>
                <FlightCard flight={flight} onSelect={leg.openFlight} />
              </li>
            ))}
          </ul>
        </>
      )}
      <FareSelectionSheet
        open={leg.selectedFlight !== null}
        onOpenChange={(open) => !open && leg.closeSheet()}
        flight={leg.selectedFlight}
        draftId={flow.draftId}
        leg="return"
        onSelected={leg.handleSelected}
        onPriceChanged={leg.handlePriceChanged}
      />
      <TripTotalFooter selections={selections} />
    </div>
  );
}
