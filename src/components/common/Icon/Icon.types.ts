export type IconName =
  | "plane"
  | "calendar"
  | "user"
  | "swap"
  | "chevron"
  | "filter"
  | "clock"
  | "info"
  | "check"
  | "minus"
  | "plus"
  | "x"
  | "alert"
  | "flask";

export interface IconProps {
  name: IconName;
  size?: 16 | 20 | 24;
  className?: string;
}
