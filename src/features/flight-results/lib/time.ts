import { timezoneOf } from "./airportTimezones";

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** UTC ISO instant → 24-hour `HH:mm` in the airport's timezone (never the browser's). */
export function formatAirportTime(iso: string, airportCode: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatterFor(timezoneOf(airportCode)).format(date);
}

/** Minutes → whole hours and remaining minutes. */
export function splitDuration(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  const safe = Math.max(0, Math.round(totalMinutes));
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}
