import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { resultsFixture } from "../../../__fixtures__/flightResults";
import { EmptyResults } from "../EmptyResults";

function setup(props: Partial<Parameters<typeof EmptyResults>[0]> = {}) {
  const handlers = {
    onSelectDay: vi.fn(),
    onEditSearch: vi.fn(),
    onResetFilters: vi.fn(),
  };
  render(
    <EmptyResults
      calendar={resultsFixture.calendar}
      selectedDate="2026-10-14"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("EmptyResults", () => {
  it("UI-FR-07: When rendered, should show the empty message and the edit-search button", async () => {
    const { onEditSearch } = setup();
    expect(
      screen.getByRole("heading", { name: "ไม่มีที่นั่งว่างในวันนี้" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "แก้ไขการค้นหา" }),
    );
    expect(onEditSearch).toHaveBeenCalledOnce();
  });

  it("UI-FR-07: When nearby days exist, should list those with seats showing seat count and lowest price, and skip sold-out and the searched day", async () => {
    const { onSelectDay } = setup();
    const day = screen.getByRole("button", { name: /อ\. 13 ต\.ค\./ });
    expect(day).toHaveTextContent("฿1,290");
    expect(day).toHaveTextContent("เหลือ 14 ที่นั่ง");
    expect(
      screen.getByRole("button", { name: /พฤ\. 15 ต\.ค\./ }),
    ).toHaveTextContent("เหลือ 6 ที่นั่ง");
    expect(screen.queryByRole("button", { name: /พ\. 14 ต\.ค\./ })).toBeNull();
    expect(screen.queryByRole("button", { name: /จ\. 12 ต\.ค\./ })).toBeNull();
    await userEvent.click(day);
    expect(onSelectDay).toHaveBeenCalledWith("2026-10-13");
  });

  it("When no nearby day has seats, should not render the nearby section", () => {
    setup({
      calendar: resultsFixture.calendar.map((d) => ({
        ...d,
        soldOut: true,
        seatsLeft: 0,
        lowestFare: null,
      })),
    });
    expect(screen.queryByText("วันใกล้เคียง")).not.toBeInTheDocument();
  });

  it("When filters are active, should offer to reset them", async () => {
    const { onResetFilters } = setup({ hasActiveFilters: true });
    await userEvent.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));
    expect(onResetFilters).toHaveBeenCalledOnce();
  });

  it("When no filters are active, should not offer a reset", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: "ล้างตัวกรอง" }),
    ).not.toBeInTheDocument();
  });
});
