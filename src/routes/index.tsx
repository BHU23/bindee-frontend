import { createBrowserRouter, type RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Feature routes are composed here at app level (features never import each other). */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [{ path: "*", element: <NotFoundPage /> }],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
