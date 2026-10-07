import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { HeroSection } from "../components/HeroSection";
import { HomeFooter } from "../components/HomeFooter";
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

/** Thin route-level screen: hero and search form first, shortcuts and reassurance follow. */
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
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-linear-to-br from-lilac via-sky to-blush"
      />
      <div className="relative z-10 flex flex-col gap-10">
        <AppHeader
          right={
            <nav
              aria-label={t("nav.flights")}
              className="flex items-center gap-1"
            >
              <span
                aria-current="page"
                className="inline-flex h-11 items-center rounded-full bg-midnight px-5 font-display text-[15px] font-semibold text-primary-foreground"
              >
                {t("nav.flights")}
              </span>
              <a
                href="#support"
                className="inline-flex h-11 items-center rounded-full px-5 font-display text-[15px] font-semibold text-foreground outline-none hover:bg-iris-mist focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {t("nav.help")}
              </a>
            </nav>
          }
        />
        <HeroSection route={popular.routes[0]} status={popular.status} />
        <SearchForm form={form} today={today} />
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
        <HomeFooter />
      </div>
    </>
  );
}
