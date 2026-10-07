export interface CounterProps {
  label: string;
  description?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}
