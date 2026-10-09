import type {
  SearchFieldError,
  SearchFieldName,
  SearchFormErrors,
  SearchFormValues,
  SearchQueryDto,
} from "../types/homeSearch";

export const MAX_SEATED_PAX = 9;

export interface PaxLimits {
  /** Adults can go down only while infants still have an adult each. */
  minAdults: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
}

export function getPaxLimits(values: SearchFormValues): PaxLimits {
  return {
    minAdults: Math.max(1, values.infants),
    maxAdults: MAX_SEATED_PAX - values.children,
    maxChildren: MAX_SEATED_PAX - values.adults,
    maxInfants: values.adults,
  };
}

export function validateSearchForm(
  values: SearchFormValues,
  today: string,
): SearchFormErrors {
  const errors: SearchFormErrors = {};
  if (!values.origin) errors.origin = "required";
  if (!values.destination) errors.destination = "required";
  else if (values.destination === values.origin) {
    errors.destination = "sameAirport";
  }
  if (!values.departDate) errors.departDate = "required";
  else if (values.departDate < today) errors.departDate = "pastDate";
  if (values.tripType === "ROUND_TRIP") {
    if (!values.returnDate) errors.returnDate = "required";
    else if (values.departDate && values.returnDate < values.departDate) {
      errors.returnDate = "returnBeforeDepart";
    }
  }
  return errors;
}

const FIELD_NAMES: readonly SearchFieldName[] = [
  "origin",
  "destination",
  "departDate",
  "returnDate",
  "adults",
  "children",
  "infants",
];

/** Maps server `fields` onto form fields; unknown keys are ignored. */
export function serverFieldErrors(
  fields: Record<string, string> | undefined,
): SearchFormErrors {
  const errors: SearchFormErrors = {};
  for (const name of FIELD_NAMES) {
    const error: SearchFieldError = "invalid";
    if (fields?.[name] !== undefined) errors[name] = error;
  }
  return errors;
}

export function toSearchQuery(values: SearchFormValues): SearchQueryDto {
  return {
    tripType: values.tripType,
    origin: values.origin,
    destination: values.destination,
    departDate: values.departDate,
    ...(values.tripType === "ROUND_TRIP"
      ? { returnDate: values.returnDate }
      : {}),
    adults: values.adults,
    children: values.children,
    infants: values.infants,
    cabin: values.cabin,
  };
}

export function toFormValues(query: SearchQueryDto): SearchFormValues {
  return { ...query, returnDate: query.returnDate ?? "" };
}
