import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SortControl } from "../SortControl";

describe("SortControl", () => {
  it("UI-FR-05: When rendered, should offer price, departure and duration with the current one pressed", () => {
    render(<SortControl value="departure" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "ราคา" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "เวลาออก" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "ระยะเวลา" }),
    ).toBeInTheDocument();
  });

  it("UI-FR-05: When the user picks another sort, should call onChange with its key", async () => {
    const onChange = vi.fn();
    render(<SortControl value="price" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "ระยะเวลา" }));
    expect(onChange).toHaveBeenCalledWith("duration");
  });
});
