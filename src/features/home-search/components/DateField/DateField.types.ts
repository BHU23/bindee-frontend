export interface DateFieldProps {
  label: string;
  placeholder: string;
  /** YYYY-MM-DD, or "" when no day is chosen. */
  value: string;
  /** Earliest pickable day, YYYY-MM-DD. */
  min: string;
  error?: string;
  onChange: (day: string) => void;
}
