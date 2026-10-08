import type { PaymentMethod } from "../../types/paymentMethod";

export interface MethodOptionsProps {
  /** The chosen method; `null` until the guest picks one. */
  value: PaymentMethod | null;
  /** Methods that are shown but cannot be chosen yet. */
  disabledMethods?: PaymentMethod[];
  onChange: (method: PaymentMethod) => void;
}
