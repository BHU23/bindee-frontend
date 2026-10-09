import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatePickerField } from "../DatePickerField";
import type { DatePickerFieldProps } from "../DatePickerField.types";

const onValueChange = vi.fn();
const onBlur = vi.fn();

function renderField(overrides: Partial<DatePickerFieldProps> = {}) {
  return render(
    <DatePickerField
      label="วันเกิด"
      placeholder="วว/ดด/ปปปป"
      value=""
      onValueChange={onValueChange}
      onBlur={onBlur}
      startMonth={new Date(2000, 0, 1)}
      endMonth={new Date(2030, 11, 1)}
      defaultMonth={new Date(2024, 4, 1)}
      {...overrides}
    />,
  );
}

describe("DatePickerField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When no day is chosen, should show the label and the dd/mm/yyyy placeholder", () => {
    renderField();
    const trigger = screen.getByRole("button", { name: /วันเกิด/ });
    expect(trigger).toHaveTextContent("วว/ดด/ปปปป");
    expect(screen.getByText("วันเกิด")).toBeVisible();
  });

  it("When a value is set, should show it as dd/mm/yyyy", () => {
    renderField({ value: "1990-05-01" });
    expect(screen.getByRole("button")).toHaveTextContent("01/05/1990");
  });

  it("When opened, should show a calendar with month and year dropdowns instead of a native date input", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getAllByRole("combobox").length,
    ).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getByRole("grid")).toBeInTheDocument();
    expect(document.querySelector('input[type="date"]')).toBeNull();
  });

  it("When opened, should not let the full-width month navigation cover the dropdowns (they were unclickable in a real browser)", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const dialog = await screen.findByRole("dialog");
    const nav = within(dialog).getByRole("navigation");
    expect(nav).toHaveClass("pointer-events-none");
    for (const arrow of within(nav).getAllByRole("button")) {
      expect(arrow).toHaveClass("pointer-events-auto");
    }
  });

  it("When a day is picked, should send it as YYYY-MM-DD, close the calendar and call onBlur", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const grid = await screen.findByRole("grid");
    await user.click(within(grid).getByRole("button", { name: /15/ }));
    expect(onValueChange).toHaveBeenCalledWith("2024-05-15");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("When the year dropdown is used, should jump to that year before picking", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const dialog = await screen.findByRole("dialog");
    const [, yearSelect] = within(dialog).getAllByRole("combobox");
    await user.click(yearSelect);
    await user.click(await screen.findByRole("option", { name: "2010" }));
    const grid = await screen.findByRole("grid");
    await user.click(
      within(grid).getByRole("button", { name: /ที่ 20 พฤษภาคม/ }),
    );
    expect(onValueChange).toHaveBeenCalledWith("2010-05-20");
  });

  it("When a day is outside disabledDays, should not be pickable", async () => {
    const user = userEvent.setup();
    renderField({ disabledDays: { before: new Date(2024, 4, 10) } });
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const grid = await screen.findByRole("grid");
    const early = within(grid).getByRole("button", { name: /\b5\b/ });
    expect(early).toBeDisabled();
    await user.click(early);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("When opened with the keyboard, should pick a day with arrows and Enter", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState("2024-05-15");
      return (
        <DatePickerField
          label="วันเกิด"
          placeholder="วว/ดด/ปปปป"
          value={value}
          onValueChange={setValue}
          startMonth={new Date(2000, 0, 1)}
          endMonth={new Date(2030, 11, 1)}
        />
      );
    }
    render(<Harness />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("grid");
    const selected = screen
      .getAllByRole("gridcell")
      .find((cell) => cell.getAttribute("aria-selected") === "true");
    within(selected as HTMLElement)
      .getByRole("button")
      .focus();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("button")).toHaveTextContent("16/05/2024");
  });

  it("When Escape is pressed, should close the calendar without a value", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    await screen.findByRole("grid");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("When there is an error, should show it under the field with aria-invalid and keep the label", () => {
    renderField({ error: "กรุณากรอกวันเกิด", hint: "ไม่ใช้" });
    const trigger = screen.getByRole("button", { name: /วันเกิด/ });
    const message = screen.getByText("กรุณากรอกวันเกิด");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", message.id);
    expect(message).toHaveClass("text-destructive");
    expect(screen.queryByText("ไม่ใช้")).not.toBeInTheDocument();
    expect(screen.getByText("วันเกิด")).toBeVisible();
  });

  it("When there is only a hint, should describe the field with it", () => {
    renderField({ hint: "ตามบัตรประชาชน" });
    expect(screen.getByRole("button")).toHaveAccessibleDescription(
      "ตามบัตรประชาชน",
    );
  });

  it("When disabled, should not open", async () => {
    const user = userEvent.setup();
    renderField({ disabled: true });
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
