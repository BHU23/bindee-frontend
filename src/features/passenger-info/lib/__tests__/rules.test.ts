import { describe, expect, it } from "vitest";
import {
  ageOnDate,
  buildPassengerSlots,
  genderForTitle,
  joinPhone,
  splitPhone,
  titleOptions,
  validateContactField,
  validatePassengerField,
} from "../rules";

const ctx = {
  type: "adult" as const,
  departDate: "2026-10-14",
  international: false,
};

describe("titleOptions", () => {
  it("UI-PX-09: When the type is adult, should list Mr, Mrs, Ms, Miss", () => {
    expect(titleOptions("adult")).toEqual(["Mr", "Mrs", "Ms", "Miss"]);
  });

  it("UI-PX-09: When the type is child or infant, should list Mstr and Miss", () => {
    expect(titleOptions("child")).toEqual(["Mstr", "Miss"]);
    expect(titleOptions("infant")).toEqual(["Mstr", "Miss"]);
  });
});

describe("genderForTitle", () => {
  it("UI-PX-09: When the title is Mr or Mstr, should give M", () => {
    expect(genderForTitle("Mr")).toBe("M");
    expect(genderForTitle("Mstr")).toBe("M");
  });

  it("UI-PX-09: When the title is Mrs, Ms or Miss, should give F", () => {
    expect(genderForTitle("Mrs")).toBe("F");
    expect(genderForTitle("Ms")).toBe("F");
    expect(genderForTitle("Miss")).toBe("F");
  });

  it("When the title is empty or unknown, should give null", () => {
    expect(genderForTitle("")).toBeNull();
    expect(genderForTitle("Dr")).toBeNull();
  });
});

describe("buildPassengerSlots", () => {
  it("UI-PX-01: When 2 adults, 1 child and 1 infant, should list adults, child, infant with per-type numbers", () => {
    expect(buildPassengerSlots({ adults: 2, children: 1, infants: 1 })).toEqual(
      [
        { type: "adult", number: 1 },
        { type: "adult", number: 2 },
        { type: "child", number: 1 },
        { type: "infant", number: 1 },
      ],
    );
  });
});

describe("ageOnDate", () => {
  it("When the birthday has not come yet, should subtract a year", () => {
    expect(ageOnDate("2000-10-15", "2026-10-14")).toBe(25);
    expect(ageOnDate("2000-10-14", "2026-10-14")).toBe(26);
  });
});

describe("validatePassengerField", () => {
  it("UI-PX-03: When a name has non A-Z characters, should return nameFormat", () => {
    expect(validatePassengerField("firstName", "สมชาย", ctx)).toBe(
      "nameFormat",
    );
    expect(validatePassengerField("lastName", "Jai1", ctx)).toBe("nameFormat");
  });

  it("When a name is A-Z (with inner single spaces), should pass", () => {
    expect(validatePassengerField("firstName", "Mary Ann", ctx)).toBeNull();
  });

  it("When a required name is empty or whitespace, should return required", () => {
    expect(validatePassengerField("firstName", "   ", ctx)).toBe("required");
  });

  it("When the middle name is empty, should pass; when it has Thai, should fail", () => {
    expect(validatePassengerField("middleName", "", ctx)).toBeNull();
    expect(validatePassengerField("middleName", "ก", ctx)).toBe("nameFormat");
  });

  it("UI-PX-09: When the title is not allowed for the type, should return titleNotAllowed", () => {
    expect(validatePassengerField("title", "Mstr", ctx)).toBe(
      "titleNotAllowed",
    );
    expect(validatePassengerField("title", "", ctx)).toBe("requiredSelect");
    expect(validatePassengerField("title", "Mr", ctx)).toBeNull();
  });

  it("When the date of birth is empty, invalid or in the future, should fail", () => {
    expect(validatePassengerField("dob", "", ctx)).toBe("required");
    expect(validatePassengerField("dob", "2026-02-31", ctx)).toBe("dobInvalid");
    expect(validatePassengerField("dob", "2999-01-01", ctx)).toBe("dobInvalid");
  });

  it("When the age on the travel date does not match the type, should return ageMismatch", () => {
    expect(validatePassengerField("dob", "2020-01-01", ctx)).toBe(
      "ageMismatch",
    );
    expect(
      validatePassengerField("dob", "1990-01-01", { ...ctx, type: "child" }),
    ).toBe("ageMismatch");
    expect(
      validatePassengerField("dob", "2026-01-01", { ...ctx, type: "child" }),
    ).toBe("ageMismatch");
    expect(
      validatePassengerField("dob", "2026-01-01", { ...ctx, type: "infant" }),
    ).toBeNull();
    expect(
      validatePassengerField("dob", "2020-01-01", { ...ctx, type: "child" }),
    ).toBeNull();
    expect(validatePassengerField("dob", "1990-01-01", ctx)).toBeNull();
  });

  it("When nationality is empty, should return requiredSelect", () => {
    expect(validatePassengerField("nationality", "", ctx)).toBe(
      "requiredSelect",
    );
    expect(validatePassengerField("nationality", "TH", ctx)).toBeNull();
  });

  it("UI-PX-04: When the trip is domestic, should not require passport fields", () => {
    expect(validatePassengerField("passportNo", "", ctx)).toBeNull();
    expect(validatePassengerField("passportCountry", "", ctx)).toBeNull();
    expect(validatePassengerField("passportExpiry", "", ctx)).toBeNull();
  });

  it("UI-PX-04: When the trip is international, should require passport fields", () => {
    const intl = { ...ctx, international: true };
    expect(validatePassengerField("passportNo", "", intl)).toBe("required");
    expect(validatePassengerField("passportCountry", "", intl)).toBe(
      "requiredSelect",
    );
    expect(validatePassengerField("passportExpiry", "", intl)).toBe("required");
    expect(validatePassengerField("passportNo", "AA123456", intl)).toBeNull();
    expect(
      validatePassengerField("passportExpiry", "2031-01-01", intl),
    ).toBeNull();
  });
});

describe("validateContactField", () => {
  it("When the name is empty, should return required", () => {
    expect(validateContactField("name", "", "+66")).toBe("required");
  });

  it("UI-PX-06: When the email format is wrong, should return email", () => {
    expect(validateContactField("email", "abc", "+66")).toBe("email");
    expect(validateContactField("email", "a@b", "+66")).toBe("email");
    expect(validateContactField("email", "a@b.co", "+66")).toBeNull();
    expect(validateContactField("email", "", "+66")).toBe("required");
  });

  it("UI-PX-06: When the phone is not +country digits, should return phone", () => {
    expect(validateContactField("phoneNumber", "12", "+66")).toBe("phone");
    expect(validateContactField("phoneNumber", "08x", "+66")).toBe("phone");
    expect(validateContactField("phoneNumber", "0812345678", "+66")).toBeNull();
    expect(validateContactField("phoneNumber", "", "+66")).toBe("required");
  });

  it("When validating the code field, should pass", () => {
    expect(validateContactField("phoneCode", "+66", "+66")).toBeNull();
  });
});

describe("joinPhone / splitPhone", () => {
  it("UI-PX-06: When joining, should drop the leading 0 and spaces and prefix the code", () => {
    expect(joinPhone("+66", "081 234 5678")).toBe("+66812345678");
  });

  it("When splitting a saved phone, should find the known country code", () => {
    expect(splitPhone("+66812345678")).toEqual({
      phoneCode: "+66",
      phoneNumber: "812345678",
    });
    expect(splitPhone("+6591234567")).toEqual({
      phoneCode: "+65",
      phoneNumber: "91234567",
    });
  });

  it("When the code is unknown or the phone is empty, should fall back to +66", () => {
    expect(splitPhone("+9912345678")).toEqual({
      phoneCode: "+66",
      phoneNumber: "9912345678",
    });
    expect(splitPhone("")).toEqual({ phoneCode: "+66", phoneNumber: "" });
  });
});
