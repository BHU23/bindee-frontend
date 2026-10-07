import { createBrowserRouter, type RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home-search";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Feature routes are composed here at app level (features never import each other). */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
