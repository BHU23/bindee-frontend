import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ApiError } from "@/services/apiClient";
import { savePaymentMethod, startPayment } from "../api/paymentApi";
import type { PaymentFlowState, PaymentMethod } from "../types/paymentMethod";

export interface UseStartPaymentReturn {
  method: PaymentMethod | null;
  isSubmitting: boolean;
  /** Form-level message after a failed attempt; `null` otherwise. */
  submitError: string | null;
  selectMethod: (method: PaymentMethod) => void;
  submit: () => Promise<void>;
}

/** Saves the chosen method, starts the payment and opens the method's page (UI-PM-02, AC-PM-07). */
export function useStartPayment(flow: PaymentFlowState): UseStartPaymentReturn {
  const { t } = useTranslation("paymentMethod");
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A ref, not state: two presses in the same tick must see the lock before React re-renders.
  const isLocked = useRef(false);
  // One key per screen load; a retry after a failure reuses it so the server returns the same payment.
  const idempotencyKey = useRef(crypto.randomUUID());

  function errorMessage(error: unknown): string {
    if (error instanceof ApiError && error.status === 410)
      return t("error.expired");
    if (error instanceof ApiError && error.status === 409)
      return t("error.invalidState");
    return t("error.failed");
  }

  async function submit() {
    if (isLocked.current || method === null) return;
    isLocked.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await savePaymentMethod(flow.pnr, { method });
      const payment = await startPayment(
        flow.pnr,
        { method },
        idempotencyKey.current,
      );
      // Stay locked on success: the page is being left.
      void navigate({
        pathname: saved.next,
        search: `?paymentId=${encodeURIComponent(payment.paymentId)}`,
      });
    } catch (error) {
      setSubmitError(errorMessage(error));
      isLocked.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    method,
    isSubmitting,
    submitError,
    selectMethod: setMethod,
    submit,
  };
}
