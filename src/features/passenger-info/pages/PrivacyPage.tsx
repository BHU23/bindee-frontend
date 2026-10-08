import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { AppHeader } from "@/components/common/AppHeader";
import { PrivacyPolicy } from "../components/PrivacyPolicy";

/** Static demo privacy policy at `/privacy`. */
export function PrivacyPage() {
  const { t } = useTranslation("passengerInfo");
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
      <AppHeader title={t("privacy.title")} onBack={() => void navigate(-1)} />
      <PrivacyPolicy />
    </div>
  );
}
