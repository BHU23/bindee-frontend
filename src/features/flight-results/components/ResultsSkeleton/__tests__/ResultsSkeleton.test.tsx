import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultsSkeleton } from "../ResultsSkeleton";

describe("ResultsSkeleton", () => {
  it("UI-FR-06: When loading, should show card-shaped skeletons with an accessible status, not a bare spinner", () => {
    const { container } = render(<ResultsSkeleton />);
    expect(
      screen.getByRole("status", { name: "กำลังค้นหาเที่ยวบิน" }),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="flight-card-skeleton"]'),
    ).toHaveLength(3);
  });
});
