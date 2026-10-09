import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactSection } from "../ContactSection";

const onChange = vi.fn();
const onBlur = vi.fn();
const contact = { name: "", email: "", phoneCode: "+66", phoneNumber: "" };

describe("ContactSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-PX-06: When rendered, should preselect +66 as the country code", () => {
    render(
      <ContactSection
        contact={contact}
        errors={{}}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "รหัสประเทศ" }),
    ).toHaveTextContent("+66");
  });

  it("UI-PX-06: When the email is invalid, should show the message under it", () => {
    render(
      <ContactSection
        contact={{ ...contact, email: "abc" }}
        errors={{
          "contact.email": "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com",
        }}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByText("กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"),
    ).toBeInTheDocument();
  });

  it("When editing and leaving fields, should report each change and blur", async () => {
    const user = userEvent.setup();
    render(
      <ContactSection
        contact={contact}
        errors={{
          "contact.phoneNumber":
            "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เช่น 812345678",
        }}
        onChange={onChange}
        onBlur={onBlur}
      />,
    );
    await user.type(screen.getByLabelText("ชื่อผู้ติดต่อ"), "A");
    await user.tab();
    await user.type(screen.getByLabelText("อีเมล"), "b");
    await user.tab();
    await user.type(screen.getByLabelText("เบอร์โทรศัพท์"), "1");
    await user.tab();
    await user.click(screen.getByRole("combobox", { name: "รหัสประเทศ" }));
    await user.click(await screen.findByRole("option", { name: "+65" }));
    expect(onChange).toHaveBeenCalledWith("name", "A");
    expect(onChange).toHaveBeenCalledWith("email", "b");
    expect(onChange).toHaveBeenCalledWith("phoneNumber", "1");
    expect(onChange).toHaveBeenCalledWith("phoneCode", "+65");
    expect(onBlur).toHaveBeenCalledWith("name");
    expect(onBlur).toHaveBeenCalledWith("email");
    expect(onBlur).toHaveBeenCalledWith("phoneNumber");
  });
});
