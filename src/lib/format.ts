const WEEKDAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const MONTHS_TH = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^(\d{2}):(\d{2})/;

type DateInput = Date | string | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const dateOnly = DATE_ONLY.exec(value);
  // Date-only strings are calendar days: build them in local time so the day never shifts.
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `1190` → `฿1,190`. Null or non-finite input gives an empty string, never `NaN`. */
export function formatBaht(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount))
    return "";
  return `฿${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** `2026-10-14` → `พ. 14 ต.ค.` */
export function formatDateTh(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "";
  return `${WEEKDAYS_TH[date.getDay()]} ${date.getDate()} ${MONTHS_TH[date.getMonth()]}`;
}

/** A `Date` or datetime string → 24-hour `07:00`; an `HH:mm` string passes through. */
export function formatTime24(value: DateInput): string {
  if (typeof value === "string") {
    const time = TIME_ONLY.exec(value);
    if (time && value.length === 5) return `${time[1]}:${time[2]}`;
  }
  const date = toDate(value);
  if (!date) return "";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
