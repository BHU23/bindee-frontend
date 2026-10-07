import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { recentSearchesFixture } from "../../../__fixtures__/homeSearch";
import { toRecentSearch } from "../../../hooks/useRecentSearches";
import { RecentSearches } from "../RecentSearches";

const searches = recentSearchesFixture.map(toRecentSearch);

describe("RecentSearches", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-06: When there are no recent searches, should render nothing", () => {
    const { container } = render(
      <RecentSearches searches={[]} onSelect={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("When recents exist, should show route, dates, passengers and trip type", () => {
    render(<RecentSearches searches={searches} onSelect={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "ค้นหาล่าสุด" })).toBeVisible();
    expect(screen.getByText("BKK → CNX")).toBeVisible();
    expect(screen.getByText(/3 ท่าน/)).toBeVisible();
    expect(screen.getByText(/ไป-กลับ/)).toBeVisible();
    expect(screen.getByText(/เที่ยวเดียว/)).toBeVisible();
  });

  it("UI-HS-05: When tapping a recent search, should pass its query to onSelect", async () => {
    const onSelect = vi.fn();
    render(<RecentSearches searches={searches} onSelect={onSelect} />);
    await userEvent.click(
      screen.getByRole("button", { name: "ค้นหาอีกครั้ง BKK → HKT" }),
    );
    expect(onSelect).toHaveBeenCalledWith(searches[1]?.query);
  });

  it("When a search is running, should disable the recent buttons", () => {
    render(<RecentSearches searches={searches} isBusy onSelect={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "ค้นหาอีกครั้ง BKK → HKT" }),
    ).toBeDisabled();
  });
});
