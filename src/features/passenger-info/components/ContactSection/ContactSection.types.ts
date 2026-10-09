import type {
  ContactField,
  ContactFormValues,
  FormErrors,
} from "../../types/passengerInfo";

export interface ContactSectionProps {
  contact: ContactFormValues;
  errors: FormErrors;
  onChange: (field: ContactField, value: string) => void;
  onBlur: (field: ContactField) => void;
}
