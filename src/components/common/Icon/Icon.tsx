import {
  ArrowLeftRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Filter,
  FlaskConical,
  Info,
  Minus,
  Plane,
  Plus,
  TriangleAlert,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import type { IconName, IconProps } from "./Icon.types";

const ICONS: Record<IconName, LucideIcon> = {
  plane: Plane,
  calendar: Calendar,
  user: User,
  swap: ArrowLeftRight,
  chevron: ChevronRight,
  filter: Filter,
  clock: Clock,
  info: Info,
  check: Check,
  minus: Minus,
  plus: Plus,
  x: X,
  alert: TriangleAlert,
  flask: FlaskConical,
};

/** Decorative outline icon (1.75px stroke, currentColor). Put the accessible name on the parent control. */
export function Icon({ name, size = 20, className }: IconProps) {
  const Component = ICONS[name];
  return (
    <Component
      aria-hidden="true"
      data-icon={name}
      size={size}
      strokeWidth={1.75}
      className={className}
    />
  );
}
