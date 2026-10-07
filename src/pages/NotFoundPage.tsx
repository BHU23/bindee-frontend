import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { buttonVariants } from "@/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-[32px] leading-10 font-semibold break-words text-midnight">
        {t("notFound.title")}
      </h1>
      <p className="text-muted-foreground break-words">
        {t("notFound.description")}
      </p>
      <Link to="/" className={buttonVariants()}>
        {t("notFound.home")}
      </Link>
    </section>
  );
}
