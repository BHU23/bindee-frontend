import { createBrowserRouter, type RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { FlightResultsPage } from "@/features/flight-results";
import { HomePage } from "@/features/home-search";
import { RESULTS_PATH } from "@/lib/routes";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Feature routes are composed here at app level (features never import each other). */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: RESULTS_PATH, element: <FlightResultsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
