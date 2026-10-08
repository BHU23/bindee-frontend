import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  FormErrors,
  PassengerFormValues,
} from "../../../types/passengerInfo";
import { PassengerCard } from "../PassengerCard";
import type { PassengerCardProps } from "../PassengerCard.types";

const empty: PassengerFormValues = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  nationality: "",
  passportNo: "",
  passportCountry: "",
  passportExpiry: "",
};

const onChange = vi.fn();
const onBlur = vi.fn();

function renderCard(overrides: Partial<PassengerCardProps> = {}) {
  const props: PassengerCardProps = {
    index: 0,
    slot: { type: "adult", number: 1 },
    values: empty,
    gender: null,
    errors: {},
    showPassport: false,
    hasSavedPassport: false,
    onChange,
    onBlur,
    ...overrides,
  };
  return render(<PassengerCard {...props} />);
}

describe("PassengerCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["adult", 1, "ผู้ใหญ่ 1", "อายุ 12 ปีขึ้นไป"],
    ["adult", 2, "ผู้ใหญ่ 2", "อายุ 12 ปีขึ้นไป"],
    ["child", 1, "เด็ก 1", "2–11 ปี"],
    ["infant", 1, "ทารก 1", "ต่ำกว่า 2 ปี"],
  ] as const)(
    "UI-PX-01: When rendering %s %i, should show the title %s and the age hint",
    (type, number, title, hint) => {
      renderCard({ slot: { type, number } });
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(hint)).toBeInTheDocument();
    },
  );

  it("UI-PX-02: When a field has an error, should show it under the field with aria-invalid and keep the label", () => {
    const errors: FormErrors = {
      "passengers.0.firstName": "ใช้ตัวอักษร A–Z ตามพาสปอร์ต",
    };
    renderCard({ errors });
    const input = screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const message = screen.getByText("ใช้ตัวอักษร A–Z ตามพาสปอร์ต");
    expect(input).toHaveAttribute("aria-describedby", message.id);
    expect(screen.getByText("ชื่อ (ภาษาอังกฤษ)")).toBeVisible();
  });

  it("UI-PX-03: When the first name has Thai letters and blurs, should ask the parent to validate that field", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.type(screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)"), "ก");
    await user.tab();
    expect(onChange).toHaveBeenCalledWith("firstName", "ก");
    expect(onBlur).toHaveBeenCalledWith("firstName");
  });

  it("UI-PX-09: When the title Select opens for an adult, should list Mr, Mrs, Ms, Miss only", () => {
    renderCard();
    const select = screen.getByLabelText("คำนำหน้า");
    const options = within(select)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(options).toEqual(["เลือกคำนำหน้า", "Mr", "Mrs", "Ms", "Miss"]);
  });

  it.each(["child", "infant"] as const)(
    "UI-PX-09: When the passenger is a %s, should list Mstr and Miss only",
    (type) => {
      renderCard({ slot: { type, number: 1 } });
      const options = within(screen.getByLabelText("คำนำหน้า"))
        .getAllByRole("option")
        .map((o) => o.textContent);
      expect(options).toEqual(["เลือกคำนำหน้า", "Mstr", "Miss"]);
    },
  );

  it("UI-PX-09: When a title is chosen, should send it and show the gender it sets", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [values, setValues] = useState(empty);
      return (
        <PassengerCard
          index={0}
          slot={{ type: "adult", number: 1 }}
          values={values}
          gender={values.title === "Mrs" ? "F" : null}
          errors={{}}
          showPassport={false}
          hasSavedPassport={false}
          onChange={(field, value) => setValues({ ...values, [field]: value })}
          onBlur={onBlur}
        />
      );
    }
    render(<Harness />);
    expect(screen.queryByText(/เพศ/)).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("คำนำหน้า"), "Mrs");
    expect(screen.getByText("เพศ: หญิง")).toBeInTheDocument();
  });

  it("UI-PX-04: When the trip is domestic, should hide the passport fields", () => {
    renderCard({ showPassport: false });
    expect(screen.queryByLabelText("เลขที่พาสปอร์ต")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("วันหมดอายุพาสปอร์ต"),
    ).not.toBeInTheDocument();
  });

  it("UI-PX-04: When the trip is international, should show the passport fields", () => {
    renderCard({ showPassport: true });
    expect(screen.getByLabelText("เลขที่พาสปอร์ต")).toBeInTheDocument();
    expect(screen.getByLabelText("ประเทศที่ออกพาสปอร์ต")).toBeInTheDocument();
    expect(screen.getByLabelText("วันหมดอายุพาสปอร์ต")).toBeInTheDocument();
  });

  it("UI-PX-08: When a passport number was saved earlier, should ask to type it again", () => {
    renderCard({ showPassport: true, hasSavedPassport: true });
    expect(
      screen.getByText(
        "เคยบันทึกเลขพาสปอร์ตไว้แล้ว กรุณากรอกอีกครั้งเพื่อยืนยัน",
      ),
    ).toBeInTheDocument();
  });
});
