import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/services/apiClient";
import { getPassengers, savePassengers } from "../api/passengerApi";
import {
  DEFAULT_PHONE_CODE,
  buildPassengerSlots,
  genderForTitle,
  joinPhone,
  splitPhone,
  validateContactField,
  validatePassengerField,
  type PassengerSlot,
} from "../lib/rules";
import type {
  ConsentDto,
  ContactField,
  ContactFormValues,
  FormErrors,
  Gender,
  PassengerDto,
  PassengerField,
  PassengerFlowState,
  PassengerFormValues,
  PassengersResponse,
  PassengerType,
  Title,
} from "../types/passengerInfo";

export interface UsePassengerFormReturn {
  slots: PassengerSlot[];
  passengers: PassengerFormValues[];
  /** Gender implied by each passenger's title; `null` until a title is chosen. */
  genders: (Gender | null)[];
  /** Per passenger: a passport number was saved earlier but must be typed again. */
  hasSavedPassport: boolean[];
  contact: ContactFormValues;
  consent: ConsentDto;
  /** Messages keyed like the server: `passengers.0.firstName`, `contact.email`, `consent.privacy`. */
  errors: FormErrors;
  /** `true` when the trip is international, so passport fields apply (UI-PX-04, partial). */
  isInternational: boolean;
  isRestoring: boolean;
  isSubmitting: boolean;
  isSaved: boolean;
  /** Form-level message after a failed save; `null` otherwise. */
  submitError: string | null;
  total: number;
  setPassengerField: (
    index: number,
    field: PassengerField,
    value: string,
  ) => void;
  blurPassengerField: (index: number, field: PassengerField) => void;
  setContactField: (field: ContactField, value: string) => void;
  blurContactField: (field: ContactField) => void;
  setPrivacy: (value: boolean) => void;
  setMarketing: (value: boolean) => void;
  submit: () => Promise<boolean>;
}

const EMPTY_PASSENGER: PassengerFormValues = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  nationality: "",
  passportNo: "",
  passportCountry: "",
  passportExpiry: "",
};

const EMPTY_CONTACT: ContactFormValues = {
  name: "",
  email: "",
  phoneCode: DEFAULT_PHONE_CODE,
  phoneNumber: "",
};

const PASSENGER_FIELDS = Object.keys(EMPTY_PASSENGER) as PassengerField[];
const CONTACT_FIELDS: ContactField[] = ["name", "email", "phoneNumber"];

function passengerKey(index: number, field: PassengerField): string {
  return `passengers.${index}.${field}`;
}

function withoutKey(errors: FormErrors, key: string): FormErrors {
  if (!(key in errors)) return errors;
  const { [key]: _removed, ...rest } = errors;
  return rest;
}

function fromSaved(
  saved: PassengersResponse,
  slots: PassengerSlot[],
): PassengerFormValues[] | null {
  const matches =
    saved.passengers.length === slots.length &&
    saved.passengers.every((p, i) => p.type === slots[i].type);
  if (!matches) return null;
  return saved.passengers.map((p) => ({
    ...EMPTY_PASSENGER,
    title: p.title,
    firstName: p.firstName,
    middleName: p.middleName ?? "",
    lastName: p.lastName,
    dob: p.dob,
    nationality: p.nationality,
    // The passport number is never returned: it is re-entered. Country and expiry come back.
    passportCountry: p.passportCountry ?? "",
    passportExpiry: p.passportExpiry ?? "",
  }));
}

/** Form state, blur validation, restore from the draft and save for the passenger-info screen. */
export function usePassengerForm(
  flow: PassengerFlowState,
): UsePassengerFormReturn {
  const { t } = useTranslation("passengerInfo");
  const { adults, children, infants, departDate } = flow.query;
  const slots = useMemo(
    () => buildPassengerSlots({ adults, children, infants }),
    [adults, children, infants],
  );
  const isInternational = flow.international === true;

  const [passengers, setPassengers] = useState<PassengerFormValues[]>(() =>
    slots.map(() => ({ ...EMPTY_PASSENGER })),
  );
  const [hasSavedPassport, setHasSavedPassport] = useState<boolean[]>(() =>
    slots.map(() => false),
  );
  const [contact, setContact] = useState<ContactFormValues>(EMPTY_CONTACT);
  const [consent, setConsent] = useState<ConsentDto>({
    privacy: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPassengers(flow.draftId, controller.signal).then(
      (saved) => {
        if (controller.signal.aborted) return;
        const restored = fromSaved(saved, slots);
        if (restored) {
          setPassengers(restored);
          setHasSavedPassport(saved.passengers.map((p) => p.hasPassport));
        }
        if (saved.contact) {
          setContact({
            name: saved.contact.name,
            email: saved.contact.email,
            ...splitPhone(saved.contact.phone),
          });
        }
        if (saved.consent) setConsent(saved.consent);
        setIsRestoring(false);
      },
      () => {
        // Nothing to restore (or it failed): an empty form is still usable.
        if (!controller.signal.aborted) setIsRestoring(false);
      },
    );
    return () => controller.abort();
  }, [flow.draftId, slots]);

  function passengerError(
    index: number,
    field: PassengerField,
    value: string,
  ): string | null {
    const type = slots[index].type;
    const key = validatePassengerField(field, value, {
      type,
      departDate,
      international: isInternational,
    });
    return key ? message(key, type) : null;
  }

  function message(key: string, type?: PassengerType): string {
    return t(`errors.${key}`, { hint: type ? t(`ageHint.${type}`) : "" });
  }

  function setError(key: string, error: string | null) {
    setErrors((current) =>
      error ? { ...current, [key]: error } : withoutKey(current, key),
    );
  }

  function setPassengerField(
    index: number,
    field: PassengerField,
    value: string,
  ) {
    setIsSaved(false);
    setPassengers((current) =>
      current.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
    // Once a field shows an error it is re-checked as the guest types, so the message clears when fixed.
    const key = passengerKey(index, field);
    if (key in errors) setError(key, passengerError(index, field, value));
  }

  function blurPassengerField(index: number, field: PassengerField) {
    setError(
      passengerKey(index, field),
      passengerError(index, field, passengers[index][field]),
    );
  }

  function contactError(field: ContactField, value: string, code: string) {
    const key = validateContactField(field, value, code);
    return key ? message(key) : null;
  }

  function setContactField(field: ContactField, value: string) {
    setIsSaved(false);
    setContact((current) => ({ ...current, [field]: value }));
    const key = `contact.${field}`;
    const code = field === "phoneCode" ? value : contact.phoneCode;
    if (field === "phoneCode") {
      if ("contact.phoneNumber" in errors) {
        setError(
          "contact.phoneNumber",
          contactError("phoneNumber", contact.phoneNumber, code),
        );
      }
      return;
    }
    if (key in errors) setError(key, contactError(field, value, code));
  }

  function blurContactField(field: ContactField) {
    setError(
      `contact.${field}`,
      contactError(field, contact[field], contact.phoneCode),
    );
  }

  function setPrivacy(value: boolean) {
    setIsSaved(false);
    setConsent((current) => ({ ...current, privacy: value }));
    if (value) setError("consent.privacy", null);
  }

  function setMarketing(value: boolean) {
    setIsSaved(false);
    setConsent((current) => ({ ...current, marketing: value }));
  }

  function validateAll(): FormErrors {
    const found: FormErrors = {};
    passengers.forEach((values, index) => {
      PASSENGER_FIELDS.forEach((field) => {
        const error = passengerError(index, field, values[field]);
        if (error) found[passengerKey(index, field)] = error;
      });
    });
    CONTACT_FIELDS.forEach((field) => {
      const error = contactError(field, contact[field], contact.phoneCode);
      if (error) found[`contact.${field}`] = error;
    });
    if (!consent.privacy) found["consent.privacy"] = message("privacy");
    return found;
  }

  function toDto(values: PassengerFormValues, index: number): PassengerDto {
    const type = slots[index].type;
    const middleName = values.middleName.trim();
    const adultIndexes = slots.flatMap((s, i) =>
      s.type === "adult" ? [i] : [],
    );
    const infantNumber = slots[index].number - 1;
    return {
      type,
      title: values.title as Title,
      firstName: values.firstName.trim(),
      ...(middleName && { middleName }),
      lastName: values.lastName.trim(),
      dob: values.dob,
      gender: genderForTitle(values.title) as Gender,
      nationality: values.nationality,
      ...(isInternational && {
        passportNo: values.passportNo.trim(),
        passportCountry: values.passportCountry,
        passportExpiry: values.passportExpiry,
      }),
      // Each infant travels with the adult of the same number (searches never have more infants than adults).
      ...(type === "infant" && {
        infantOfPaxIndex: adultIndexes[infantNumber],
      }),
    };
  }

  function applyServerError(error: unknown) {
    if (!(error instanceof ApiError)) {
      setSubmitError(t("submitError.network"));
      return;
    }
    if (error.status === 410) {
      setSubmitError(t("submitError.expired"));
      return;
    }
    const fields = error.status === 400 ? error.fields : undefined;
    if (!fields || Object.keys(fields).length === 0) {
      setSubmitError(
        t(error.status === 400 ? "submitError.invalid" : "submitError.network"),
      );
      return;
    }
    const serverErrors: FormErrors = {};
    for (const key of Object.keys(fields)) {
      serverErrors[key] = message(serverErrorKey(error.code), typeOfField(key));
    }
    setErrors((current) => ({ ...current, ...serverErrors }));
    setSubmitError(t("submitError.invalid"));
  }

  function typeOfField(key: string): PassengerType | undefined {
    const match = /^passengers\.(\d+)\./.exec(key);
    return match ? slots[Number(match[1])]?.type : undefined;
  }

  async function submit(): Promise<boolean> {
    const found = validateAll();
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length > 0) return false;
    setIsSubmitting(true);
    try {
      await savePassengers(flow.draftId, {
        passengers: passengers.map(toDto),
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: joinPhone(contact.phoneCode, contact.phoneNumber),
        },
        consent,
      });
      setIsSaved(true);
      return true;
    } catch (error) {
      applyServerError(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    slots,
    passengers,
    genders: passengers.map((p) => genderForTitle(p.title)),
    hasSavedPassport,
    contact,
    consent,
    errors,
    isInternational,
    isRestoring,
    isSubmitting,
    isSaved,
    submitError,
    total: flow.outbound.total + (flow.inbound?.total ?? 0),
    setPassengerField,
    blurPassengerField,
    setContactField,
    blurContactField,
    setPrivacy,
    setMarketing,
    submit,
  };
}

function serverErrorKey(code: string): string {
  switch (code) {
    case "PAX_TYPE_AGE_MISMATCH":
      return "ageMismatch";
    case "TITLE_NOT_ALLOWED_FOR_TYPE":
      return "titleNotAllowed";
    case "TITLE_GENDER_MISMATCH":
      return "titleGenderMismatch";
    default:
      return "invalid";
  }
}
