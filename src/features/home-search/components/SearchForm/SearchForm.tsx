import { useTranslation } from "react-i18next";
import { Icon } from "@/components/common/Icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { AIRPORT_CODES } from "../../lib/airports";
import type { SearchFieldName, TripType } from "../../types/homeSearch";
import { AirportCombobox } from "../AirportCombobox";
import { DateField } from "../DateField";
import { PassengerPicker } from "../PassengerPicker";
import type { SearchFormProps } from "./SearchForm.types";

export function SearchForm({ form, today }: SearchFormProps) {
  const { t } = useTranslation("homeSearch");
  const { values, errors, paxLimits, isSubmitting, submitError } = form;
  const isRoundTrip = values.tripType === "ROUND_TRIP";

  const airportOptions = AIRPORT_CODES.map((code) => ({
    code,
    label: t(`airport.${code}`),
  }));

  function errorText(field: SearchFieldName): string | undefined {
    const error = errors[field];
    return error ? t(`error.${error}`) : undefined;
  }

  return (
    <form
      aria-label={t("title")}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
      className="flex flex-col gap-5 rounded-lg border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur-lg md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          items={[
            { value: "ONE_WAY", label: t("tripType.oneWay") },
            { value: "ROUND_TRIP", label: t("tripType.roundTrip") },
          ]}
          value={values.tripType}
          onValueChange={(next) => form.setField("tripType", next as TripType)}
        />
        <p className="text-sm text-muted-foreground">
          {t("pax.maxPerBooking")}
        </p>
      </div>

      <div
        className={
          isRoundTrip
            ? "grid gap-4 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_1fr] lg:items-start"
            : "grid gap-4 lg:grid-cols-[1fr_auto_1fr_1fr_1fr] lg:items-start"
        }
      >
        <AirportCombobox
          label={t("field.origin")}
          placeholder={t("field.selectAirport")}
          options={airportOptions}
          value={values.origin}
          error={errorText("origin")}
          onChange={(code) => form.setField("origin", code)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="self-center lg:mt-6"
          aria-label={t("field.swap")}
          onClick={form.swapAirports}
        >
          <Icon name="swap" />
        </Button>
        <AirportCombobox
          label={t("field.destination")}
          placeholder={t("field.selectAirport")}
          options={airportOptions}
          value={values.destination}
          error={errorText("destination")}
          onChange={(code) => form.setField("destination", code)}
        />
        <DateField
          label={t("field.departDate")}
          placeholder={t("field.selectDate")}
          min={today}
          value={values.departDate}
          error={errorText("departDate")}
          onChange={(day) => form.setField("departDate", day)}
        />
        {isRoundTrip && (
          <DateField
            label={t("field.returnDate")}
            placeholder={t("field.selectDate")}
            min={values.departDate || today}
            value={values.returnDate}
            error={errorText("returnDate")}
            onChange={(day) => form.setField("returnDate", day)}
          />
        )}
        <PassengerPicker
          values={values}
          limits={paxLimits}
          onChange={(field, next) => form.setField(field, next)}
        />
      </div>

      {submitError && (
        <Alert variant="destructive" icon={<Icon name="alert" />}>
          {t(`submitError.${submitError}`)}
        </Alert>
      )}

      <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
        <a
          href="#promotions"
          className="inline-flex min-h-11 items-center text-[15px] font-medium text-iris underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
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
