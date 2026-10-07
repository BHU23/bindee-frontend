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

/** Seeded airports inside Thailand; every other airport is international. */
export const DOMESTIC_AIRPORTS: ReadonlySet<string> = new Set([
  "BKK",
  "DMK",
  "CNX",
  "HKT",
  "HDY",
]);
