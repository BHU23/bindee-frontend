import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PASSENGERS_PATH, RESULTS_PATH, REVIEW_PATH } from "@/lib/routes";
import { ApiError } from "@/services/apiClient";
import {
  emptySaved,
  flowFixture,
  roundTripFlow,
  singleAdultFlow,
} from "../../__fixtures__/passengerInfo";
import * as api from "../../api/passengerApi";
import { PassengersPage } from "../PassengersPage";

vi.mock("../../api/passengerApi");

function renderPage(state: unknown = singleAdultFlow) {
  const router = createMemoryRouter(
    [
      { path: PASSENGERS_PATH, element: <PassengersPage /> },
      { path: RESULTS_PATH, element: <p>results page</p> },
      { path: REVIEW_PATH, element: <p>review page</p> },
      { path: "/", element: <p>home page</p> },
    ],
    { initialEntries: [{ pathname: PASSENGERS_PATH, state }] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

async function fillAdult(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(await screen.findByLabelText("คำนำหน้า"), "Mr");
  await user.type(screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)"), "Somchai");
  await user.type(screen.getByLabelText("นามสกุล (ภาษาอังกฤษ)"), "Jaidee");
  await user.type(screen.getByLabelText("วันเกิด"), "1990-05-01");
  await user.selectOptions(screen.getByLabelText("สัญชาติ"), "TH");
  await user.type(screen.getByLabelText("ชื่อผู้ติดต่อ"), "Somchai Jaidee");
  await user.type(screen.getByLabelText("อีเมล"), "som@example.com");
  await user.type(screen.getByLabelText("เบอร์โทรศัพท์"), "0812345678");
}

describe("PassengersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getPassengers).mockResolvedValue(emptySaved);
    vi.mocked(api.savePassengers).mockResolvedValue(emptySaved);
  });

  it("When there is no flow state, should redirect to the home page", async () => {
    renderPage(null);
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(api.getPassengers).not.toHaveBeenCalled();
  });

  it("When the flow state is not an object, should redirect to the home page", async () => {
    renderPage("oops");
    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("When loading the saved values, should show a status first", () => {
    vi.mocked(api.getPassengers).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole("status")).toHaveTextContent(
      "กำลังโหลดข้อมูลที่บันทึกไว้",
    );
  });

  it("UI-PX-01: When the search has 2 adults, 1 child and 1 infant, should show 4 cards with their titles and hints", async () => {
    renderPage(flowFixture);
    expect(
      await screen.findByRole("heading", { name: "ผู้ใหญ่ 1" }),
    ).toBeInTheDocument();
    for (const title of ["ผู้ใหญ่ 2", "เด็ก 1", "ทารก 1"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(
      document.querySelectorAll('[data-slot="passenger-card"]'),
    ).toHaveLength(4);
    expect(screen.getAllByText("อายุ 12 ปีขึ้นไป")).toHaveLength(2);
    expect(screen.getByText("2–11 ปี")).toBeInTheDocument();
    expect(screen.getByText("ต่ำกว่า 2 ปี")).toBeInTheDocument();
    expect(
      screen.getByText("ผู้โดยสาร", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("UI-PX-03: When a first name with Thai letters loses focus, should show the A-Z message under it", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(await screen.findByLabelText("ชื่อ (ภาษาอังกฤษ)"), "สมชาย");
    await user.tab();
    expect(
      await screen.findByText("ใช้ตัวอักษร A–Z ตามพาสปอร์ต"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("UI-PX-04: When the flow carries no international flag, should hide the passport fields", async () => {
    renderPage();
    await screen.findByLabelText("คำนำหน้า");
    expect(screen.queryByLabelText("เลขที่พาสปอร์ต")).not.toBeInTheDocument();
  });

  it("UI-PX-04: When the flow is international, should show passport fields and require them", async () => {
    const user = userEvent.setup();
    renderPage({ ...singleAdultFlow, international: true });
    expect(await screen.findByLabelText("เลขที่พาสปอร์ต")).toBeInTheDocument();
    await fillAdult(user);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));
    expect(screen.getByLabelText("เลขที่พาสปอร์ต")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(api.savePassengers).not.toHaveBeenCalled();
  });

  it("UI-PX-05: When pressing ไปต่อ without the privacy consent, should block and flag the checkbox", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillAdult(user);
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้าต้องการรับข่าวสาร/ }),
    ).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));
    expect(api.savePassengers).not.toHaveBeenCalled();
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }),
    ).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("กรุณายอมรับนโยบายความเป็นส่วนตัวเพื่อไปต่อ"),
    ).toBeInTheDocument();
  });

  it("UI-PX-06: When the email format is wrong and loses focus, should show the email message; phone shows +66", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByLabelText("รหัสประเทศ")).toHaveValue("+66");
    await user.type(screen.getByLabelText("อีเมล"), "abc");
    await user.tab();
    expect(
      screen.getByText("กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"),
    ).toBeInTheDocument();
  });

  it("UI-PX-07: When a round trip is shown, should total both legs in the footer", async () => {
    renderPage(roundTripFlow);
    expect(await screen.findByLabelText("ยอดรวมทุกท่าน")).toHaveTextContent(
      "฿2,990",
    );
  });

  it("UI-PX-08: When the draft has saved values, should show them in the fields", async () => {
    vi.mocked(api.getPassengers).mockResolvedValue({
      passengers: [
        {
          type: "adult",
          title: "Mr",
          firstName: "SOMCHAI",
          lastName: "JAIDEE",
          dob: "1990-05-01",
          gender: "M",
          nationality: "TH",
          hasPassport: false,
        },
      ],
      contact: { name: "Som", email: "som@example.com", phone: "+66812345678" },
      consent: { privacy: true, marketing: true },
    });
    renderPage();
    expect(await screen.findByDisplayValue("SOMCHAI")).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toHaveValue("som@example.com");
    expect(screen.getByLabelText("เบอร์โทรศัพท์")).toHaveValue("812345678");
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }),
    ).toBeChecked();
  });

  it("UI-PX-10: When opening the policy and closing it, should keep typed values and the checkbox", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillAdult(user);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(
      screen.getByRole("button", { name: "นโยบายความเป็นส่วนตัว" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "นโยบายความเป็นส่วนตัว" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ปิด" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)")).toHaveValue("Somchai");
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }),
    ).toBeChecked();
  });

  it("When all data is valid and consent is given, should save once and go to the review with the passengers", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await fillAdult(user);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));
    expect(await screen.findByText("review page")).toBeInTheDocument();
    expect(api.savePassengers).toHaveBeenCalledTimes(1);
    expect(vi.mocked(api.savePassengers).mock.calls[0][0]).toBe("d1");
    expect(router.state.location.pathname).toBe(REVIEW_PATH);
    expect(router.state.location.state).toMatchObject({
      draftId: "d1",
      searchId: "s1",
      passengers: [
        {
          type: "adult",
          title: "Mr",
          firstName: "Somchai",
          lastName: "Jaidee",
        },
      ],
    });
  });

  it("When saving fails, should stay on the page and not navigate", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(new Error("down"));
    const user = userEvent.setup();
    const router = renderPage();
    await fillAdult(user);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(PASSENGERS_PATH);
  });

  it("When the server rejects a field, should show it under the field and keep typed values", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(
      new ApiError(400, "PAX_TYPE_AGE_MISMATCH", "x", {
        "passengers.0.dob": "x",
      }),
    );
    const user = userEvent.setup();
    renderPage();
    await fillAdult(user);
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(screen.getByRole("button", { name: "ไปต่อ" }));
    expect(
      await screen.findByText(
        "วันเกิดไม่ตรงกับประเภทผู้โดยสาร (อายุ 12 ปีขึ้นไป) กรุณาตรวจสอบวันเกิด",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "ข้อมูลบางช่องไม่ถูกต้อง",
    );
    expect(screen.getByLabelText("ชื่อ (ภาษาอังกฤษ)")).toHaveValue("Somchai");
  });

  it("When tapping back, should return to the results of the same search", async () => {
    const user = userEvent.setup();
    const router = renderPage();
    await user.click(await screen.findByRole("button", { name: "ย้อนกลับ" }));
    expect(await screen.findByText("results page")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?searchId=s1");
  });
});
