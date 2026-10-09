import type { PassengerSlot } from "../../lib/rules";
import type {
  FormErrors,
  Gender,
  PassengerField,
  PassengerFormValues,
} from "../../types/passengerInfo";

export interface PassengerCardProps {
  index: number;
  slot: PassengerSlot;
  values: PassengerFormValues;
  /** Gender implied by the chosen title; `null` before a title is chosen. */
  gender: Gender | null;
  /** All form errors; the card reads its own `passengers.<index>.*` keys. */
  errors: FormErrors;
  /** Passport fields apply to international trips only (UI-PX-04). */
  showPassport: boolean;
  /** A passport number was saved earlier; it is never returned, so it must be typed again. */
  hasSavedPassport: boolean;
  onChange: (field: PassengerField, value: string) => void;
  onBlur: (field: PassengerField) => void;
}
