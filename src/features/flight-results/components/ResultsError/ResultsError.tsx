import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ResultsErrorProps } from "./ResultsError.types";

export function ResultsError({ onRetry }: ResultsErrorProps) {
  const { t } = useTranslation("flightResults");
  const { t: tc } = useTranslation();
  return (
    <Alert variant="destructive" title={t("error.title")}>
      <p>{t("error.body")}</p>
      <Button variant="outline" className="mt-3" onClick={onRetry}>
        {tc("retry")}
      </Button>
    </Alert>
  );
}
