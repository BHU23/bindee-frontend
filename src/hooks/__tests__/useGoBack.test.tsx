import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { useGoBack } from "../useGoBack";

function Page({ name }: { name: string }) {
  const goBack = useGoBack("/fallback", { from: "fallback" });
  const location = useLocation();
  return (
    <div>
      <p>page {name}</p>
      <output aria-label="state">{JSON.stringify(location.state)}</output>
      <button onClick={goBack}>back</button>
    </div>
  );
}

function renderAt(entries: string[], index: number) {
  const router = createMemoryRouter(
    [
      { path: "/a", element: <Page name="a" /> },
      { path: "/b", element: <Page name="b" /> },
      { path: "/fallback", element: <Page name="fallback" /> },
    ],
    { initialEntries: entries, initialIndex: index },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("useGoBack", () => {
  describe("when the guest came from another page of the app", () => {
    it("When pressing back, should pop the history instead of pushing a page (so back never loops)", async () => {
      const user = userEvent.setup();
      const router = renderAt(["/a", "/b"], 1);
      await user.click(screen.getByRole("button", { name: "back" }));
      expect(await screen.findByText("page a")).toBeInTheDocument();
      expect(router.state.historyAction).toBe("POP");
    });
  });

  describe("when the page was opened directly", () => {
    it("When pressing back, should replace it with the fallback page and its state", async () => {
      const user = userEvent.setup();
      const router = renderAt(["/b"], 0);
      await user.click(screen.getByRole("button", { name: "back" }));
      expect(await screen.findByText("page fallback")).toBeInTheDocument();
      expect(screen.getByLabelText("state")).toHaveTextContent("fallback");
      expect(router.state.historyAction).toBe("REPLACE");
    });
  });
});
