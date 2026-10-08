import type { FlightCardDto } from "../../types/flightResults";

export interface FlightCardProps {
  flight: FlightCardDto;
  /** When set, the whole card is a button that reports the flight. */
  onSelect?: (flight: FlightCardDto) => void;
}
