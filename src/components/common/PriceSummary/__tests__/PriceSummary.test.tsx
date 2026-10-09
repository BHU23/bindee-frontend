import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceSummary } from "../PriceSummary";

describe("PriceSummary", () => {
  it("When rendered, should list lines, the total and the taxes-included note", () => {
    render(
      <PriceSummary
        lines={[
          { label: "ค่าโดยสาร", amount: "฿1,000" },
          { label: "ภาษีและค่าธรรมเนียม", amount: "฿190" },
        ]}
        total="฿1,190"
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("฿1,190")).toBeInTheDocument();
    expect(screen.getByText("รวมภาษีและค่าธรรมเนียมแล้ว")).toBeInTheDocument();
  });

  it("UI-FND-08: When a label or amount is long, should wrap and never truncate", () => {
    const long = "ชื่อรายการที่ยาวมากมากมากมากมากมากมากมากมากมากมาก";
    render(
      <PriceSummary
        lines={[{ label: long, amount: "฿1,234,567,890" }]}
        total="฿1,234,567,890"
        currency="THB"
      />,
    );
    for (const node of [
      screen.getByText(long),
      screen.getAllByText("฿1,234,567,890")[0]!,
    ]) {
      expect(node.className).toContain("break-words");
      expect(node.className).not.toMatch(/truncate|text-ellipsis/);
    }
  });
});
