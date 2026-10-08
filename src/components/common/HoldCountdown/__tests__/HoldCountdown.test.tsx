import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoldCountdown } from "../HoldCountdown";

const NOW = new Date("2026-10-14T00:00:00.000Z");

function expiresIn(seconds: number): string {
  return new Date(NOW.getTime() + seconds * 1000).toISOString();
}

describe("HoldCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("UI-RH-04: When 15 minutes remain, should show a timer with the PNR in the calm style", () => {
    render(<HoldCountdown pnr="AB12CD" holdExpiresAt={expiresIn(900)} />);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent("15:00");
    expect(timer).toHaveTextContent("AB12CD");
    expect(timer).not.toHaveAttribute("data-urgent");
  });

  it("UI-RH-04: When a second passes, should count down from the server expiry", () => {
    render(<HoldCountdown pnr="AB12CD" holdExpiresAt={expiresIn(900)} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("14:59");
  });

  it("UI-RH-04: When under 3 minutes remain, should switch to the warning style", () => {
    render(<HoldCountdown pnr="AB12CD" holdExpiresAt={expiresIn(179)} />);
    expect(screen.getByRole("timer")).toHaveAttribute("data-urgent", "true");
  });

  it("UI-RH-04: When the hold has expired, should stop at 00:00", () => {
    render(<HoldCountdown pnr="AB12CD" holdExpiresAt={expiresIn(1)} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
  });

  it("When the expiry is not a valid date, should show 00:00", () => {
    render(<HoldCountdown pnr="AB12CD" holdExpiresAt="nope" />);
    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
  });
});
