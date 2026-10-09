import type { FareDetailDto } from "../../types/booking";

export interface FareCardProps {
  fare: FareDetailDto;
  /** Name of the radio group the card belongs to. */
  name: string;
  selected: boolean;
  onSelect: () => void;
}
