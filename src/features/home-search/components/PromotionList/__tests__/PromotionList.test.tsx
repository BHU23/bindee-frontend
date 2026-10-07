import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { promotionsFixture } from "../../../__fixtures__/homeSearch";
import { toPromotion } from "../../../hooks/usePromotions";
import { PromotionList } from "../PromotionList";

const promotions = promotionsFixture.map(toPromotion);

describe("PromotionList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-07: When promotions load, should show title, route, code and valid-until", () => {
    render(
      <PromotionList
        promotions={promotions}
        status="success"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("10 percent off every route")).toBeVisible();
    expect(screen.getByText("BKK → HKT")).toBeVisible();
    expect(screen.getByText("โค้ด BINDEE10")).toBeVisible();
    expect(screen.getByText("ใช้ได้ถึง พฤ. 31 ธ.ค.")).toBeVisible();
  });

  it("UI-HS-07: When loading, should show card skeletons", () => {
    render(
      <PromotionList promotions={[]} status="loading" onRetry={vi.fn()} />,
    );
    expect(screen.getAllByTestId("promotion-skeleton")).toHaveLength(3);
  });

  it("UI-HS-07: When loading fails, should show an Alert with a working retry", async () => {
    const onRetry = vi.fn();
    render(<PromotionList promotions={[]} status="error" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "โหลดโปรโมชันไม่สำเร็จ",
    );
    await userEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("When there are no valid promotions, should hide the section", () => {
    const { container } = render(
      <PromotionList promotions={[]} status="success" onRetry={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
