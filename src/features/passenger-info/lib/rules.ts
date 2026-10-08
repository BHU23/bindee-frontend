import type {
  ContactField,
  Gender,
  PassengerField,
  PassengerType,
  Title,
} from "../types/passengerInfo";

/** Same rules as the backend (specs/passenger-info.v2.md) so server errors rarely surprise the guest. */
const TITLES_BY_TYPE: Record<PassengerType, readonly Title[]> = {
  adult: ["Mr", "Mrs", "Ms", "Miss"],
  child: ["Mstr", "Miss"],
  infant: ["Mstr", "Miss"],
};

const MALE_TITLES: readonly string[] = ["Mr", "Mstr"];
const FEMALE_TITLES: readonly string[] = ["Mrs", "Ms", "Miss"];

const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const DEFAULT_PHONE_CODE = "+66";
export const PHONE_CODES = [
  "+66",
  "+65",
  "+81",
  "+82",
  "+86",
  "+60",
  "+44",
  "+1",
];

export const COUNTRY_CODES = ["TH", "SG", "JP", "CN", "KR", "MY", "US", "GB"];

export const ADULT_MIN_AGE = 12;
export const CHILD_MIN_AGE = 2;

export interface PassengerSlot {
  type: PassengerType;
  /** 1-based number within its type (adult 1, child 1, ...). */
  number: number;
}

export interface PassengerValidationContext {
  type: PassengerType;
  departDate: string;
  international: boolean;
}

export function titleOptions(type: PassengerType): readonly Title[] {
  return TITLES_BY_TYPE[type];
}

export function genderForTitle(title: string): Gender | null {
  if (MALE_TITLES.includes(title)) return "M";
  if (FEMALE_TITLES.includes(title)) return "F";
  return null;
}

/** Adults first, then children, then infants (the order the backend expects for `infantOfPaxIndex`). */
export function buildPassengerSlots(counts: {
  adults: number;
  children: number;
  infants: number;
}): PassengerSlot[] {
  const types: [PassengerType, number][] = [
    ["adult", counts.adults],
    ["child", counts.children],
    ["infant", counts.infants],
  ];
  return types.flatMap(([type, count]) =>
    Array.from({ length: count }, (_, index) => ({ type, number: index + 1 })),
  );
}

function parseDate(value: string): Date | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day] = [match[1], match[2], match[3]].map(Number);
  const date = new Date(year, month - 1, day);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isReal ? date : null;
}

function todayAsDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole years between a `YYYY-MM-DD` birth date and a `YYYY-MM-DD` reference day. */
export function ageOnDate(dob: string, onDate: string): number {
  const birth = parseDate(dob) as Date;
  const ref = parseDate(onDate) as Date;
  let age = ref.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    ref.getMonth() > birth.getMonth() ||
    (ref.getMonth() === birth.getMonth() && ref.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function ageMatchesType(age: number, type: PassengerType): boolean {
  if (type === "adult") return age >= ADULT_MIN_AGE;
  if (type === "child") return age >= CHILD_MIN_AGE && age < ADULT_MIN_AGE;
  return age < CHILD_MIN_AGE;
}

function validateName(value: string, isRequired: boolean): string | null {
  const text = value.trim();
  if (!text) return isRequired ? "required" : null;
  return NAME_PATTERN.test(text) ? null : "nameFormat";
}

function validateDob(
  value: string,
  context: PassengerValidationContext,
): string | null {
  if (!value) return "required";
  const dob = parseDate(value);
  if (!dob || dob > todayAsDate()) return "dobInvalid";
  const age = ageOnDate(value, context.departDate);
  return ageMatchesType(age, context.type) ? null : "ageMismatch";
}

/** Returns an `errors.*` key of the passengerInfo namespace, or `null` when the value is fine. */
export function validatePassengerField(
  field: PassengerField,
  value: string,
  context: PassengerValidationContext,
): string | null {
  switch (field) {
    case "firstName":
    case "lastName":
      return validateName(value, true);
    case "middleName":
      return validateName(value, false);
    case "title":
      if (!value) return "requiredSelect";
      return TITLES_BY_TYPE[context.type].includes(value as Title)
        ? null
        : "titleNotAllowed";
    case "dob":
      return validateDob(value, context);
    case "nationality":
      return value ? null : "requiredSelect";
    case "passportNo":
    case "passportExpiry":
      return context.international && !value.trim() ? "required" : null;
    case "passportCountry":
      return context.international && !value ? "requiredSelect" : null;
  }
}

/** `0812345678` with `+66` → `+66812345678`. */
export function joinPhone(code: string, number: string): string {
  const digits = number.replace(/[\s-]/g, "").replace(/^0+/, "");
  return `${code}${digits}`;
}

/** Splits a saved `+<code><digits>` phone for the form; unknown codes fall back to +66. */
export function splitPhone(phone: string): {
  phoneCode: string;
  phoneNumber: string;
} {
  const code = [...PHONE_CODES]
    .sort((a, b) => b.length - a.length)
    .find((candidate) => phone.startsWith(candidate));
  if (code) return { phoneCode: code, phoneNumber: phone.slice(code.length) };
  return {
    phoneCode: DEFAULT_PHONE_CODE,
    phoneNumber: phone.replace(/^\+/, ""),
  };
}

export function validateContactField(
  field: ContactField,
  value: string,
  phoneCode: string,
): string | null {
  switch (field) {
    case "name":
      return value.trim() ? null : "required";
    case "email":
      if (!value.trim()) return "required";
      return EMAIL_PATTERN.test(value.trim()) ? null : "email";
    case "phoneNumber": {
      if (!value.trim()) return "required";
      if (/[^\d\s-]/.test(value)) return "phone";
      return PHONE_PATTERN.test(joinPhone(phoneCode, value)) ? null : "phone";
    }
    case "phoneCode":
      return null;
  }
}
