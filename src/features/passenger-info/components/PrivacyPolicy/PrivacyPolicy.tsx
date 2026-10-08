import { useTranslation } from "react-i18next";

const SECTION_KEYS = [
  "collected",
  "purpose",
  "retention",
  "rights",
  "contact",
] as const;

/** Static demo policy; rendered on `/privacy` and inside the consent Sheet. */
export function PrivacyPolicy() {
  const { t } = useTranslation("passengerInfo");
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("privacy.demoNote")}</p>
      {SECTION_KEYS.map((key) => (
        <section key={key} className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold text-midnight">
            {t(`privacy.sections.${key}.title`)}
          </h3>
          <p className="text-[15px] break-words">
            {t(`privacy.sections.${key}.body`)}
          </p>
        </section>
      ))}
    </div>
  );
}
