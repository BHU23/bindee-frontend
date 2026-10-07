import { useCallback, useEffect, useState } from "react";

export type ResourceStatus = "loading" | "success" | "error";

export interface UseAsyncResourceReturn<T> {
  data: T | null;
  status: ResourceStatus;
  reload: () => void;
}

/** Loads once on mount and again on `reload`; aborts the request on unmount. */
export function useAsyncResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
): UseAsyncResourceReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    load(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setStatus("success");
      },
      () => {
        if (controller.signal.aborted) return;
        setStatus("error");
      },
    );
    return () => controller.abort();
    // `load` is a module-level api function: the effect should only re-run on reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, status, reload };
}
