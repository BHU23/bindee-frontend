export interface AirportOption {
  code: string;
  label: string;
}

export interface AirportComboboxProps {
  label: string;
  placeholder: string;
  options: AirportOption[];
  /** Selected airport code, or "" when nothing is chosen. */
  value: string;
  error?: string;
  onChange: (code: string) => void;
}
