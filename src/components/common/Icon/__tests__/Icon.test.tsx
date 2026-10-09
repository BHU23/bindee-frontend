import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, type IconName } from "..";

const NAMES: IconName[] = [
  "plane",
  "calendar",
  "user",
  "swap",
  "chevron",
  "filter",
  "clock",
  "info",
  "check",
  "minus",
  "plus",
  "x",
  "alert",
  "flask",
];

describe("Icon", () => {
  it.each(NAMES)(
    "When name is %s, should render a decorative outline svg",
    (name) => {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("data-icon", name);
      expect(svg).toHaveAttribute("stroke-width", "1.75");
    },
  );

  it("When size is given, should apply it", () => {
    const { container } = render(<Icon name="plane" size={24} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
  });
});
