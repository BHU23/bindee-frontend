export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  /** Plain strings use the same text as value and label. */
  options: Array<string | SelectFieldOption>;
  /** The chosen option value; "" matches an option whose value is "" (placeholder row). */
  value: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  autoComplete?: string;
  className?: string;
}
