import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { PRIVACY_PATH } from "@/lib/routes";
import { PrivacyPage } from "../PrivacyPage";

describe("PrivacyPage", () => {
  it("UI-PX-10: When opened at /privacy, should show the static policy and go back", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/", element: <p>previous</p> },
        { path: PRIVACY_PATH, element: <PrivacyPage /> },
      ],
      { initialEntries: ["/", PRIVACY_PATH], initialIndex: 1 },
    );
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "นโยบายความเป็นส่วนตัว" }),
    ).toBeInTheDocument();
    expect(screen.getByText("support@bindee.mock")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
    expect(await screen.findByText("previous")).toBeInTheDocument();
  });
});
