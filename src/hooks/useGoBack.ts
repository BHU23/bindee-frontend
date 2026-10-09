import { useLocation, useNavigate, type To } from "react-router";

/**
 * Back button of a booking step. Pops the history when the guest came from another page of the app,
 * so back never loops between two steps. A page opened directly (no history) goes to `fallback` instead.
 */
export function useGoBack(fallback: To, fallbackState?: unknown): () => void {
  const navigate = useNavigate();
  // React Router gives only the first entry of a session the key "default".
  const hasPreviousPage = useLocation().key !== "default";

  return () => {
    if (hasPreviousPage) {
      void navigate(-1);
      return;
    }
    void navigate(fallback, { replace: true, state: fallbackState });
  };
}
