import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultsError } from "../ResultsError";

describe("ResultsError", () => {
  it("UI-FR-09: When rendered, should show an alert with a retry button that retries", async () => {
    const onRetry = vi.fn();
    render(<ResultsError onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "โหลดเที่ยวบินไม่สำเร็จ",
    );
    await userEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
