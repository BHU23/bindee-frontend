import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncResource } from "../useAsyncResource";

describe("useAsyncResource", () => {
  it("When the load resolves, should expose data with success status", async () => {
    const load = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useAsyncResource(load));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toBe("ok");
    expect(result.current.error).toBeNull();
  });

  it("When the load rejects, should expose the error; reload should load again", async () => {
    const failure = new Error("boom");
    const load = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce("ok");
    const { result } = renderHook(() => useAsyncResource(load));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe(failure);
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.error).toBeNull();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("When deps change, should reload, keep the previous data while loading and abort the old request", async () => {
    const signals: AbortSignal[] = [];
    const load = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      return Promise.resolve(`r${signals.length}`);
    });
    const { result, rerender } = renderHook(
      ({ id }) => useAsyncResource(load, [id]),
      { initialProps: { id: "a" } },
    );
    await waitFor(() => expect(result.current.data).toBe("r1"));
    rerender({ id: "b" });
    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBe("r1");
    expect(signals[0]?.aborted).toBe(true);
    await waitFor(() => expect(result.current.data).toBe("r2"));
  });

  it("When unmounted before the load settles, should ignore the late result", async () => {
    const pending: { resolve?: (value: string) => void } = {};
    function load() {
      return new Promise<string>((done) => (pending.resolve = done));
    }
    const { result, unmount } = renderHook(() => useAsyncResource(load));
    unmount();
    await act(async () => pending.resolve?.("late"));
    expect(result.current.data).toBeNull();
  });
});
