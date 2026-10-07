import { useTranslation } from "react-i18next";
import { Icon } from "@/components/common/Icon";
import type { IconName } from "@/components/common/Icon";
import type { HomeFooterProps } from "./HomeFooter.types";

const BUDDHIST_ERA_OFFSET = 543;

const HIGHLIGHTS: { icon: IconName; title: string; body: string }[] = [
  { icon: "check", title: "taxIncludedTitle", body: "taxIncludedBody" },
  { icon: "clock", title: "holdTitle", body: "holdBody" },
  { icon: "user", title: "guestTitle", body: "guestBody" },
];

export function HomeFooter({
  year = new Date().getFullYear(),
}: HomeFooterProps) {
  const { t } = useTranslation("homeSearch");
  return (
    <footer id="support" className="flex flex-col gap-8">
      <ul className="grid gap-4 md:grid-cols-3">
        {HIGHLIGHTS.map(({ icon, title, body }) => (
          <li
            key={title}
            className="flex gap-4 rounded-lg border border-white/70 bg-glass p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-midnight text-primary-foreground">
              <Icon name={icon} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold break-words text-midnight">
                {t(`footer.${title}`)}
              </h2>
              <p className="text-slate">{t(`footer.${body}`)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm text-slate md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-2 break-words">
          <img src="/brand/bindee-logo.png" alt="" className="size-6" />
          {t("footer.copyright", { year: year + BUDDHIST_ERA_OFFSET })}
        </p>
        <p>{t("footer.support")}</p>
      </div>
    </footer>
  );
}
