import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { queryFixture } from "../../../__fixtures__/flightResults";
import { SearchExpired } from "../SearchExpired";

describe("SearchExpired", () => {
  it("UI-FR-08: When rendered, should show the query and one primary CTA that searches again", async () => {
    const onSearchAgain = vi.fn();
    render(
      <SearchExpired query={queryFixture} onSearchAgain={onSearchAgain} />,
    );
    expect(
      screen.getByRole("heading", { name: "ผลการค้นหาหมดอายุแล้ว" }),
    ).toBeInTheDocument();
    expect(screen.getByText("BKK → CNX")).toBeInTheDocument();
    expect(screen.getByText("พ. 14 ต.ค.")).toBeInTheDocument();
    expect(screen.getByText("ผู้โดยสาร 2 ท่าน")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveClass("bg-primary");
    await userEvent.click(buttons[0]!);
    expect(onSearchAgain).toHaveBeenCalledOnce();
  });

  it("When the server sent no query, should still offer the CTA without a query block", () => {
    render(<SearchExpired query={null} onSearchAgain={vi.fn()} />);
    expect(screen.queryByText("เงื่อนไขการค้นหา")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ค้นหาอีกครั้ง" })).toBeEnabled();
  });

  it("When busy, should disable the CTA; when a retry failed, should say so", () => {
    render(
      <SearchExpired
        query={queryFixture}
        busy
        failed
        onSearchAgain={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "กำลังค้นหา" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "ค้นหาใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง",
    );
  });

  it("When the query has infants and children, should count every passenger", () => {
    render(
      <SearchExpired
        query={{ ...queryFixture, adults: 2, children: 1, infants: 1 }}
        onSearchAgain={vi.fn()}
      />,
    );
    expect(screen.getByText("ผู้โดยสาร 4 ท่าน")).toBeInTheDocument();
  });
});
