import type { PriceChangedError } from "../../types/booking";

export interface PriceChangedDialogProps {
  open: boolean;
  change: PriceChangedError;
  busy?: boolean;
  onAccept(): void;
  onBack(): void;
}
