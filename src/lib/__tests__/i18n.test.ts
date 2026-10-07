import { describe, expect, it } from "vitest";
import { i18n } from "../i18n";

describe("i18n", () => {
  it("UI-FND-06: When initialised, should serve Thai only with one namespace per feature", () => {
    expect(i18n.language).toBe("th");
    expect(Object.keys(i18n.options.resources ?? {})).toEqual(["th"]);
    expect(i18n.t("close")).toBe("ปิด");
  });

  it("When interpolating, should not escape values", () => {
    expect(i18n.t("counter.increase", { label: "A&B" })).toBe("เพิ่ม A&B");
  });
});
