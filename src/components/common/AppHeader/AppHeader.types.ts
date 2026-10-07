import type { ReactNode } from "react";

export interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}
