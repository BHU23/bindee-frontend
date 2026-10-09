import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/common/AppHeader";
import { useGoBack } from "@/hooks/useGoBack";
import { PrivacyPolicy } from "../components/PrivacyPolicy";

/** Static demo privacy policy at `/privacy`. */
export function PrivacyPage() {
  const { t } = useTranslation("passengerInfo");
  const goBack = useGoBack("/");
  return (
    <div className="flex flex-col gap-6">
      <AppHeader title={t("privacy.title")} onBack={goBack} />
      <PrivacyPolicy />
    </div>
  );
}
