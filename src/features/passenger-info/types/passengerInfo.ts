export type PassengerType = "adult" | "child" | "infant";
export type Title = "Mr" | "Mrs" | "Ms" | "Miss" | "Mstr";
export type Gender = "M" | "F";

/** One passenger as sent by `PUT /booking-drafts/:draftId/passengers`. */
export interface PassengerDto {
  type: PassengerType;
  title: Title;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: Gender;
  nationality: string;
  passportNo?: string;
  passportCountry?: string;
  passportExpiry?: string;
  infantOfPaxIndex?: number;
}

/** One passenger as returned by GET: the passport number is never returned. */
export type SavedPassengerDto = Omit<PassengerDto, "passportNo"> & {
  hasPassport: boolean;
};

export interface ContactDto {
  name: string;
  email: string;
  /** `+<country code><digits>`. */
  phone: string;
}

export interface ConsentDto {
  privacy: boolean;
  marketing: boolean;
}

export interface SavePassengersBody {
  passengers: PassengerDto[];
  contact: ContactDto;
  consent: ConsentDto;
}

export interface PassengersResponse {
  passengers: SavedPassengerDto[];
  contact?: ContactDto;
  consent?: ConsentDto;
}

/**
 * Router state from fare-selection (a minimal local view of it: features never import each other).
 * `international` is optional because fare-selection does not send it yet (UI-PX-04 is partial).
 */
export interface PassengerFlowState {
  searchId: string;
  draftId: string;
  query: {
    adults: number;
    children: number;
    infants: number;
    departDate: string;
  };
  outbound: { total: number };
  inbound?: { total: number };
  international?: boolean;
}

/** Editable text of one passenger card. */
export interface PassengerFormValues {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passportNo: string;
  passportCountry: string;
  passportExpiry: string;
}

export type PassengerField = keyof PassengerFormValues;

export interface ContactFormValues {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
}

export type ContactField = keyof ContactFormValues;

/** Field errors keyed like the server: `passengers.0.firstName`, `contact.email`, `consent.privacy`. */
export type FormErrors = Record<string, string>;
