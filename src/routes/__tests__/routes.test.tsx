import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { appRoutes, createAppRouter } from "..";

describe("app routes", () => {
  it("When the path is unknown, should render the shell with the Thai not-found page", () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/nowhere"],
    });
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "ไม่พบหน้าที่ต้องการ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับหน้าแรก" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("UI-FND-06: When the shell renders, should show no language toggle", () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    expect(
      screen.queryByRole("button", { name: /EN|English|ภาษา/ }),
    ).not.toBeInTheDocument();
  });

  it("When creating the browser router, should build a router from the same routes", () => {
    const router = createAppRouter();
    expect(router.routes).toHaveLength(appRoutes.length);
    router.dispose();
  });
});
