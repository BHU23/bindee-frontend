import type { ReviewFlowState, ReviewLeg } from "../types/reviewHold";

/** All Phase 1 flights are domestic Thai flights, so times are shown in Bangkok time, not the browser's. */
const TIME_ZONE = "Asia/Bangkok";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** UTC ISO instant → `HH:mm` in Bangkok time; empty for an invalid value. */
export function formatBangkokTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
}

/** UTC ISO instant → `YYYY-MM-DD` calendar day in Bangkok time; empty for an invalid value. */
export function bangkokDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dayFormatter.format(date);
}

/** Total for the whole party over all legs (the `expectedTotal` sent on confirm). */
export function tripTotal(flow: Pick<ReviewFlowState, "outbound" | "inbound">) {
  return flow.outbound.total + (flow.inbound?.total ?? 0);
}

function isLeg(value: unknown): value is ReviewLeg {
  if (typeof value !== "object" || value === null) return false;
  const leg = value as Partial<ReviewLeg>;
  return (
    typeof leg.total === "number" &&
    typeof leg.fareFamily === "string" &&
    typeof leg.flight === "object" &&
    leg.flight !== null
  );
}

/** Narrows the router state; a missing or malformed state means the guest did not come through the flow. */
export function isReviewFlow(state: unknown): state is ReviewFlowState {
  if (typeof state !== "object" || state === null) return false;
  const flow = state as Partial<ReviewFlowState>;
  return (
    Boolean(flow.draftId) &&
    Boolean(flow.searchId) &&
    isLeg(flow.outbound) &&
    (flow.inbound === undefined || isLeg(flow.inbound)) &&
    Array.isArray(flow.passengers) &&
    flow.passengers.length > 0
  );
}
