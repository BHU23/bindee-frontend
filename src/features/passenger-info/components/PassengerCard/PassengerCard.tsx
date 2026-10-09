import { useState } from "react";
import { addYears, startOfDay, subYears } from "date-fns";
import { useTranslation } from "react-i18next";
import { DatePickerField } from "@/components/common/DatePickerField";
import { SelectField } from "@/components/common/SelectField";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  COUNTRY_CODES,
  DOB_YEARS_BACK,
  PASSPORT_YEARS_AHEAD,
  titleOptions,
} from "../../lib/rules";
import type { PassengerField } from "../../types/passengerInfo";
import type { PassengerCardProps } from "./PassengerCard.types";

/** One passenger: the title (adult 1, child 1, ...), age hint and the fields that match the travel document. */
export function PassengerCard({
  index,
  slot,
  values,
  gender,
  errors,
  showPassport,
  hasSavedPassport,
  onChange,
  onBlur,
}: PassengerCardProps) {
  const { t } = useTranslation("passengerInfo");
  function error(field: PassengerField): string | undefined {
    return errors[`passengers.${index}.${field}`];
  }
  function bind(field: PassengerField) {
    return {
      value: values[field],
      error: error(field),
      onChange: (event: { target: { value: string } }) =>
        onChange(field, event.target.value),
      onBlur: () => onBlur(field),
    };
  }
  function bindSelect(field: PassengerField) {
    return {
      value: values[field],
      error: error(field),
      onValueChange: (value: string) => onChange(field, value),
      onBlur: () => onBlur(field),
    };
  }
  function bindDate(field: PassengerField) {
    return {
      ...bindSelect(field),
      placeholder: t("fields.datePlaceholder"),
    };
  }
  const [today] = useState(() => startOfDay(new Date()));
  const countryOptions = [
    { value: "", label: t("fields.nationalityPlaceholder") },
    ...COUNTRY_CODES.map((code) => ({
      value: code,
      label: t(`countries.${code}`),
    })),
  ];
  const titles = [
    { value: "", label: t("fields.titlePlaceholder") },
    ...titleOptions(slot.type).map((title) => ({ value: title, label: title })),
  ];

  return (
    <Card
      role="group"
      aria-labelledby={`passenger-${index}-title`}
      data-slot="passenger-card"
    >
      <div className="flex flex-col gap-3 px-4">
        <div className="flex flex-col gap-0.5">
          <h2
            id={`passenger-${index}-title`}
            className="font-display text-[17px] font-semibold text-midnight"
          >
            {t(`passenger.${slot.type}`, { n: slot.number })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t(`ageHint.${slot.type}`)}
          </p>
        </div>
        <SelectField
          label={t("fields.title")}
          options={titles}
          autoComplete="honorific-prefix"
          {...bindSelect("title")}
        />
        {gender && (
          <p className="text-sm text-muted-foreground">
            {t("fields.gender")}: {t(`gender.${gender}`)}
          </p>
        )}
        <Input
          label={t("fields.firstName")}
          autoComplete="off"
          {...bind("firstName")}
        />
        <Input
          label={t("fields.middleName")}
          autoComplete="off"
          {...bind("middleName")}
        />
        <Input
          label={t("fields.lastName")}
          autoComplete="off"
          {...bind("lastName")}
        />
        <DatePickerField
          label={t("fields.dob")}
          startMonth={subYears(today, DOB_YEARS_BACK)}
          endMonth={today}
          disabledDays={{ after: today }}
          {...bindDate("dob")}
        />
        <SelectField
          label={t("fields.nationality")}
          options={countryOptions}
          {...bindSelect("nationality")}
        />
        {showPassport && (
          <>
            <Input
              label={t("fields.passportNo")}
              hint={hasSavedPassport ? t("fields.passportSaved") : undefined}
              autoComplete="off"
              {...bind("passportNo")}
            />
            <SelectField
              label={t("fields.passportCountry")}
              options={countryOptions}
              {...bindSelect("passportCountry")}
            />
            <DatePickerField
              label={t("fields.passportExpiry")}
              startMonth={today}
              endMonth={addYears(today, PASSPORT_YEARS_AHEAD)}
              disabledDays={{ before: today }}
              {...bindDate("passportExpiry")}
            />
          </>
        )}
      </div>
    </Card>
  );
}
