import type { RecentSearch, SearchQueryDto } from "../../types/homeSearch";

export interface RecentSearchesProps {
  searches: RecentSearch[];
  isBusy?: boolean;
  onSelect: (query: SearchQueryDto) => void;
}
