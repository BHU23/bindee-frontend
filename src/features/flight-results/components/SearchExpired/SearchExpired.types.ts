import type { SearchQueryDto } from "../../types/flightResults";

export interface SearchExpiredProps {
  /** Criteria of the expired search; null when the server did not send them. */
  query: SearchQueryDto | null;
  busy?: boolean;
  /** True after a search-again attempt failed. */
  failed?: boolean;
  onSearchAgain: () => void;
}
