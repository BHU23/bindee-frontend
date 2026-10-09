import { useTranslation } from "react-i18next";
import { SelectField } from "@/components/common/SelectField";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PHONE_CODES } from "../../lib/rules";
import type { ContactSectionProps } from "./ContactSection.types";

/** Booking contact: name, email and phone with the +66 country code preselected (UI-PX-06). */
export function ContactSection({
  contact,
  errors,
  onChange,
  onBlur,
}: ContactSectionProps) {
  const { t } = useTranslation("passengerInfo");
  return (
    <Card role="group" aria-labelledby="contact-title">
      <div className="flex flex-col gap-3 px-4">
        <div className="flex flex-col gap-0.5">
          <h2
            id="contact-title"
            className="font-display text-[17px] font-semibold text-midnight"
          >
            {t("contact.title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("contact.hint")}</p>
        </div>
        <Input
          label={t("contact.name")}
          autoComplete="name"
          value={contact.name}
          error={errors["contact.name"]}
          onChange={(event) => onChange("name", event.target.value)}
          onBlur={() => onBlur("name")}
        />
        <Input
          type="email"
          label={t("contact.email")}
          autoComplete="email"
          value={contact.email}
          error={errors["contact.email"]}
          onChange={(event) => onChange("email", event.target.value)}
          onBlur={() => onBlur("email")}
        />
        <div className="grid grid-cols-[7rem_1fr] items-start gap-3">
          <SelectField
            label={t("contact.phoneCode")}
            options={[...PHONE_CODES]}
            value={contact.phoneCode}
            onValueChange={(code) => onChange("phoneCode", code)}
          />
          <Input
            type="tel"
            label={t("contact.phone")}
            autoComplete="tel-national"
            inputMode="tel"
            value={contact.phoneNumber}
            error={errors["contact.phoneNumber"]}
            onChange={(event) => onChange("phoneNumber", event.target.value)}
            onBlur={() => onBlur("phoneNumber")}
          />
        </div>
      </div>
    </Card>
  );
}
