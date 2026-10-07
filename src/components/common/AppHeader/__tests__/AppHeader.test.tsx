import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "../AppHeader";

describe("AppHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When there is no title, should show the wordmark and no back button", () => {
    render(<AppHeader />);
    expect(screen.getByRole("img", { name: "Bin Dee" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("When given a title and onBack, should show the heading and a working back button", async () => {
    const onBack = vi.fn();
    render(
      <AppHeader
        title="เลือกเที่ยวบิน"
        onBack={onBack}
        right={<span>ขวา</span>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "เลือกเที่ยวบิน" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByText("ขวา")).toBeInTheDocument();
  });

  it("UI-FND-06: When rendered, should show no language toggle", () => {
    render(<AppHeader title="หน้าแรก" />);
    expect(
      screen.queryByRole("button", { name: /EN|English|ภาษา/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/TH\s*·\s*EN/)).not.toBeInTheDocument();
  });

  it("UI-FND-08: When the title is long, should wrap and never truncate", () => {
    render(
      <AppHeader title="ชื่อหน้าจอที่ยาวมากมากมากมากมากมากมากมากมากมากมาก" />,
    );
    const heading = screen.getByRole("heading");
    expect(heading.className).toContain("break-words");
    expect(heading.className).not.toMatch(/truncate|text-ellipsis/);
  });
});
