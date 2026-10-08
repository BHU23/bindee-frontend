import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { PASSENGERS_PATH, RETURN_FLIGHTS_PATH } from "@/lib/routes";
import { acceptPrice, createDraft } from "../api/bookingApi";
import type {
  FareFlowState,
  FlightCardDto,
  LegSelection,
  PriceChangedError,
  SearchQueryDto,
} from "../types/booking";

export interface UseOutboundFlowOptions {
  searchId: string;
  /** The query of the loaded results; decides where the flow goes after the outbound fare. */
  query: SearchQueryDto | undefined;
}

export interface UseOutboundFlowReturn {
  /** `null` until the draft exists (created lazily on the first tap). */
  draftId: string | null;
  flight: FlightCardDto | null;
  isSheetOpen: boolean;
  priceChange: PriceChangedError | null;
  /** True while a price acceptance is in flight. */
  isAccepting: boolean;
  /** True when creating the draft or accepting the new price failed. */
  hasError: boolean;
  selectFlight: (flight: FlightCardDto) => Promise<void>;
  setSheetOpen: (open: boolean) => void;
  handleSelected: (selection: LegSelection) => void;
  handlePriceChanged: (change: PriceChangedError) => void;
  acceptNewPrice: () => Promise<void>;
  backToFlights: () => void;
}

/** Outbound half of fare selection: draft, fare sheet, price change and the hand-off to the next screen. */
export function useOutboundFlow({
  searchId,
  query,
}: UseOutboundFlowOptions): UseOutboundFlowReturn {
  const navigate = useNavigate();
  const [draftId, setDraftId] = useState<string | null>(null);
  const draftRequest = useRef<Promise<string> | null>(null);
  const [flight, setFlight] = useState<FlightCardDto | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [priceChange, setPriceChange] = useState<PriceChangedError | null>(
    null,
  );
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasError, setHasError] = useState(false);

  function ensureDraft(): Promise<string> {
    if (draftRequest.current === null) {
      draftRequest.current = createDraft(searchId).then((response) => {
        setDraftId(response.draftId);
        return response.draftId;
      });
      draftRequest.current.catch(() => {
        draftRequest.current = null;
      });
    }
    return draftRequest.current;
  }

  async function selectFlight(next: FlightCardDto) {
    setHasError(false);
    try {
      await ensureDraft();
    } catch {
      setHasError(true);
      return;
    }
    setFlight(next);
    setSheetOpen(true);
  }

  function handleSelected(selection: LegSelection) {
    if (draftId === null || query === undefined) return;
    const state: FareFlowState = {
      searchId,
      draftId,
      query,
      outbound: selection,
    };
    const path =
      query.tripType === "ROUND_TRIP" ? RETURN_FLIGHTS_PATH : PASSENGERS_PATH;
    setSheetOpen(false);
    void navigate(path, { state });
  }

  function handlePriceChanged(change: PriceChangedError) {
    setPriceChange(change);
  }

  async function acceptNewPrice() {
    if (draftId === null || flight === null || priceChange === null) return;
    setIsAccepting(true);
    setHasError(false);
    try {
      const result = await acceptPrice(
        draftId,
        "outbound",
        priceChange.newPrice,
      );
      setPriceChange(null);
      handleSelected({
        flight,
        fareFamily: result.selection.fareFamily,
        total: result.price.total,
      });
    } catch {
      setHasError(true);
    } finally {
      setIsAccepting(false);
    }
  }

  function backToFlights() {
    setPriceChange(null);
    setHasError(false);
    setSheetOpen(false);
  }

  return {
    draftId,
    flight,
    isSheetOpen,
    priceChange,
    isAccepting,
    hasError,
    selectFlight,
    setSheetOpen,
    handleSelected,
    handlePriceChanged,
    acceptNewPrice,
    backToFlights,
  };
}
