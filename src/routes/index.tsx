import { createBrowserRouter, type RouteObject } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ReturnFlightsPage } from "@/features/fare-selection";
import { FlightResultsPage } from "@/features/flight-results";
import { HomePage } from "@/features/home-search";
import { PassengersPage, PrivacyPage } from "@/features/passenger-info";
import {
  PASSENGERS_PATH,
  PRIVACY_PATH,
  RESULTS_PATH,
  RETURN_FLIGHTS_PATH,
} from "@/lib/routes";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Feature routes are composed here at app level (features never import each other). */
export const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: RESULTS_PATH, element: <FlightResultsPage /> },
      { path: RETURN_FLIGHTS_PATH, element: <ReturnFlightsPage /> },
      { path: PASSENGERS_PATH, element: <PassengersPage /> },
      { path: PRIVACY_PATH, element: <PrivacyPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
