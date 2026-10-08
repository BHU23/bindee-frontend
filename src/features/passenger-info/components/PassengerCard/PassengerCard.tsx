import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { COUNTRY_CODES, titleOptions } from "../../lib/rules";
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
        <Select
          label={t("fields.title")}
          options={titles}
          autoComplete="honorific-prefix"
          {...bind("title")}
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
        <Input type="date" label={t("fields.dob")} {...bind("dob")} />
        <Select
          label={t("fields.nationality")}
          options={countryOptions}
          {...bind("nationality")}
        />
        {showPassport && (
          <>
            <Input
              label={t("fields.passportNo")}
              hint={hasSavedPassport ? t("fields.passportSaved") : undefined}
              autoComplete="off"
              {...bind("passportNo")}
            />
            <Select
              label={t("fields.passportCountry")}
              options={countryOptions}
              {...bind("passportCountry")}
            />
            <Input
              type="date"
              label={t("fields.passportExpiry")}
              {...bind("passportExpiry")}
            />
          </>
        )}
      </div>
    </Card>
  );
}
