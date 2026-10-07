import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Counter } from "../Counter";

describe("Counter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when uncontrolled", () => {
    it("When pressing plus and minus, should step the value and call onChange", async () => {
      const onChange = vi.fn();
      render(
        <Counter
          label="ผู้ใหญ่"
          defaultValue={1}
          min={1}
          max={3}
          onChange={onChange}
        />,
      );
      await userEvent.click(
        screen.getByRole("button", { name: "เพิ่ม ผู้ใหญ่" }),
      );
      expect(screen.getByRole("status")).toHaveTextContent("2");
      await userEvent.click(screen.getByRole("button", { name: "ลด ผู้ใหญ่" }));
      expect(screen.getByRole("status")).toHaveTextContent("1");
      expect(onChange.mock.calls.map(([n]) => n)).toEqual([2, 1]);
    });

    it("When at min or max, should disable the matching button", () => {
      const { rerender } = render(
        <Counter label="ผู้ใหญ่" defaultValue={1} min={1} max={3} />,
      );
      expect(screen.getByRole("button", { name: "ลด ผู้ใหญ่" })).toBeDisabled();
      rerender(<Counter label="ผู้ใหญ่" value={3} min={1} max={3} />);
      expect(
        screen.getByRole("button", { name: "เพิ่ม ผู้ใหญ่" }),
      ).toBeDisabled();
    });
  });

  describe("when controlled", () => {
    it("When pressing plus, should call onChange but keep showing the given value", async () => {
      const onChange = vi.fn();
      render(
        <Counter
          label="เด็ก"
          description="อายุ 2-11 ปี"
          value={0}
          onChange={onChange}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "เพิ่ม เด็ก" }));
      expect(onChange).toHaveBeenCalledWith(1);
      expect(screen.getByRole("status")).toHaveTextContent("0");
      expect(screen.getByText("อายุ 2-11 ปี")).toBeInTheDocument();
    });
  });

  it("When used without a max, should never disable plus", () => {
    render(<Counter label="ผู้ใหญ่" defaultValue={5} />);
    expect(screen.getByRole("button", { name: "เพิ่ม ผู้ใหญ่" })).toBeEnabled();
  });
});
