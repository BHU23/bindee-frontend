import { useEffect, useState } from "react";
import { CountdownBanner } from "../CountdownBanner";
import type { HoldCountdownProps } from "./HoldCountdown.types";

function secondsLeft(holdExpiresAt: string, now: number): number {
  const expiresAt = new Date(holdExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) return 0;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

/** Ticks once a second toward the server's `holdExpiresAt` and renders the shared banner with the PNR. */
export function HoldCountdown({ pnr, holdExpiresAt }: HoldCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = secondsLeft(holdExpiresAt, now);
  return (
    <CountdownBanner
      minutes={Math.floor(remaining / 60)}
      seconds={remaining % 60}
      pnr={pnr}
    />
  );
}
