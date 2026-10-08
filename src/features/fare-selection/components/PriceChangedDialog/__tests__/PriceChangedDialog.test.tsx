import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FlightCardDto, PriceChangedError } from "../../../types/booking";
import { PriceChangedDialog } from "../PriceChangedDialog";

const onAccept = vi.fn();
const onBack = vi.fn();

function makeChange(
  overrides: Partial<PriceChangedError> = {},
): PriceChangedError {
  return {
    code: "PRICE_CHANGED",
    message: "price changed",
    oldPrice: 1000,
    newPrice: 1100,
    diff: 100,
    reason: "PRICE_UPDATED",
    ...overrides,
  };
}

function makeFlight(n: number): FlightCardDto {
  return {
    flightId: `f${n}`,
    flightNo: `SG10${n}`,
    from: "BKK",
    to: "CNX",
    depart: "2026-10-14T01:30:00Z",
    arrive: "2026-10-14T03:00:00Z",
    duration: 90,
    stops: 0,
    fromPricePerPax: 1000 + n,
    lowest: false,
  };
}

function setup(change = makeChange(), busy = false) {
  render(
    <PriceChangedDialog
      open
      change={change}
      busy={busy}
      onAccept={onAccept}
      onBack={onBack}
    />,
  );
}

describe("PriceChangedDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UI-FS-03 when price updated up", () => {
    it("When rendered, should show old price, +diff, new price and both actions", () => {
      setup();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("฿1,000")).toBeInTheDocument();
      expect(screen.getByText("+฿100")).toBeInTheDocument();
      expect(screen.getByText("฿1,100")).toBeInTheDocument();
      expect(
        screen.getByText("ราคาตั๋วมีการปรับเปลี่ยนระหว่างที่คุณเลือก"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "ยอมรับราคาใหม่" }),
      ).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "กลับไปเลือกเที่ยวบิน" }),
      ).toBeEnabled();
    });

    it("When accept is clicked, should call onAccept only", async () => {
      setup();
      await userEvent.click(
        screen.getByRole("button", { name: "ยอมรับราคาใหม่" }),
      );
      expect(onAccept).toHaveBeenCalledTimes(1);
      expect(onBack).not.toHaveBeenCalled();
    });

    it("When back is clicked, should call onBack only", async () => {
      setup();
      await userEvent.click(
        screen.getByRole("button", { name: "กลับไปเลือกเที่ยวบิน" }),
      );
      expect(onBack).toHaveBeenCalledTimes(1);
      expect(onAccept).not.toHaveBeenCalled();
    });
  });

  describe("UI-FS-03 when price dropped", () => {
    it("When diff is negative, should show a minus sign", () => {
      setup(makeChange({ oldPrice: 1000, newPrice: 950, diff: -50 }));
      expect(screen.getByText("−฿50")).toBeInTheDocument();
    });
  });

  describe("UI-FS-03 when busy", () => {
    it("When busy, should disable both actions and mark accept busy", () => {
      setup(makeChange(), true);
      expect(
        screen.getByRole("button", { name: "กำลังดำเนินการ..." }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "กำลังดำเนินการ..." }),
      ).toHaveAttribute("aria-busy", "true");
      expect(
        screen.getByRole("button", { name: "กลับไปเลือกเที่ยวบิน" }),
      ).toBeDisabled();
    });
  });

  describe("UI-FS-03 when fare sold out", () => {
    it("When reason is FARE_SOLD_OUT, should offer only back and list up to 3 alternatives", () => {
      setup(
        makeChange({
          reason: "FARE_SOLD_OUT",
          alternatives: [1, 2, 3, 4].map(makeFlight),
        }),
      );
      expect(
        screen.queryByRole("button", { name: "ยอมรับราคาใหม่" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "กลับไปเลือกเที่ยวบิน" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "ที่นั่งในราคานี้ถูกจองไปแล้ว กรุณาเลือกเที่ยวบินใหม่",
        ),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.getByText(/SG101/)).toBeInTheDocument();
      expect(screen.queryByText(/SG104/)).not.toBeInTheDocument();
    });

    it("When there are no alternatives, should not render the hint", () => {
      setup(makeChange({ reason: "FARE_SOLD_OUT" }));
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("UI-FS-04 blocking dismissal", () => {
    it("When Escape is pressed, should stay open and call no callback", async () => {
      setup();
      await userEvent.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(onAccept).not.toHaveBeenCalled();
      expect(onBack).not.toHaveBeenCalled();
    });

    it("When the scrim is clicked, should stay open and call no callback", async () => {
      setup();
      const scrim = document.querySelector('[data-slot="dialog-overlay"]');
      expect(scrim).not.toBeNull();
      await userEvent.click(scrim as Element);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(onAccept).not.toHaveBeenCalled();
      expect(onBack).not.toHaveBeenCalled();
    });

    it("When rendered, should not show a close button", () => {
      setup();
      expect(
        screen.queryByRole("button", { name: /ปิด|close/i }),
      ).not.toBeInTheDocument();
    });
  });
});
