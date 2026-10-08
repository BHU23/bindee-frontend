import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatDateTh } from "@/lib/format";
import type { SearchExpiredProps } from "./SearchExpired.types";

export function SearchExpired({
  query,
  busy = false,
  failed = false,
  onSearchAgain,
}: SearchExpiredProps) {
  const { t } = useTranslation("flightResults");
  return (
    <section className="flex flex-col gap-4 rounded-md border border-line bg-card p-6">
      <h2 className="font-display text-xl font-semibold text-midnight">
        {t("expired.title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("expired.body")}</p>
      {query && (
        <dl className="flex flex-col gap-1 rounded-sm bg-iris-mist p-4 text-sm">
          <dt className="sr-only">{t("expired.queryLabel")}</dt>
          <dd className="font-display text-lg font-semibold text-midnight">
            {t("route", {
              origin: query.origin,
              destination: query.destination,
            })}
          </dd>
          <dd>{formatDateTh(query.departDate)}</dd>
          <dd>
            {t("expired.passengers", {
              count: query.adults + query.children + query.infants,
            })}
          </dd>
        </dl>
      )}
      {failed && <Alert variant="destructive">{t("expired.failed")}</Alert>}
      <Button block disabled={busy} onClick={onSearchAgain}>
        {busy ? t("expired.searching") : t("expired.searchAgain")}
      </Button>
    </section>
  );
}
