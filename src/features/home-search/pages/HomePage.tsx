import { useTranslation } from "react-i18next";

/** Thin route-level screen; the sections are composed here as they are built. */
export function HomePage() {
  const { t } = useTranslation("homeSearch");
  return (
    <section>
      <h1 className="font-display text-[36px] leading-10 font-semibold break-words text-midnight md:text-[56px] md:leading-[60px]">
        {t("title")}
      </h1>
    </section>
  );
}
