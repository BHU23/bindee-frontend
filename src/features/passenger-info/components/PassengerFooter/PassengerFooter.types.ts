export interface PassengerFooterProps {
  /** Whole-party total in THB. */
  total: number;
  outboundTotal: number;
  /** Present for round trips. */
  inboundTotal?: number;
  isSubmitting: boolean;
}
