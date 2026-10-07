import type { PaxLimits } from "../../hooks/searchFormRules";
import type { SearchFormValues } from "../../types/homeSearch";

export interface PassengerPickerProps {
  values: Pick<SearchFormValues, "adults" | "children" | "infants" | "cabin">;
  limits: PaxLimits;
  onChange: (field: "adults" | "children" | "infants", value: number) => void;
}
