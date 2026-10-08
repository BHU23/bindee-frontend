import type { PriceLine } from "@/components/common/PriceSummary";

export interface ConfirmSectionProps {
  lines: PriceLine[];
  /** Formatted party total. */
  total: string;
  hasAcceptedTerms: boolean;
  hasTermsError: boolean;
  isSubmitting: boolean;
  /** The booking exists: the CTA is done and stays disabled. */
  isBooked: boolean;
  onTermsChange: (value: boolean) => void;
}
