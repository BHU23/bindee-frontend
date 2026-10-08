import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivacyPolicy } from "../PrivacyPolicy";

describe("PrivacyPolicy", () => {
  it("UI-PX-10: When rendered, should cover data, purpose, retention, rights and contact", () => {
    render(<PrivacyPolicy />);
    for (const heading of [
      "ข้อมูลที่เก็บ",
      "วัตถุประสงค์",
      "ระยะเวลาเก็บข้อมูล",
      "สิทธิของเจ้าของข้อมูล",
      "ติดต่อเรา",
    ]) {
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("support@bindee.mock")).toBeInTheDocument();
  });
});
