import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { popularRoutesFixture } from "../../../__fixtures__/homeSearch";
import { toPopularRoute } from "../../../hooks/usePopularRoutes";
import { PopularRoutes } from "../PopularRoutes";

const routes = popularRoutesFixture.map(toPopularRoute);

describe("PopularRoutes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UI-HS-09: When routes load, should show each computed price as เริ่มต้น ฿X / ท่าน รวมภาษี", () => {
    render(
      <PopularRoutes
        routes={routes}
        status="success"
        onRetry={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("เริ่มต้น ฿990 / ท่าน รวมภาษี")).toBeVisible();
    expect(screen.getByText("เริ่มต้น ฿1,290 / ท่าน รวมภาษี")).toBeVisible();
    expect(screen.getByText("เริ่มต้น ฿2,990 / ท่าน รวมภาษี")).toBeVisible();
  });

  it("UI-HS-09: When a route has no seats, should say so instead of showing a price", () => {
    render(
      <PopularRoutes
        routes={routes}
        status="success"
        onRetry={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("ที่นั่งเต็มช่วงนี้")).toBeVisible();
  });

  it("When picking a route card, should pass the route to onSelect", async () => {
    const onSelect = vi.fn();
    render(
      <PopularRoutes
        routes={routes}
        status="success"
        onRetry={vi.fn()}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "เลือกเส้นทาง BKK → CNX" }),
    );
    expect(onSelect).toHaveBeenCalledWith(routes[0]);
  });

  it("When loading, should show route skeletons", () => {
    render(
      <PopularRoutes
        routes={[]}
        status="loading"
        onRetry={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId("route-skeleton")).toHaveLength(4);
  });

  it("When loading fails, should show an Alert with a working retry", async () => {
    const onRetry = vi.fn();
    render(
      <PopularRoutes
        routes={[]}
        status="error"
        onRetry={onRetry}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "โหลดเส้นทางยอดนิยมไม่สำเร็จ",
    );
    await userEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("When there are no routes, should hide the section", () => {
    const { container } = render(
      <PopularRoutes
        routes={[]}
        status="success"
        onRetry={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
