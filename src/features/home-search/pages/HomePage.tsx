import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { PopularRoutes } from "../components/PopularRoutes";
import { PromotionList } from "../components/PromotionList";
import { RecentSearches } from "../components/RecentSearches";
import { SearchForm } from "../components/SearchForm";
import { usePopularRoutes } from "../hooks/usePopularRoutes";
import { usePromotions } from "../hooks/usePromotions";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useSearchForm } from "../hooks/useSearchForm";
import { bangkokDay } from "../lib/dates";
import { RESULTS_PATH } from "../lib/routes";

/** Thin route-level screen: the search form comes first, shortcuts follow. */
export function HomePage() {
  const { t } = useTranslation("homeSearch");
  const navigate = useNavigate();
  const today = useMemo(() => bangkokDay(), []);

  const form = useSearchForm({
    today,
    onSearched: ({ searchId }) =>
      navigate(`${RESULTS_PATH}?searchId=${encodeURIComponent(searchId)}`),
  });
  const recent = useRecentSearches();
  const popular = usePopularRoutes();
  const promotions = usePromotions();

  return (
    <div className="flex flex-col gap-8">
      <AppHeader />
      <section className="flex flex-col gap-4 rounded-lg bg-linear-to-br from-lilac via-sky to-blush p-4 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[36px] leading-10 font-semibold break-words text-midnight md:text-[56px] md:leading-[60px]">
            {t("title")}
          </h1>
          <p className="text-slate">{t("subtitle")}</p>
        </div>
        <SearchForm form={form} today={today} />
      </section>
      <RecentSearches
        searches={recent.searches}
        isBusy={form.isSubmitting}
        onSelect={(query) => void form.searchAgain(query)}
      />
      <PopularRoutes
        routes={popular.routes}
        status={popular.status}
        onRetry={popular.reload}
        onSelect={(route) => {
          form.setField("origin", route.origin);
          form.setField("destination", route.destination);
        }}
      />
      <PromotionList
        promotions={promotions.promotions}
        status={promotions.status}
        onRetry={promotions.reload}
      />
    </div>
  );
}
