const BANGKOK_OFFSET_MS = 7 * 3_600_000;

/** Bangkok calendar day (YYYY-MM-DD) of an instant; defaults to now. */
export function bangkokDay(instant: Date | string = new Date()): string {
  const time = new Date(instant).getTime();
  return new Date(time + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}
