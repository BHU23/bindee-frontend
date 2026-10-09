import { useCallback, useEffect, useState } from "react";

export type ResourceStatus = "loading" | "success" | "error";

export interface UseAsyncResourceReturn<T> {
  data: T | null;
  status: ResourceStatus;
  /** The rejection of the last failed load; `null` otherwise. */
  error: unknown;
  reload: () => void;
}

/**
 * Loads on mount, again on `reload` and whenever a value in `deps` changes; aborts the
 * in-flight request on unmount or before the next load. The previous `data` is kept while
 * loading so callers can keep showing what does not depend on the changed input.
 */
export function useAsyncResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = [],
): UseAsyncResourceReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    load(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setError(null);
        setStatus("success");
      },
      (failure: unknown) => {
        if (controller.signal.aborted) return;
        setError(failure);
        setStatus("error");
      },
    );
    return () => controller.abort();
    // `load` is a module-level api function: the effect re-runs only on reload or `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, status, error, reload };
}
