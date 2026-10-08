import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import type { PaymentMethod } from "../../types/paymentMethod";
import type { MethodOptionsProps } from "./MethodOptions.types";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CARD",
  "PROMPTPAY_QR",
  "MOBILE_BANKING",
];

/**
 * Radio cards in a fieldset (UI-PM-01). Native radio inputs give the arrow-key movement for free
 * (UI-PM-06); Enter on a focused card also selects it instead of submitting the form.
 */
export function MethodOptions({
  value,
  disabledMethods = [],
  onChange,
}: MethodOptionsProps) {
  const { t } = useTranslation("paymentMethod");

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    method: PaymentMethod,
  ) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onChange(method);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 font-display text-[17px] font-semibold text-midnight">
        {t("legend")}
      </legend>
      {PAYMENT_METHODS.map((method) => {
        const isDisabled = disabledMethods.includes(method);
        const isSelected = value === method;
        return (
          <label
            key={method}
            className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <input
              type="radio"
              name="payment-method"
              value={method}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onChange(method)}
              onKeyDown={(event) => handleKeyDown(event, method)}
              className="peer sr-only"
            />
            <Card
              selected={isSelected}
              className="px-4 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/40 peer-disabled:opacity-50"
            >
              <span className="font-medium text-midnight">
                {t(`method.${method}.label`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`method.${method}.hint`)}
              </span>
              {isDisabled && (
                <span className="text-xs text-muted-foreground">
                  {t("comingSoon")}
                </span>
              )}
            </Card>
          </label>
        );
      })}
    </fieldset>
  );
}
