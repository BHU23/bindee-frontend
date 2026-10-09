import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { appRoutes, createAppRouter } from "..";

vi.mock("@/features/flight-results/api/flightResultsApi", () => ({
  getFlights: () => new Promise(() => {}),
  createSearch: vi.fn(),
}));

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

  it("When the path is /flights without a searchId, should render inside the shell and send the guest home", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/flights"],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });

  it("When the path is /flights with a searchId, should render the results screen in the shell", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/flights?searchId=s1"],
    });
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "เลือกเที่ยวบิน" }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it("UI-PX-10: When the path is /privacy, should render the static policy in the shell", () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/privacy"],
    });
    render(<RouterProvider router={router} />);
    expect(
      screen.getByRole("heading", { name: "นโยบายความเป็นส่วนตัว" }),
    ).toBeInTheDocument();
    router.dispose();
  });

  it("When the path is /booking/passengers without flow state, should send the guest home", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/booking/passengers"],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    router.dispose();
  });

  it("When the path is /booking/review without flow state, should send the guest home", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/booking/review"],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    router.dispose();
  });

  it("When the path is /booking/payment without flow state, should send the guest home", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/booking/payment"],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    router.dispose();
  });

  it("When the path is /pay/card without flow state, should send the guest home", async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ["/pay/card?paymentId=p1"],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    router.dispose();
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
