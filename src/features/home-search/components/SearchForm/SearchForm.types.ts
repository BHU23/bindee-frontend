import type { UseSearchFormReturn } from "../../hooks/useSearchForm";

export interface SearchFormProps {
  form: UseSearchFormReturn;
  /** Bangkok calendar day, YYYY-MM-DD: the earliest pickable date. */
  today: string;
}
