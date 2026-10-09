import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PassengerFooter } from "../PassengerFooter";

describe("PassengerFooter", () => {
  it("UI-PX-07: When rendered, should show the total for all passengers", () => {
    render(
      <PassengerFooter
        total={9000}
        outboundTotal={9000}
        isSubmitting={false}
      />,
    );
    expect(screen.getByLabelText("ยอดรวมทุกท่าน")).toHaveTextContent("฿9,000");
  });

  it("UI-PX-07: When tapping ดูรายละเอียดราคา, should open a Sheet with a line per leg and the total", async () => {
    const user = userEvent.setup();
    render(
      <PassengerFooter
        total={2990}
        outboundTotal={1190}
        inboundTotal={1800}
        isSubmitting={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: "ดูรายละเอียดราคา" }));
    const dialog = await screen.findByRole("dialog", {
      name: "รายละเอียดราคา",
    });
    expect(within(dialog).getByText("เที่ยวบินขาไป")).toBeInTheDocument();
    expect(within(dialog).getByText("฿1,190")).toBeInTheDocument();
    expect(within(dialog).getByText("เที่ยวบินขากลับ")).toBeInTheDocument();
    expect(within(dialog).getByText("฿1,800")).toBeInTheDocument();
    expect(within(dialog).getByText(/฿2,990/)).toBeInTheDocument();
  });

  it("When one-way, should show no return line", async () => {
    const user = userEvent.setup();
    render(
      <PassengerFooter
        total={1190}
        outboundTotal={1190}
        isSubmitting={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: "ดูรายละเอียดราคา" }));
    await screen.findByRole("dialog");
    expect(screen.queryByText("เที่ยวบินขากลับ")).not.toBeInTheDocument();
  });

  it("When submitting, should disable the continue button and say it is saving", () => {
    render(<PassengerFooter total={1190} outboundTotal={1190} isSubmitting />);
    expect(screen.getByRole("button", { name: "กำลังบันทึก" })).toBeDisabled();
  });
});
