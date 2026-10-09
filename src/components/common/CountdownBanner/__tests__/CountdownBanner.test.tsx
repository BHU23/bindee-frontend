import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CountdownBanner } from "../CountdownBanner";

describe("CountdownBanner", () => {
  describe("UI-FND-04 with minutes=2", () => {
    it("When rendered, should be a timer in the solid warning style", () => {
      render(<CountdownBanner minutes={2} />);
      const timer = screen.getByRole("timer");
      expect(timer).toHaveClass("bg-warning");
      expect(timer).toHaveAttribute("data-urgent", "true");
    });

    it('When rendered, should never contain the word "Hurry"', () => {
      render(<CountdownBanner minutes={2} pnr="ABC123" />);
      expect(screen.getByRole("timer").textContent).not.toMatch(/hurry/i);
    });
  });

  describe("when 3 minutes or more remain", () => {
    it("When minutes=3 or more, should use the calm style and show mm:ss and the PNR", () => {
      render(<CountdownBanner minutes={14} seconds={5} pnr="ABC123" />);
      const timer = screen.getByRole("timer");
      expect(timer).not.toHaveClass("bg-warning");
      expect(timer).toHaveTextContent("14:05");
      expect(timer).toHaveTextContent("ABC123");
    });
  });

  it("When exactly 3 minutes remain, should still be calm; one second less is urgent", () => {
    const { rerender } = render(<CountdownBanner minutes={3} />);
    expect(screen.getByRole("timer")).not.toHaveClass("bg-warning");
    rerender(<CountdownBanner minutes={2} seconds={59} />);
    expect(screen.getByRole("timer")).toHaveClass("bg-warning");
  });
});
