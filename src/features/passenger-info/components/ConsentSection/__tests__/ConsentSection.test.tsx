import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentSection } from "../ConsentSection";

const onPrivacyChange = vi.fn();
const onMarketingChange = vi.fn();

function renderSection(
  consent = { privacy: false, marketing: false },
  privacyError?: string,
) {
  return render(
    <ConsentSection
      consent={consent}
      privacyError={privacyError}
      onPrivacyChange={onPrivacyChange}
      onMarketingChange={onMarketingChange}
    />,
  );
}

describe("ConsentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UI-PX-05: When rendered, should leave the marketing checkbox unticked", () => {
    renderSection();
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้าต้องการรับข่าวสาร/ }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }),
    ).not.toBeChecked();
  });

  it("UI-PX-05: When the privacy consent is missing on submit, should flag the checkbox with the message", () => {
    renderSection(
      { privacy: false, marketing: false },
      "กรุณายอมรับนโยบายความเป็นส่วนตัวเพื่อไปต่อ",
    );
    const box = screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("กรุณายอมรับนโยบายความเป็นส่วนตัวเพื่อไปต่อ"),
    ).toBeInTheDocument();
  });

  it("When ticking the boxes, should report each value", async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }));
    await user.click(
      screen.getByRole("checkbox", { name: /ข้าพเจ้าต้องการรับข่าวสาร/ }),
    );
    expect(onPrivacyChange).toHaveBeenCalledWith(true);
    expect(onMarketingChange).toHaveBeenCalledWith(true);
  });

  it("UI-PX-10: When tapping the policy link, should open the policy in a Sheet without changing the checkbox", async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(
      screen.getByRole("button", { name: "นโยบายความเป็นส่วนตัว" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "นโยบายความเป็นส่วนตัว" }),
    ).toBeInTheDocument();
    expect(screen.getByText("support@bindee.mock")).toBeInTheDocument();
    expect(onPrivacyChange).not.toHaveBeenCalled();
  });

  it("UI-PX-10: When the Sheet is closed again, should keep the checkbox state", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [privacy, setPrivacy] = useState(true);
      return (
        <ConsentSection
          consent={{ privacy, marketing: false }}
          onPrivacyChange={setPrivacy}
          onMarketingChange={onMarketingChange}
        />
      );
    }
    render(<Harness />);
    await user.click(
      screen.getByRole("button", { name: "นโยบายความเป็นส่วนตัว" }),
    );
    await user.click(await screen.findByRole("button", { name: "ปิด" }));
    expect(
      screen.getByRole("checkbox", { name: /ข้าพเจ้ายอมรับ/ }),
    ).toBeChecked();
  });
});
