/** Airports of the mock-inventory seed; the picker offers exactly these. */
export const AIRPORT_CODES = [
  "BKK",
  "DMK",
  "CNX",
  "HKT",
  "HDY",
  "SIN",
  "NRT",
] as const;

export type AirportCode = (typeof AIRPORT_CODES)[number];
