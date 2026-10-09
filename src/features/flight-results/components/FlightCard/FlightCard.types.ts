import type { FlightCardDto } from "../../types/flightResults";

export interface FlightCardProps {
  flight: FlightCardDto;
  /** When given, the card shows a select button that calls it with the flight. */
  onSelect?: (flight: FlightCardDto) => void;
}
