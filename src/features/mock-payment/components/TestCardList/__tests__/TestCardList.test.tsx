import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TEST_CARDS } from "../../../lib/testCards";
import { TestCardList } from "../TestCardList";

describe("TestCardList", () => {
  it("UI-MP-02: When rendered, should list each test card with its outcome", () => {
    render(<TestCardList cards={TEST_CARDS} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByText("สำเร็จ")).toBeInTheDocument();
    expect(screen.getByText("ถูกปฏิเสธ")).toBeInTheDocument();
    expect(screen.getByText("หมดเวลา")).toBeInTheDocument();
  });

  it("UI-MP-02: When a card is tapped, should report it", async () => {
    const onSelect = vi.fn();
    render(<TestCardList cards={TEST_CARDS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /0002/ }));
    expect(onSelect).toHaveBeenCalledWith(TEST_CARDS[1]);
  });
});
