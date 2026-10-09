import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectField } from "../SelectField";

const onValueChange = vi.fn();
const onBlur = vi.fn();

const options = [
  { value: "", label: "เลือกคำนำหน้า" },
  "Mr",
  { value: "ms", label: "Ms" },
];

describe("SelectField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("When rendered, should label the trigger and show the label of the current value", () => {
    render(<SelectField label="คำนำหน้า" options={options} value="ms" />);
    const trigger = screen.getByRole("combobox", { name: "คำนำหน้า" });
    expect(trigger).toHaveTextContent("Ms");
    expect(screen.getByText("คำนำหน้า")).toBeVisible();
  });

  it("When the value is empty, should show the placeholder option label in muted text", () => {
    render(<SelectField label="คำนำหน้า" options={options} value="" />);
    const trigger = screen.getByRole("combobox", { name: "คำนำหน้า" });
    expect(trigger).toHaveTextContent("เลือกคำนำหน้า");
    expect(trigger).toHaveClass("text-muted-foreground");
  });

  it("When opened, should list every option, strings and objects alike", async () => {
    const user = userEvent.setup();
    render(<SelectField label="คำนำหน้า" options={options} value="" />);
    await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
    const listed = (await screen.findAllByRole("option")).map(
      (option) => option.textContent,
    );
    expect(listed).toEqual(["เลือกคำนำหน้า", "Mr", "Ms"]);
  });

  it("When an option is picked, should call onValueChange with its value and show it", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <SelectField
          label="คำนำหน้า"
          options={options}
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
    await user.click(await screen.findByRole("option", { name: "Ms" }));
    expect(onValueChange).toHaveBeenCalledWith("ms");
    expect(screen.getByRole("combobox")).toHaveTextContent("Ms");
  });

  it("When opened with the keyboard, should pick the highlighted option with Enter", async () => {
    const user = userEvent.setup();
    render(
      <SelectField
        label="คำนำหน้า"
        options={options}
        value=""
        onValueChange={onValueChange}
      />,
    );
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await screen.findAllByRole("option");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("When there is an error, should show it under the field with aria-invalid and keep the label", () => {
    render(
      <SelectField
        label="สัญชาติ"
        options={options}
        value=""
        hint="ไม่ใช้"
        error="กรุณาเลือกสัญชาติ"
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "สัญชาติ" });
    const message = screen.getByText("กรุณาเลือกสัญชาติ");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", message.id);
    expect(message).toHaveClass("text-destructive");
    expect(screen.queryByText("ไม่ใช้")).not.toBeInTheDocument();
    expect(screen.getByText("สัญชาติ")).toBeVisible();
  });

  it("When there is a hint and no error, should describe the field with the hint", () => {
    render(
      <SelectField
        label="สัญชาติ"
        options={options}
        value=""
        hint="เลือกหนึ่งข้อ"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      "เลือกหนึ่งข้อ",
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("When the trigger loses focus, should call onBlur", async () => {
    const user = userEvent.setup();
    render(
      <SelectField
        label="คำนำหน้า"
        options={options}
        value=""
        onBlur={onBlur}
      />,
    );
    await user.tab();
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("When disabled, should not open", async () => {
    const user = userEvent.setup();
    render(<SelectField label="ชั้น" options={options} value="" disabled />);
    await user.click(screen.getByRole("combobox", { name: "ชั้น" }));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
