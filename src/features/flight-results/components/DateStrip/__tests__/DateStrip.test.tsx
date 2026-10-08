import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DateStripDay } from "../DateStrip.types";
import { DateStrip } from "../DateStrip";

const days: DateStripDay[] = [
  { date: "2026-10-13", label: "อ. 13 ต.ค.", price: "฿1,290" },
  { date: "2026-10-14", label: "พ. 14 ต.ค.", price: "฿1,190", lowest: true },
  { date: "2026-10-15", label: "พฤ. 15 ต.ค.", soldOut: true },
];

describe("DateStrip", () => {
  it("UI-FR-04: When a day is selected, should mark it pressed with the solid midnight tile", () => {
    render(<DateStrip days={days} value="2026-10-14" />);
    const selected = screen.getByRole("button", { name: /พ\. 14 ต\.ค\./ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveClass("bg-midnight", "text-primary-foreground");
    const other = screen.getByRole("button", { name: /อ\. 13 ต\.ค\./ });
    expect(other).toHaveAttribute("aria-pressed", "false");
    expect(other).not.toHaveClass("bg-midnight");
  });

  it("UI-FR-04: When the user selects another day, should call onValueChange with its date", async () => {
    const onValueChange = vi.fn();
    render(
      <DateStrip
        days={days}
        value="2026-10-14"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /อ\. 13 ต\.ค\./ }),
    );
    expect(onValueChange).toHaveBeenCalledWith("2026-10-13");
  });

  it("UI-FR-04: When a day is sold out, should be disabled, labelled sold out and not selectable", async () => {
    const onValueChange = vi.fn();
    render(
      <DateStrip
        days={days}
        value="2026-10-14"
        onValueChange={onValueChange}
      />,
    );
    const soldOut = screen.getByRole("button", { name: /พฤ\. 15 ต\.ค\./ });
    expect(soldOut).toBeDisabled();
    expect(soldOut).toHaveTextContent("เต็ม");
    await userEvent.click(soldOut);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("When selecting the day that is already selected, should not call onValueChange", async () => {
    const onValueChange = vi.fn();
    render(
      <DateStrip
        days={days}
        value="2026-10-14"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /พ\. 14 ต\.ค\./ }),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("When disabled, should lock every tile", () => {
    render(<DateStrip days={days} value="2026-10-14" disabled />);
    for (const tile of screen.getAllByRole("button"))
      expect(tile).toBeDisabled();
  });

  it("When a day is the lowest or has a note, should show the price in sunset-deep and the note", () => {
    render(
      <DateStrip
        days={[{ ...days[1]!, note: "เหลือ 12 ที่นั่ง" }]}
        value="2026-10-13"
      />,
    );
    expect(screen.getByText("฿1,190")).toHaveClass("text-sunset-deep");
    expect(screen.getByText("เหลือ 12 ที่นั่ง")).toBeInTheDocument();
  });
});
