import { useTranslation } from "react-i18next";
import { Icon } from "../Icon";
import type { TestModeBannerProps } from "./TestModeBanner.types";

/** Mandatory on every payment screen: payment is a simulation, no real money moves. */
export function TestModeBanner({ children }: TestModeBannerProps) {
  const { t } = useTranslation();
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-sm border border-dashed border-sunset-deep bg-sunset-tint px-4 py-3 text-sm break-words text-sunset-deep"
    >
      <Icon name="flask" />
      <p>{children ?? t("testMode.default")}</p>
    </div>
  );
}
