import { useState } from "react";
import { useNavigate } from "react-router";
import { PASSENGERS_PATH } from "@/lib/routes";
import { acceptPrice } from "../api/bookingApi";
import type {
  FareFlowState,
  FlightCardDto,
  LegSelection,
  PriceChangedError,
} from "../types/booking";
import type { RoundTripFlowState } from "../types/returnFlow";

export interface UseReturnLegReturn {
  selectedFlight: FlightCardDto | null;
  /** Return selection made in this visit; empty until a fare is chosen. */
  returnSelection: LegSelection | null;
  priceChange: PriceChangedError | null;
  isAccepting: boolean;
  acceptFailed: boolean;
  openFlight: (flight: FlightCardDto) => void;
  closeSheet: () => void;
  handleSelected: (selection: LegSelection) => void;
  handlePriceChanged: (change: PriceChangedError) => void;
  acceptNewPrice: () => Promise<void>;
  backToFlights: () => void;
}

/** Return-leg selection state. The page remounts it per outbound, so nothing stale survives UI-FS-09. */
export function useReturnLeg(flow: FareFlowState): UseReturnLegReturn {
  const navigate = useNavigate();
  const [selectedFlight, setSelectedFlight] = useState<FlightCardDto | null>(
    null,
  );
  const [returnSelection, setReturnSelection] = useState<LegSelection | null>(
    null,
  );
  const [priceChange, setPriceChange] = useState<PriceChangedError | null>(
    null,
  );
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptFailed, setAcceptFailed] = useState(false);

  function complete(selection: LegSelection) {
    const state: RoundTripFlowState = { ...flow, inbound: selection };
    setReturnSelection(selection);
    void navigate(PASSENGERS_PATH, { state });
  }

  function closeSheet() {
    setSelectedFlight(null);
  }

  function handleSelected(selection: LegSelection) {
    closeSheet();
    complete(selection);
  }

  function handlePriceChanged(change: PriceChangedError) {
    setAcceptFailed(false);
    setPriceChange(change);
  }

  async function acceptNewPrice() {
    if (!priceChange || !selectedFlight) return;
    setIsAccepting(true);
    setAcceptFailed(false);
    try {
      const result = await acceptPrice(
        flow.draftId,
        "return",
        priceChange.newPrice,
      );
      setPriceChange(null);
      closeSheet();
      complete({
        flight: selectedFlight,
        fareFamily: result.selection.fareFamily,
        total: result.price.total,
      });
    } catch {
      setAcceptFailed(true);
    } finally {
      setIsAccepting(false);
    }
  }

  function backToFlights() {
    setPriceChange(null);
    setAcceptFailed(false);
    closeSheet();
  }

  return {
    selectedFlight,
    returnSelection,
    priceChange,
    isAccepting,
    acceptFailed,
    openFlight: setSelectedFlight,
    closeSheet,
    handleSelected,
    handlePriceChanged,
    acceptNewPrice,
    backToFlights,
  };
}
