import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { Icon } from "@/components/common/Icon";
import { Steps } from "@/components/common/Steps";
import { Button } from "@/components/ui/button";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { FareSelectionSheet, useOutboundFlow } from "@/features/fare-selection";
import { formatBaht, formatDateTh } from "@/lib/format";
import { getFlights } from "../api/flightResultsApi";
import { DateStrip, type DateStripDay } from "../components/DateStrip";
import { EmptyResults } from "../components/EmptyResults";
import { FilterSheet } from "../components/FilterSheet";
import { FlightCard } from "../components/FlightCard";
import { ResultsError } from "../components/ResultsError";
import { ResultsSkeleton } from "../components/ResultsSkeleton";
import { SearchExpired } from "../components/SearchExpired";
import { SortControl } from "../components/SortControl";
import { useSearchSwitch } from "../hooks/useSearchSwitch";
import { expiredQueryOf, isSearchExpired } from "../lib/expired";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersToParams,
  parseFilters,
} from "../lib/filters";
import type {
  CalendarDayDto,
  FlightFilters,
  FlightResultsResponse,
} from "../types/flightResults";

const STEP_KEYS = ["flight", "passengers", "extras", "review", "pay"] as const;
const CURRENT_STEP = 0;

function toStripDays(calendar: CalendarDayDto[]): DateStripDay[] {
  const fares = calendar.flatMap((day) =>
    day.soldOut || day.lowestFare === null ? [] : [day.lowestFare],
  );
  const cheapest = fares.length > 0 ? Math.min(...fares) : null;
  return calendar.map((day) => ({
    date: day.date,
    label: formatDateTh(day.date),
    price: day.soldOut ? undefined : formatBaht(day.lowestFare),
    lowest:
      !day.soldOut && day.lowestFare !== null && day.lowestFare === cheapest,
    soldOut: day.soldOut,
  }));
}

/** Route screen: needs a `searchId` in the URL; without one there is nothing to show. */
export function FlightResultsPage() {
  const [params] = useSearchParams();
  const searchId = params.get("searchId");
  if (!searchId) return <Navigate to="/" replace />;
  return <FlightResults searchId={searchId} />;
}

function FlightResults({ searchId }: { searchId: string }) {
  const { t } = useTranslation("flightResults");
  const { t: tf } = useTranslation("fareSelection");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const filterKey = filtersToParams(filters).toString();
  const [filterOpen, setFilterOpen] = useState(false);
  const switcher = useSearchSwitch(filters);

  const { data, status, error, reload } =
    useAsyncResource<FlightResultsResponse>(
      (signal) => getFlights(searchId, filters, signal),
      [searchId, filterKey],
    );

  const outbound = useOutboundFlow({ searchId, query: data?.query });

  function applyFilters(next: FlightFilters) {
    const nextParams = filtersToParams(next);
    nextParams.set("searchId", searchId);
    setParams(nextParams);
  }

  function goHome() {
    void navigate("/");
  }

  const header = (
    <>
      <AppHeader title={t("title")} onBack={() => navigate(-1)} />
      <Steps
        steps={STEP_KEYS.map((key) => t(`steps.${key}`))}
        current={CURRENT_STEP}
      />
    </>
  );

  if (status === "error" && isSearchExpired(error)) {
    const query = expiredQueryOf(error);
    return (
      <div className="flex flex-col gap-6">
        {header}
        <SearchExpired
          query={query}
          busy={switcher.isBusy}
          failed={switcher.failed}
          onSearchAgain={() => (query ? void switcher.start(query) : goHome())}
        />
      </div>
    );
  }

  const isEmpty = status === "success" && data?.flights.length === 0;
  const activeCount = countActiveFilters(filters);

  return (
    <div className="flex flex-col gap-6">
      {header}
      {status === "error" && <ResultsError onRetry={reload} />}
      {data && status !== "error" && !isEmpty && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-midnight">
            {t("route", {
              origin: data.query.origin,
              destination: data.query.destination,
            })}
          </h2>
          <DateStrip
            days={toStripDays(data.calendar)}
            value={data.query.departDate}
            disabled={switcher.isBusy}
            onValueChange={(departDate) =>
              void switcher.start({ ...data.query, departDate })
            }
          />
          {switcher.failed && (
            <p role="alert" className="text-sm text-destructive">
              {t("error.switchFailed")}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setFilterOpen(true)}>
              <Icon name="filter" />
              {activeCount > 0
                ? t("filter.openWithCount", { count: activeCount })
                : t("filter.open")}
            </Button>
            <SortControl
              value={filters.sort}
              onChange={(sort) => applyFilters({ ...filters, sort })}
            />
          </div>
          <FilterSheet
            open={filterOpen}
            onOpenChange={setFilterOpen}
            filters={filters}
            priceRange={data.priceRange}
            onApply={applyFilters}
          />
        </section>
      )}
      {status === "loading" && <ResultsSkeleton />}
      {isEmpty && data && (
        <EmptyResults
          calendar={data.calendar}
          selectedDate={data.query.departDate}
          busy={switcher.isBusy}
          hasActiveFilters={activeCount > 0}
          onSelectDay={(departDate) =>
            void switcher.start({ ...data.query, departDate })
          }
          onEditSearch={goHome}
          onResetFilters={() =>
            applyFilters({ ...DEFAULT_FILTERS, sort: filters.sort })
          }
        />
      )}
      {status === "success" && data && !isEmpty && (
        <>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t("resultCount", { count: data.flights.length })}
          </p>
          <ul className="flex flex-col gap-3">
            {data.flights.map((flight) => (
              <li key={flight.flightId}>
                <FlightCard
                  flight={flight}
                  onSelect={(picked) => void outbound.selectFlight(picked)}
                />
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">{t("priceNote")}</p>
          {outbound.hasError && !outbound.priceChange && (
            <p role="alert" className="text-sm text-destructive">
              {tf("draftError")}
            </p>
          )}
          {outbound.draftId && (
            <FareSelectionSheet
              open={outbound.isSheetOpen}
              onOpenChange={outbound.setSheetOpen}
              flight={outbound.flight}
              draftId={outbound.draftId}
              leg="outbound"
              onSelected={outbound.handleSelected}
              onPriceChanged={outbound.handlePriceChanged}
            />
          )}
        </>
      )}
    </div>
  );
}
