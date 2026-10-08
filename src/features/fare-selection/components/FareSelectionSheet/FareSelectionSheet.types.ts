import type {
  BookingLeg,
  FlightCardDto,
  LegSelection,
  PriceChangedError,
} from "../../types/booking";

export interface FareSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: FlightCardDto | null;
  draftId: string;
  leg: BookingLeg;
  onSelected: (selection: LegSelection) => void;
  onPriceChanged: (change: PriceChangedError) => void;
}
