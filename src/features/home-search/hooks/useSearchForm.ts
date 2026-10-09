import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/services/apiClient";
import { createSearch } from "../api/searchApi";
import type {
  SearchFieldName,
  SearchFormErrors,
  SearchFormValues,
  SearchQueryDto,
  SearchSubmitError,
} from "../types/homeSearch";
import {
  getPaxLimits,
  serverFieldErrors,
  toFormValues,
  toSearchQuery,
  validateSearchForm,
  type PaxLimits,
} from "./searchFormRules";

export interface UseSearchFormOptions {
  /** Bangkok calendar day, YYYY-MM-DD; injected so tests and clocks stay deterministic. */
  today: string;
  onSearched: (result: { searchId: string; query: SearchQueryDto }) => void;
}

export interface UseSearchFormReturn {
  values: SearchFormValues;
  errors: SearchFormErrors;
  submitError: SearchSubmitError | null;
  isSubmitting: boolean;
  paxLimits: PaxLimits;
  setField: <K extends keyof SearchFormValues>(
    name: K,
    value: SearchFormValues[K],
  ) => void;
  swapAirports: () => void;
  submit: () => Promise<void>;
  /** Fills the form from a recent search and runs it again. */
  searchAgain: (query: SearchQueryDto) => Promise<void>;
}

const EMPTY_VALUES: SearchFormValues = {
  tripType: "ONE_WAY",
  origin: "BKK",
  destination: "",
  departDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "ECONOMY",
};

function toSubmitError(error: unknown): SearchSubmitError {
  if (error instanceof ApiError) {
    if (error.status === 503) return "inventoryUnavailable";
    if (error.status === 0) return "network";
  }
  return "unknown";
}

export function useSearchForm(
  options: UseSearchFormOptions,
): UseSearchFormReturn {
  const { today, onSearched } = options;
  const [values, setValues] = useState<SearchFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<SearchFormErrors>({});
  const [submitError, setSubmitError] = useState<SearchSubmitError | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A ref guards double clicks before the state update re-renders the button.
  const inFlight = useRef(false);

  const setField = useCallback<UseSearchFormReturn["setField"]>(
    (name, value) => {
      setValues((current) => ({ ...current, [name]: value }));
      setErrors((current) => {
        if (!(name in current)) return current;
        const next = { ...current };
        delete next[name as SearchFieldName];
        return next;
      });
    },
    [],
  );

  const swapAirports = useCallback(() => {
    setValues((current) => ({
      ...current,
      origin: current.destination,
      destination: current.origin,
    }));
    setErrors((current) => ({ ...current, destination: undefined }));
  }, []);

  const run = useCallback(
    async (target: SearchFormValues) => {
      if (inFlight.current) return;
      const found = validateSearchForm(target, today);
      setErrors(found);
      setSubmitError(null);
      if (Object.keys(found).length > 0) return;

      inFlight.current = true;
      setIsSubmitting(true);
      const query = toSearchQuery(target);
      try {
        const { searchId } = await createSearch(query);
        onSearched({ searchId, query });
      } catch (error) {
        if (error instanceof ApiError && error.status === 400) {
          setErrors(serverFieldErrors(error.fields));
        }
        setSubmitError(toSubmitError(error));
      } finally {
        inFlight.current = false;
        setIsSubmitting(false);
      }
    },
    [today, onSearched],
  );

  const submit = useCallback(() => run(values), [run, values]);

  const searchAgain = useCallback(
    (query: SearchQueryDto) => {
      const next = toFormValues(query);
      setValues(next);
      return run(next);
    },
    [run],
  );

  return {
    values,
    errors,
    submitError,
    isSubmitting,
    paxLimits: getPaxLimits(values),
    setField,
    swapAirports,
    submit,
    searchAgain,
  };
}
