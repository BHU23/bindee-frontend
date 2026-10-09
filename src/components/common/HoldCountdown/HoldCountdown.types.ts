export interface HoldCountdownProps {
  pnr: string;
  /** Server hold expiry as a UTC ISO string. */
  holdExpiresAt: string;
}
