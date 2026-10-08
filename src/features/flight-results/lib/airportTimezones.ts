/** IANA timezone of every airport in the mock-inventory seed. */
export const AIRPORT_TIMEZONES: Readonly<Record<string, string>> = {
  BKK: "Asia/Bangkok",
  DMK: "Asia/Bangkok",
  CNX: "Asia/Bangkok",
  HKT: "Asia/Bangkok",
  HDY: "Asia/Bangkok",
  SIN: "Asia/Singapore",
  NRT: "Asia/Tokyo",
};

const FALLBACK_TIMEZONE = "UTC";

export function timezoneOf(airportCode: string): string {
  return AIRPORT_TIMEZONES[airportCode] ?? FALLBACK_TIMEZONE;
}
