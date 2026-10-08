import type { SortKey } from "../../types/flightResults";

export interface SortControlProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}
