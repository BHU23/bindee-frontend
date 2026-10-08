import type { ConsentDto } from "../../types/passengerInfo";

export interface ConsentSectionProps {
  consent: ConsentDto;
  /** Message under the privacy checkbox; flags it invalid when set. */
  privacyError?: string;
  onPrivacyChange: (value: boolean) => void;
  onMarketingChange: (value: boolean) => void;
}
