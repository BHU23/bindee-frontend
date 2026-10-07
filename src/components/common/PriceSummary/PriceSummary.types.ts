export interface PriceLine {
  label: string;
  amount: string;
}

export interface PriceSummaryProps {
  lines: PriceLine[];
  total: string;
  currency?: string;
}
