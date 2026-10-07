import { useTranslation } from "react-i18next";
import { Counter } from "@/components/common/Counter";
import { Icon } from "@/components/common/Icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { AIRPORT_CODES } from "../../lib/airports";
import type { SearchFieldName, TripType } from "../../types/homeSearch";
import type { SearchFormProps } from "./SearchForm.types";

export function SearchForm({ form, today }: SearchFormProps) {
  const { t } = useTranslation("homeSearch");
  const { values, errors, paxLimits, isSubmitting, submitError } = form;
  const isRoundTrip = values.tripType === "ROUND_TRIP";

  const airportOptions = [
    { value: "", label: t("field.selectAirport") },
    ...AIRPORT_CODES.map((code) => ({
      value: code,
      label: t(`airport.${code}`),
    })),
  ];

  function errorText(field: SearchFieldName): string | undefined {
    const error = errors[field];
    return error ? t(`error.${error}`) : undefined;
  }

  const isTotalFull = values.adults + values.children >= 9;
  const isInfantsFull = values.infants >= values.adults;

  return (
    <form
      aria-label={t("title")}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
      className="flex flex-col gap-5 rounded-md border border-white/70 bg-glass p-4 shadow-card backdrop-blur-lg md:p-6"
    >
      <Tabs
        items={[
          { value: "ROUND_TRIP", label: t("tripType.roundTrip") },
          { value: "ONE_WAY", label: t("tripType.oneWay") },
        ]}
        value={values.tripType}
        onValueChange={(next) => form.setField("tripType", next as TripType)}
      />

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <Select
          label={t("field.origin")}
          options={airportOptions}
          value={values.origin}
          error={errorText("origin")}
          onChange={(event) => form.setField("origin", event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="self-center md:mt-6"
          aria-label={t("field.swap")}
          onClick={form.swapAirports}
        >
          <Icon name="swap" />
        </Button>
        <Select
          label={t("field.destination")}
          options={airportOptions}
          value={values.destination}
          error={errorText("destination")}
          onChange={(event) => form.setField("destination", event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="date"
          label={t("field.departDate")}
          min={today}
          value={values.departDate}
          error={errorText("departDate")}
          onChange={(event) => form.setField("departDate", event.target.value)}
        />
        {isRoundTrip && (
          <Input
            type="date"
            label={t("field.returnDate")}
            min={values.departDate || today}
            value={values.returnDate}
            error={errorText("returnDate")}
            onChange={(event) =>
              form.setField("returnDate", event.target.value)
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Counter
          label={t("pax.adults")}
          description={t("pax.adultsHint")}
          value={values.adults}
          min={paxLimits.minAdults}
          max={paxLimits.maxAdults}
          onChange={(next) => form.setField("adults", next)}
        />
        <Counter
          label={t("pax.children")}
          description={t("pax.childrenHint")}
          value={values.children}
          min={0}
          max={paxLimits.maxChildren}
          onChange={(next) => form.setField("children", next)}
        />
        <Counter
          label={t("pax.infants")}
          description={t("pax.infantsHint")}
          value={values.infants}
          min={0}
          max={paxLimits.maxInfants}
          onChange={(next) => form.setField("infants", next)}
        />
        {isTotalFull && (
          <p className="text-xs text-muted-foreground">{t("pax.limitTotal")}</p>
        )}
        {isInfantsFull && (
          <p className="text-xs text-muted-foreground">
            {t("pax.limitInfants")}
          </p>
        )}
      </div>

      <Select
        label={t("field.cabin")}
        options={[{ value: "ECONOMY", label: t("cabin.economy") }]}
        value={values.cabin}
        disabled
      />

      {submitError && (
        <Alert variant="destructive" icon={<Icon name="alert" />}>
          {t(`submitError.${submitError}`)}
        </Alert>
      )}

      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <a
          href="#promotions"
          className="inline-flex min-h-11 items-center text-[15px] font-medium text-iris underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {t("promoLink")}
        </a>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
