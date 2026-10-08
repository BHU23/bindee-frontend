import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/services/apiClient";
import { createBooking } from "../api/bookingApi";
import { tripTotal } from "../lib/itinerary";
import type { BookingResponse, ReviewFlowState } from "../types/reviewHold";

export interface UseConfirmBookingReturn {
  hasAcceptedTerms: boolean;
  /** `true` after a blocked attempt without the T&C; cleared once accepted. */
  hasTermsError: boolean;
  isSubmitting: boolean;
  /** The created booking; `null` until Confirm booking succeeds. */
  booking: BookingResponse | null;
  /** Form-level message after a failed confirmation; `null` otherwise. */
  submitError: string | null;
  total: number;
  setAcceptTerms: (value: boolean) => void;
  submit: () => Promise<void>;
}

/** T&C gate, double-click guard and Confirm booking for the review screen (UI-RH-03, UI-RH-05). */
export function useConfirmBooking(
  flow: ReviewFlowState,
): UseConfirmBookingReturn {
  const { t } = useTranslation("reviewHold");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasTermsError, setHasTermsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A ref, not state: two clicks in the same tick must see the lock before React re-renders.
  const isLocked = useRef(false);
  // One key per confirmation; a retry after a failure reuses it so the server returns the same PNR.
  const idempotencyKey = useRef<string | null>(null);
  const total = tripTotal(flow);

  function setAcceptTerms(value: boolean) {
    setHasAcceptedTerms(value);
    if (value) setHasTermsError(false);
  }

  async function submit() {
    if (isLocked.current || booking) return;
    if (!hasAcceptedTerms) {
      setHasTermsError(true);
      return;
    }
    isLocked.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      setBooking(
        await createBooking(
          { draftId: flow.draftId, acceptTerms: true, expectedTotal: total },
          idempotencyKey.current,
        ),
      );
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 410
          ? t("error.expired")
          : t("error.failed"),
      );
    } finally {
      isLocked.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    hasAcceptedTerms,
    hasTermsError,
    isSubmitting,
    booking,
    submitError,
    total,
    setAcceptTerms,
    submit,
  };
}
