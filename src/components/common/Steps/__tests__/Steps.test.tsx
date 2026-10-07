import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Steps } from "../Steps";

const steps = ["เที่ยวบิน", "ผู้โดยสาร", "บริการเสริม", "ตรวจสอบ", "ชำระเงิน"];

describe("Steps", () => {
  describe("UI-FND-03 with 5 steps and current=2", () => {
    it("When rendered, should mark steps 0-1 done, 2 current and the rest upcoming", () => {
      render(<Steps steps={steps} current={2} />);
      const items = screen.getAllByRole("listitem");
      expect(items.map((li) => li.getAttribute("data-state"))).toEqual([
        "done",
        "done",
        "current",
        "upcoming",
        "upcoming",
      ]);
    });

    it('When rendered, should put aria-current="step" only on step 2', () => {
      render(<Steps steps={steps} current={2} />);
      const items = screen.getAllByRole("listitem");
      expect(items.map((li) => li.getAttribute("aria-current"))).toEqual([
        null,
        null,
        "step",
        null,
        null,
      ]);
    });
  });

  it("When a label is long, should wrap instead of truncating (UI-FND-08)", () => {
    render(
      <Steps steps={["ชื่อขั้นตอนที่ยาวมากมากมากมากมากมาก"]} current={0} />,
    );
    const label = screen.getByText("ชื่อขั้นตอนที่ยาวมากมากมากมากมากมาก");
    expect(label.className).toContain("break-words");
    expect(label.className).not.toMatch(/truncate|text-ellipsis/);
  });
});
