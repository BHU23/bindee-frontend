import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestModeBanner } from "../TestModeBanner";

describe("TestModeBanner", () => {
  it("UI-FND-05: When rendered, should be visible with the default test-mode message", () => {
    render(<TestModeBanner />);
    expect(screen.getByRole("note")).toBeVisible();
    expect(screen.getByRole("note")).toHaveTextContent("โหมดทดสอบ");
  });

  it("When given children, should show them instead of the default message", () => {
    render(<TestModeBanner>ข้อความเฉพาะหน้า</TestModeBanner>);
    expect(screen.getByRole("note")).toHaveTextContent("ข้อความเฉพาะหน้า");
  });
});
