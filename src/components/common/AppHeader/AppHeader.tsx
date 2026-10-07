import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Icon } from "../Icon";
import type { AppHeaderProps } from "./AppHeader.types";

/** Floating glass nav pill: wordmark on home, back button + title on inner screens. */
export function AppHeader({ title, onBack, right }: AppHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 rounded-full border border-white/70 bg-glass px-4 shadow-card backdrop-blur-lg">
      <div className="flex min-w-0 items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("back")}
            onClick={onBack}
          >
            <Icon name="chevron" className="rotate-180" />
          </Button>
        )}
        {title ? (
          <h1 className="font-display text-[17px] font-semibold break-words text-midnight">
            {title}
          </h1>
        ) : (
          <span className="flex items-center gap-2">
            <img src="/brand/bindee-logo.png" alt="" className="size-9" />
            <img
              src="/brand/bindee-wordmark.svg"
              alt="Bin Dee"
              className="h-6"
            />
          </span>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
