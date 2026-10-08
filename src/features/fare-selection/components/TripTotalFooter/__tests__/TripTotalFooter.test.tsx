import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  outboundSelection,
  returnSelection,
} from "../../../__fixtures__/booking";
import { TripTotalFooter } from "../TripTotalFooter";

describe("TripTotalFooter", () => {
  it("UI-FS-07: When both legs are chosen, should show each leg and the round-trip total", () => {
    render(
      <TripTotalFooter selections={[outboundSelection, returnSelection]} />,
    );
    expect(screen.getByText("ขาไป BKK → CNX")).toBeInTheDocument();
    expect(screen.getByText("ขากลับ CNX → BKK")).toBeInTheDocument();
    expect(screen.getByText("฿2,980")).toBeInTheDocument();
    expect(screen.getByText("฿2,380")).toBeInTheDocument();
    expect(screen.getByText("฿5,360")).toBeInTheDocument();
  });

  it("UI-FS-09: When only the outbound is chosen, should total only the outbound", () => {
    render(<TripTotalFooter selections={[outboundSelection]} />);
    expect(screen.queryByText(/ขากลับ/)).not.toBeInTheDocument();
    expect(screen.getAllByText("฿2,980")).toHaveLength(2);
  });

  it("UI-FS-07: When nothing is chosen, should render nothing", () => {
    const { container } = render(<TripTotalFooter selections={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
