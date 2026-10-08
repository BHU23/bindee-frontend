import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { faresFixture } from "../../../__fixtures__/booking";
import { FareCard } from "../FareCard";

const [lite, value, flex] = faresFixture.fares;

function setup(fare = lite, selected = false) {
  const onSelect = vi.fn();
  render(
    <FareCard
      fare={fare}
      name="fare"
      selected={selected}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
}

describe("FareCard", () => {
  describe("UI-FS-01: contents", () => {
    it("When a Lite fare renders, should show price per pax, baggage and the no-change/no-refund/no-seat rules", () => {
      setup(lite);
      expect(screen.getByText("Lite")).toBeInTheDocument();
      expect(
        screen.getByText("฿1,190 ต่อท่าน รวมภาษีแล้ว"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("สัมภาระถือขึ้นเครื่อง 7 กก."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("ไม่รวมสัมภาระโหลดใต้ท้องเครื่อง"),
      ).toBeInTheDocument();
      expect(screen.getByText("เปลี่ยนเที่ยวบินไม่ได้")).toBeInTheDocument();
      expect(screen.getByText("ไม่สามารถขอคืนเงิน")).toBeInTheDocument();
      expect(screen.getByText("ไม่รวมการเลือกที่นั่ง")).toBeInTheDocument();
    });

    it("When a Value fare renders, should show checked baggage, the change fee and the included seat", () => {
      setup(value);
      expect(
        screen.getByText("สัมภาระโหลดใต้ท้องเครื่อง 20 กก."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("เปลี่ยนเที่ยวบินได้ ค่าธรรมเนียม ฿500"),
      ).toBeInTheDocument();
      expect(screen.getByText("รวมการเลือกที่นั่ง")).toBeInTheDocument();
    });

    it("When a Flex fare renders, should show free change and a refund with fee", () => {
      setup(flex);
      expect(screen.getByText("เปลี่ยนเที่ยวบินได้ฟรี")).toBeInTheDocument();
      expect(
        screen.getByText("คืนเงินได้ ค่าธรรมเนียม ฿200"),
      ).toBeInTheDocument();
    });

    it("When a fare refunds without fee, should say the refund is full", () => {
      setup({ ...flex, refundFee: 0 });
      expect(screen.getByText("คืนเงินได้เต็มจำนวน")).toBeInTheDocument();
    });
  });

  it("UI-FS-01: When the radio is chosen, should call onSelect", async () => {
    const { onSelect } = setup(value);
    await userEvent.click(screen.getByRole("radio", { name: /Value/ }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("UI-FS-01: When selected, should check the radio", () => {
    setup(value, true);
    expect(screen.getByRole("radio", { name: /Value/ })).toBeChecked();
  });
});
