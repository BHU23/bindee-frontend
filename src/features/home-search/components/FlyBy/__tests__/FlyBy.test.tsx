import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlyBy } from "../FlyBy";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }));
}

describe("FlyBy", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("When the page opens, should show a decorative plane hidden from assistive tech", () => {
    mockReducedMotion(false);
    render(<FlyBy />);
    expect(screen.getByTestId("flyby")).toHaveAttribute("aria-hidden", "true");
  });

  it("When the flight animation ends, should remove the plane and call onDone once", () => {
    mockReducedMotion(false);
    const onDone = vi.fn();
    render(<FlyBy onDone={onDone} />);
    // jsdom has no AnimationEvent, so React listens for the vendor-prefixed name there.
    fireEvent(
      screen.getByTestId("flyby"),
      new Event("webkitAnimationEnd", { bubbles: true }),
    );
    expect(screen.queryByTestId("flyby")).not.toBeInTheDocument();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("When the guest prefers reduced motion, should not render the plane", () => {
    mockReducedMotion(true);
    render(<FlyBy />);
    expect(screen.queryByTestId("flyby")).not.toBeInTheDocument();
  });

  it("When matchMedia is unavailable, should still play the intro", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<FlyBy />);
    expect(screen.getByTestId("flyby")).toBeInTheDocument();
  });
});
