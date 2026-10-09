import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("UI-PX-09: When the title Select opens for an adult, should list Mr, Mrs, Ms, Miss only", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
    const options = (await screen.findAllByRole("option")).map(
      (o) => o.textContent,
    );
    expect(options).toEqual(["เลือกคำนำหน้า", "Mr", "Mrs", "Ms", "Miss"]);
  });

  it.each(["child", "infant"] as const)(
    "UI-PX-09: When the passenger is a %s, should list Mstr and Miss only",
    async (type) => {
      const user = userEvent.setup();
      renderCard({ slot: { type, number: 1 } });
      await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
      const options = (await screen.findAllByRole("option")).map(
        (o) => o.textContent,
      );
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
    await user.click(screen.getByRole("combobox", { name: "คำนำหน้า" }));
    await user.click(await screen.findByRole("option", { name: "Mrs" }));
    expect(screen.getByText("เพศ: หญิง")).toBeInTheDocument();
  });

  it("UI-PX-02: When the date of birth has an error, should show it under the field with aria-invalid", () => {
    renderCard({
      errors: { "passengers.0.dob": "วันเกิดไม่ถูกต้อง" },
    });
    const trigger = screen.getByRole("button", { name: /วันเกิด/ });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("วันเกิดไม่ถูกต้อง");
  });

  it("When the date of birth is empty, should show the วว/ดด/ปปปป placeholder instead of a native date input", () => {
    renderCard();
    expect(screen.getByRole("button", { name: /วันเกิด/ })).toHaveTextContent(
      "วว/ดด/ปปปป",
    );
    expect(document.querySelector('input[type="date"]')).toBeNull();
  });

  it("When a date of birth is picked, should send it as YYYY-MM-DD", async () => {
    const user = userEvent.setup();
    renderCard({ values: { ...empty, dob: "1990-05-01" } });
    expect(screen.getByRole("button", { name: /วันเกิด/ })).toHaveTextContent(
      "01/05/1990",
    );
    await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
    const grid = await screen.findByRole("grid");
    await user.click(
      within(grid).getByRole("button", { name: /ที่ 15 พฤษภาคม 1990/ }),
    );
    expect(onChange).toHaveBeenCalledWith("dob", "1990-05-15");
    expect(onBlur).toHaveBeenCalledWith("dob");
  });

  describe("when picking dates around 15 Oct 2026", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 9, 15) });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("When the date of birth calendar is open, should not allow future days", async () => {
      const user = userEvent.setup();
      renderCard();
      await user.click(screen.getByRole("button", { name: /วันเกิด/ }));
      const grid = await screen.findByRole("grid");
      expect(
        within(grid).getByRole("button", { name: /ที่ 15 ตุลาคม 2026/ }),
      ).toBeEnabled();
      expect(
        within(grid).getByRole("button", { name: /ที่ 16 ตุลาคม 2026/ }),
      ).toBeDisabled();
    });

    it("UI-PX-04: When international, should offer only today and later for the passport expiry", async () => {
      const user = userEvent.setup();
      renderCard({ showPassport: true });
      await user.click(
        screen.getByRole("button", { name: /วันหมดอายุพาสปอร์ต/ }),
      );
      const grid = await screen.findByRole("grid");
      expect(
        within(grid).getByRole("button", { name: /ที่ 14 ตุลาคม 2026/ }),
      ).toBeDisabled();
      expect(
        within(grid).getByRole("button", { name: /ที่ 15 ตุลาคม 2026/ }),
      ).toBeEnabled();
    });
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
