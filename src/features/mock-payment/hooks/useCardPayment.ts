import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { confirmationPath } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import { payWithCard } from "../api/cardApi";
import {
  formatCardNumberInput,
  formatCvvInput,
  formatExpiryInput,
  isCardField,
  toCardBody,
  validateCardForm,
} from "../lib/cardForm";
import { valuesForTestCard } from "../lib/testCards";
import type {
  CardField,
  CardFieldErrors,
  CardFormValues,
  CardFlowState,
  TestCard,
} from "../types/mockPayment";

export interface UseCardPaymentOptions {
  paymentId: string;
  flow: CardFlowState;
}

export interface UseCardPaymentReturn {
  values: CardFormValues;
  /** One fix-it sentence per malformed field (UI-MP-10). */
  errors: CardFieldErrors;
  isSubmitting: boolean;
  /** Form-level message after a failed payment; `null` otherwise. */
  submitError: string | null;
  setField: (field: keyof CardFormValues, value: string) => void;
  fillTestCard: (card: TestCard) => void;
  submit: () => Promise<void>;
}

const EMPTY_VALUES: CardFormValues = {
  cardNumber: "",
  expiry: "",
  cvv: "",
  name: "",
};

const FORMATTERS: Partial<Record<keyof CardFormValues, (v: string) => string>> =
  {
    cardNumber: formatCardNumberInput,
    expiry: formatExpiryInput,
    cvv: formatCvvInput,
  };

/** Card form state, format validation, double-press guard and the card payment call (UI-MP-02, UI-MP-10). */
export function useCardPayment({
  paymentId,
  flow,
}: UseCardPaymentOptions): UseCardPaymentReturn {
  const { t } = useTranslation("mockPayment");
  const navigate = useNavigate();
  const [values, setValues] = useState<CardFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CardFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A ref, not state: two presses in the same tick must see the lock before React re-renders.
  const isLocked = useRef(false);

  function fieldMessage(field: CardField): string {
    return t(`error.${field}`);
  }

  function setField(field: keyof CardFormValues, value: string) {
    const format = FORMATTERS[field];
    setValues((current) => ({
      ...current,
      [field]: format ? format(value) : value,
    }));
    // Clear the message as soon as the guest edits that field.
    setErrors(({ [field as CardField]: _cleared, ...rest }) => rest);
  }

  function fillTestCard(card: TestCard) {
    setValues(valuesForTestCard(card));
    setErrors({});
    setSubmitError(null);
  }

  function apiErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.status === 422) return t("error.notTestCard");
      if (error.status === 410) return t("error.expired");
      if (error.status === 409) return t("error.invalidState");
    }
    return t("error.failed");
  }

  /** Maps backend `error.fields` onto the same messages; `false` when it had none we know. */
  function applyServerFields(error: unknown): boolean {
    if (!(error instanceof ApiError) || error.status !== 400) return false;
    const fieldErrors: CardFieldErrors = {};
    for (const key of Object.keys(error.fields ?? {})) {
      if (isCardField(key)) fieldErrors[key] = fieldMessage(key);
    }
    if (Object.keys(fieldErrors).length === 0) return false;
    setErrors(fieldErrors);
    return true;
  }

  async function submit() {
    if (isLocked.current) return;
    const invalid = validateCardForm(values);
    setSubmitError(null);
    if (invalid.length > 0) {
      setErrors(Object.fromEntries(invalid.map((f) => [f, fieldMessage(f)])));
      return;
    }
    setErrors({});
    isLocked.current = true;
    setIsSubmitting(true);
    try {
      const result = await payWithCard(paymentId, toCardBody(values));
      if (result.status === "SUCCESS") {
        // Stay locked on success: the page is being left.
        void navigate(confirmationPath(flow.pnr), { replace: true });
        return;
      }
      setSubmitError(
        t(
          result.failureCode === "MOCK_TIMEOUT"
            ? "error.timeout"
            : "error.declined",
        ),
      );
    } catch (error) {
      if (!applyServerFields(error)) setSubmitError(apiErrorMessage(error));
    }
    isLocked.current = false;
    setIsSubmitting(false);
  }

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    setField,
    fillTestCard,
    submit,
  };
}
