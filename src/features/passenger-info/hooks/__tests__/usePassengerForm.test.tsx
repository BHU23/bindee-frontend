import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/apiClient";
import {
  emptySaved,
  flowFixture,
  roundTripFlow,
  savedFixture,
  singleAdultFlow,
} from "../../__fixtures__/passengerInfo";
import * as api from "../../api/passengerApi";
import type { PassengerFlowState } from "../../types/passengerInfo";
import { usePassengerForm } from "../usePassengerForm";

vi.mock("../../api/passengerApi");

async function setup(flow: PassengerFlowState = singleAdultFlow) {
  const hook = renderHook(() => usePassengerForm(flow));
  await waitFor(() => expect(hook.result.current.isRestoring).toBe(false));
  return hook;
}

function fillValid(result: { current: ReturnType<typeof usePassengerForm> }) {
  act(() => {
    result.current.setPassengerField(0, "title", "Mr");
    result.current.setPassengerField(0, "firstName", "Somchai");
    result.current.setPassengerField(0, "lastName", "Jaidee");
    result.current.setPassengerField(0, "dob", "1990-05-01");
    result.current.setPassengerField(0, "nationality", "TH");
    result.current.setContactField("name", "Somchai Jaidee");
    result.current.setContactField("email", "som@example.com");
    result.current.setContactField("phoneNumber", "0812345678");
    result.current.setPrivacy(true);
  });
}

describe("usePassengerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getPassengers).mockResolvedValue(emptySaved);
    vi.mocked(api.savePassengers).mockResolvedValue(emptySaved);
  });

  it("UI-PX-01: When built from the search counts, should create one empty form per passenger", async () => {
    const { result } = await setup(flowFixture);
    expect(result.current.slots.map((s) => s.type)).toEqual([
      "adult",
      "adult",
      "child",
      "infant",
    ]);
    expect(result.current.passengers).toHaveLength(4);
  });

  it("UI-PX-05: When opened, should leave both consents unticked", async () => {
    const { result } = await setup();
    expect(result.current.consent).toEqual({
      privacy: false,
      marketing: false,
    });
  });

  it("UI-PX-06: When opened, should default the phone code to +66", async () => {
    const { result } = await setup();
    expect(result.current.contact.phoneCode).toBe("+66");
  });

  it("UI-PX-08: When a draft has saved values, should restore them and keep the passport empty", async () => {
    vi.mocked(api.getPassengers).mockResolvedValue({
      ...savedFixture,
      passengers: [{ ...savedFixture.passengers[0], hasPassport: true }],
    });
    const { result } = await setup();
    expect(api.getPassengers).toHaveBeenCalledWith("d1", expect.anything());
    expect(result.current.passengers[0]).toMatchObject({
      title: "Mr",
      firstName: "SOMCHAI",
      lastName: "JAIDEE",
      dob: "1990-05-01",
      nationality: "TH",
      passportNo: "",
    });
    expect(result.current.hasSavedPassport[0]).toBe(true);
    expect(result.current.contact).toEqual({
      name: "Somchai Jaidee",
      email: "som@example.com",
      phoneCode: "+66",
      phoneNumber: "812345678",
    });
    expect(result.current.consent).toEqual({ privacy: true, marketing: false });
  });

  it("UI-PX-08: When the saved passenger list does not match the search, should ignore it", async () => {
    vi.mocked(api.getPassengers).mockResolvedValue(savedFixture);
    const { result } = await setup(flowFixture);
    expect(result.current.passengers[0].firstName).toBe("");
  });

  it("UI-PX-08: When restoring fails, should still show an empty form", async () => {
    vi.mocked(api.getPassengers).mockRejectedValue(new Error("boom"));
    const { result } = await setup();
    expect(result.current.isRestoring).toBe(false);
    expect(result.current.passengers[0].firstName).toBe("");
  });

  it("UI-PX-08: When restored values include only passengers, should leave contact and consent defaults", async () => {
    vi.mocked(api.getPassengers).mockResolvedValue({
      passengers: savedFixture.passengers,
    });
    const { result } = await setup();
    expect(result.current.passengers[0].firstName).toBe("SOMCHAI");
    expect(result.current.contact.email).toBe("");
    expect(result.current.consent.privacy).toBe(false);
  });

  it("UI-PX-03: When a name field with Thai letters blurs, should set the A-Z message on that field", async () => {
    const { result } = await setup();
    act(() => result.current.setPassengerField(0, "firstName", "สมชาย"));
    act(() => result.current.blurPassengerField(0, "firstName"));
    expect(result.current.errors["passengers.0.firstName"]).toBe(
      "ใช้ตัวอักษร A–Z ตามพาสปอร์ต",
    );
  });

  it("UI-PX-02: When the faulty value is corrected, should clear the error on change", async () => {
    const { result } = await setup();
    act(() => result.current.setPassengerField(0, "firstName", "สมชาย"));
    act(() => result.current.blurPassengerField(0, "firstName"));
    act(() => result.current.setPassengerField(0, "firstName", "Somchai"));
    expect(result.current.errors["passengers.0.firstName"]).toBeUndefined();
  });

  it("UI-PX-09: When choosing a title, should set the gender from it", async () => {
    const { result } = await setup();
    act(() => result.current.setPassengerField(0, "title", "Mrs"));
    expect(result.current.genders[0]).toBe("F");
    act(() => result.current.setPassengerField(0, "title", "Mr"));
    expect(result.current.genders[0]).toBe("M");
  });

  it("UI-PX-06: When the email is wrong and blurs, should flag it; when valid, should clear it", async () => {
    const { result } = await setup();
    act(() => result.current.setContactField("email", "abc"));
    act(() => result.current.blurContactField("email"));
    expect(result.current.errors["contact.email"]).toBe(
      "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com",
    );
    act(() => result.current.setContactField("email", "a@b.co"));
    expect(result.current.errors["contact.email"]).toBeUndefined();
  });

  it("UI-PX-05: When submitting without the privacy consent, should not call the API and should flag the checkbox", async () => {
    const { result } = await setup();
    fillValid(result);
    act(() => result.current.setPrivacy(false));
    let saved = true;
    await act(async () => {
      saved = await result.current.submit();
    });
    expect(saved).toBe(false);
    expect(api.savePassengers).not.toHaveBeenCalled();
    expect(result.current.errors["consent.privacy"]).toBe(
      "กรุณายอมรับนโยบายความเป็นส่วนตัวเพื่อไปต่อ",
    );
  });

  it("UI-PX-05: When ticking the privacy consent after the flag, should clear it", async () => {
    const { result } = await setup();
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors["consent.privacy"]).toBeDefined();
    act(() => result.current.setPrivacy(true));
    expect(result.current.errors["consent.privacy"]).toBeUndefined();
  });

  it("When submitting with invalid fields, should flag every one and not call the API", async () => {
    const { result } = await setup();
    await act(async () => {
      await result.current.submit();
    });
    expect(Object.keys(result.current.errors)).toEqual(
      expect.arrayContaining([
        "passengers.0.title",
        "passengers.0.firstName",
        "passengers.0.lastName",
        "passengers.0.dob",
        "passengers.0.nationality",
        "contact.name",
        "contact.email",
        "contact.phoneNumber",
        "consent.privacy",
      ]),
    );
    expect(api.savePassengers).not.toHaveBeenCalled();
  });

  it("When submitting valid data on a domestic trip, should PUT without passport fields", async () => {
    const { result } = await setup();
    fillValid(result);
    let saved = false;
    await act(async () => {
      saved = await result.current.submit();
    });
    expect(saved).toBe(true);
    expect(result.current.isSaved).toBe(true);
    expect(api.savePassengers).toHaveBeenCalledWith("d1", {
      passengers: [
        {
          type: "adult",
          title: "Mr",
          firstName: "Somchai",
          lastName: "Jaidee",
          dob: "1990-05-01",
          gender: "M",
          nationality: "TH",
        },
      ],
      contact: {
        name: "Somchai Jaidee",
        email: "som@example.com",
        phone: "+66812345678",
      },
      consent: { privacy: true, marketing: false },
    });
  });

  it("UI-PX-04: When the flow is international, should require and send passport fields", async () => {
    const { result } = await setup({ ...singleAdultFlow, international: true });
    fillValid(result);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors["passengers.0.passportNo"]).toBeDefined();
    expect(api.savePassengers).not.toHaveBeenCalled();
    act(() => {
      result.current.setPassengerField(0, "passportNo", "AA123456");
      result.current.setPassengerField(0, "passportCountry", "TH");
      result.current.setPassengerField(0, "passportExpiry", "2031-01-01");
      result.current.setPassengerField(0, "middleName", "Mid");
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(
      vi.mocked(api.savePassengers).mock.calls[0][1].passengers[0],
    ).toMatchObject({
      passportNo: "AA123456",
      passportCountry: "TH",
      passportExpiry: "2031-01-01",
      middleName: "Mid",
    });
  });

  it("When infants are present, should link each infant to an adult by index", async () => {
    const { result } = await setup(flowFixture);
    expect(result.current.slots).toHaveLength(4);
    act(() => {
      [0, 1, 2, 3].forEach((i) => {
        const type = result.current.slots[i].type;
        result.current.setPassengerField(
          i,
          "title",
          type === "adult" ? "Mr" : "Mstr",
        );
        result.current.setPassengerField(i, "firstName", "Ann");
        result.current.setPassengerField(i, "lastName", "Lee");
        result.current.setPassengerField(
          i,
          "dob",
          { adult: "1990-01-01", child: "2020-01-01", infant: "2026-01-01" }[
            type
          ],
        );
        result.current.setPassengerField(i, "nationality", "TH");
      });
      result.current.setContactField("name", "Ann");
      result.current.setContactField("email", "a@b.co");
      result.current.setContactField("phoneNumber", "812345678");
      result.current.setPrivacy(true);
      result.current.setMarketing(true);
    });
    await act(async () => {
      await result.current.submit();
    });
    const body = vi.mocked(api.savePassengers).mock.calls[0][1];
    expect(body.passengers.map((p) => p.infantOfPaxIndex)).toEqual([
      undefined,
      undefined,
      undefined,
      0,
    ]);
    expect(body.consent.marketing).toBe(true);
  });

  it("When the server returns field errors, should show them under those fields and keep typed data", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "invalid", {
        "passengers.0.firstName": "bad",
        "contact.email": "bad",
      }),
    );
    const { result } = await setup();
    fillValid(result);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors["passengers.0.firstName"]).toBe(
      "ข้อมูลช่องนี้ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    );
    expect(result.current.errors["contact.email"]).toBeDefined();
    expect(result.current.submitError).toBe(
      "ข้อมูลบางช่องไม่ถูกต้อง กรุณาตรวจสอบช่องที่มีข้อความสีแดง",
    );
    expect(result.current.passengers[0].firstName).toBe("Somchai");
    expect(result.current.isSaved).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it.each([
    [
      "PAX_TYPE_AGE_MISMATCH",
      "วันเกิดไม่ตรงกับประเภทผู้โดยสาร (อายุ 12 ปีขึ้นไป) กรุณาตรวจสอบวันเกิด",
    ],
    [
      "TITLE_NOT_ALLOWED_FOR_TYPE",
      "คำนำหน้านี้ใช้กับผู้โดยสารประเภทนี้ไม่ได้ กรุณาเลือกใหม่",
    ],
    ["TITLE_GENDER_MISMATCH", "คำนำหน้าไม่ตรงกับเพศ กรุณาเลือกคำนำหน้าใหม่"],
  ])(
    "When the server returns %s on a field, should show its Thai message there",
    async (code, message) => {
      vi.mocked(api.savePassengers).mockRejectedValue(
        new ApiError(400, code, "x", { "passengers.0.dob": "x" }),
      );
      const { result } = await setup();
      fillValid(result);
      await act(async () => {
        await result.current.submit();
      });
      expect(result.current.errors["passengers.0.dob"]).toBe(message);
    },
  );

  it("When the server rejects with a pax-rule code but no fields, should show the general invalid message", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(
      new ApiError(400, "PAX_TYPE_AGE_MISMATCH", "x"),
    );
    const { result } = await setup();
    fillValid(result);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.submitError).toBe(
      "ข้อมูลบางช่องไม่ถูกต้อง กรุณาตรวจสอบช่องที่มีข้อความสีแดง",
    );
  });

  it("When the search expired, should show the expired message", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(
      new ApiError(410, "SEARCH_EXPIRED", "x"),
    );
    const { result } = await setup();
    fillValid(result);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.submitError).toBe(
      "ผลการค้นหาหมดอายุแล้ว กรุณาค้นหาเที่ยวบินใหม่",
    );
  });

  it("When saving fails on the network, should keep the typed data and show a retry message", async () => {
    vi.mocked(api.savePassengers).mockRejectedValue(new Error("down"));
    const { result } = await setup();
    fillValid(result);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.submitError).toBe(
      "บันทึกไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ กรุณาลองอีกครั้ง",
    );
    expect(result.current.passengers[0].firstName).toBe("Somchai");
  });

  it("UI-PX-07: When the flow has outbound and return, should total both legs", async () => {
    const { result } = await setup(roundTripFlow);
    expect(result.current.total).toBe(2990);
  });

  it("UI-PX-07: When the flow is one-way, should total the outbound only", async () => {
    const { result } = await setup(flowFixture);
    expect(result.current.total).toBe(9000);
  });
});
