import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTERS } from "../../../lib/filters";
import type { FlightFilters } from "../../../types/flightResults";
import { FilterSheet } from "../FilterSheet";

const priceRange = { min: 1190, max: 3200 };

function setup(filters: FlightFilters = DEFAULT_FILTERS) {
  const onApply = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <FilterSheet
      open
      onOpenChange={onOpenChange}
      filters={filters}
      priceRange={priceRange}
      onApply={onApply}
    />,
  );
  return { onApply, onOpenChange };
}

describe("FilterSheet", () => {
  it("UI-FR-05: When it opens, should use priceRange from the results as the slider bounds", () => {
    setup();
    for (const name of ["ราคาต่ำสุด", "ราคาสูงสุด"]) {
      const slider = screen.getByRole("slider", { name });
      expect(slider).toHaveAttribute("min", "1190");
      expect(slider).toHaveAttribute("max", "3200");
    }
    expect(screen.getByRole("slider", { name: "ราคาต่ำสุด" })).toHaveValue(
      "1190",
    );
    expect(screen.getByRole("slider", { name: "ราคาสูงสุด" })).toHaveValue(
      "3200",
    );
  });

  it("When filters are already set, should start from them", () => {
    setup({
      ...DEFAULT_FILTERS,
      departure: ["night"],
      directOnly: true,
      minPrice: 1500,
      maxPrice: 2000,
      fare: ["FLEX"],
    });
    expect(
      screen.getByRole("checkbox", { name: "ดึก 22:00–04:59" }),
    ).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "เฉพาะบินตรง" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Flex" })).toBeChecked();
    expect(screen.getByRole("slider", { name: "ราคาต่ำสุด" })).toHaveValue(
      "1500",
    );
    expect(screen.getByRole("slider", { name: "ราคาสูงสุด" })).toHaveValue(
      "2000",
    );
  });

  it("UI-FR-05: When the user applies filters, should pass them to onApply and close", async () => {
    const user = userEvent.setup();
    const { onApply, onOpenChange } = setup();
    await user.click(
      screen.getByRole("checkbox", { name: "เช้า 05:00–11:59" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "เฉพาะบินตรง" }));
    await user.click(screen.getByRole("checkbox", { name: "Value" }));
    await user.click(screen.getByRole("button", { name: "ใช้ตัวกรอง" }));
    expect(onApply).toHaveBeenCalledWith({
      departure: ["morning"],
      directOnly: true,
      fare: ["VALUE"],
      sort: "price",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("UI-FR-05: When a checked option is unchecked, should drop it from the applied filters", async () => {
    const user = userEvent.setup();
    const { onApply } = setup({
      ...DEFAULT_FILTERS,
      departure: ["morning", "night"],
      fare: ["LITE"],
    });
    await user.click(
      screen.getByRole("checkbox", { name: "เช้า 05:00–11:59" }),
    );
    await user.click(screen.getByRole("checkbox", { name: "Lite" }));
    await user.click(screen.getByRole("button", { name: "ใช้ตัวกรอง" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ departure: ["night"], fare: [] }),
    );
  });

  it("When the price slider stays at the bounds, should not send a price filter; a narrowed one is sent", async () => {
    const user = userEvent.setup();
    const first = setup();
    await user.click(screen.getByRole("button", { name: "ใช้ตัวกรอง" }));
    expect(first.onApply.mock.calls[0]?.[0]).toEqual({
      ...DEFAULT_FILTERS,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it("UI-FR-05: When the sliders are narrowed, should apply the chosen min and max", async () => {
    const user = userEvent.setup();
    const { onApply } = setup();
    fireEvent.change(screen.getByRole("slider", { name: "ราคาต่ำสุด" }), {
      target: { value: "1500" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "ราคาสูงสุด" }), {
      target: { value: "2500" },
    });
    await user.click(screen.getByRole("button", { name: "ใช้ตัวกรอง" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 1500, maxPrice: 2500 }),
    );
  });

  it("When min is moved above max or max below min, should clamp so min never exceeds max", () => {
    setup({ ...DEFAULT_FILTERS, minPrice: 1500, maxPrice: 2000 });
    const min = screen.getByRole("slider", { name: "ราคาต่ำสุด" });
    const max = screen.getByRole("slider", { name: "ราคาสูงสุด" });
    fireEvent.change(min, { target: { value: "3000" } });
    expect(min).toHaveValue("2000");
    fireEvent.change(max, { target: { value: "1300" } });
    expect(max).toHaveValue("2000");
  });

  it("UI-FR-05: When the user resets, should apply the default filters (keeping the sort) and close", async () => {
    const user = userEvent.setup();
    const { onApply, onOpenChange } = setup({
      ...DEFAULT_FILTERS,
      directOnly: true,
      departure: ["evening"],
      sort: "duration",
    });
    await user.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));
    expect(onApply).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      sort: "duration",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
