const STORAGE_KEY = "bindee.sessionId";

let memorySessionId: string | undefined;

/**
 * Guest session id: created on first use, kept in localStorage (memory if storage is blocked).
 * It only groups requests; it is not a credential and there is no login.
 */
export function getSessionId(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    memorySessionId ??= crypto.randomUUID();
    return memorySessionId;
  }
}

export function resetSessionForTests(): void {
  memorySessionId = undefined;
}
