import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { PaymentMethod } from "../../../types/paymentMethod";
import { MethodOptions } from "../MethodOptions";

function Harness({
  disabledMethods = [],
  onChange = vi.fn(),
}: {
  disabledMethods?: PaymentMethod[];
  onChange?: (value: PaymentMethod) => void;
}) {
  const [value, setValue] = useState<PaymentMethod | null>(null);
  return (
    <MethodOptions
      value={value}
      disabledMethods={disabledMethods}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe("MethodOptions", () => {
  it("UI-PM-01: When rendered, should show three radio cards in a fieldset with a legend", () => {
    render(<Harness />);
    const group = screen.getByRole("group", { name: "วิธีชำระเงิน" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /บัตรเครดิต/ })).toBeVisible();
    expect(screen.getByText("ใช้บัตรทดสอบเท่านั้น")).toBeInTheDocument();
    expect(screen.getByText("KB, SCB, KS, BBL, ttb")).toBeInTheDocument();
  });

  it("UI-PM-01: When a method is disabled, should show it disabled with a coming-soon hint", () => {
    render(<Harness disabledMethods={["PROMPTPAY_QR", "MOBILE_BANKING"]} />);
    expect(screen.getByRole("radio", { name: /PromptPay/ })).toBeDisabled();
    expect(
      screen.getByRole("radio", { name: /Mobile banking/ }),
    ).toBeDisabled();
    expect(screen.getByRole("radio", { name: /บัตรเครดิต/ })).toBeEnabled();
    expect(screen.getAllByText("เร็ว ๆ นี้")).toHaveLength(2);
  });

  it("UI-PM-02: When clicking a card, should select it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: /บัตรเครดิต/ }));
    expect(onChange).toHaveBeenCalledWith("CARD");
    expect(screen.getByRole("radio", { name: /บัตรเครดิต/ })).toBeChecked();
  });

  it("UI-PM-06: When using the arrow keys, should move between the enabled cards", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(screen.getByRole("radio", { name: /บัตรเครดิต/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /PromptPay/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /Mobile banking/ })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("radio", { name: /PromptPay/ })).toHaveFocus();
  });

  it("UI-PM-06: When the arrow keys meet a disabled card, should skip it", async () => {
    const user = userEvent.setup();
    render(<Harness disabledMethods={["PROMPTPAY_QR"]} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /Mobile banking/ })).toHaveFocus();
  });

  it("UI-PM-06: When pressing Enter on a focused card, should select it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("CARD");
    expect(screen.getByRole("radio", { name: /บัตรเครดิต/ })).toBeChecked();
  });

  it("UI-PM-06: When pressing another key, should not select anything", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Harness
        onChange={onChange}
        disabledMethods={["PROMPTPAY_QR", "MOBILE_BANKING"]}
      />,
    );
    await user.tab();
    await user.keyboard("a");
    expect(onChange).not.toHaveBeenCalled();
  });
});
