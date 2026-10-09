import { getSessionId } from "./guestSession";

export interface ApiErrorFields {
  [field: string]: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: ApiErrorFields;
  /** The parsed JSON error response, for codes that carry extra data (e.g. `SEARCH_EXPIRED`). */
  readonly body?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: ApiErrorFields,
    body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.body = body;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** `true` generates an `Idempotency-Key`; a string uses that key (reuse it when retrying). */
  idempotent?: boolean | string;
  signal?: AbortSignal;
}

export interface ApiClientConfig {
  baseUrl: string;
  fetchFn?: typeof fetch;
  getSessionId?: () => string;
}

interface ErrorBody {
  error?: { code?: string; message?: string; fields?: ApiErrorFields };
}

export function createApiClient(config: ApiClientConfig) {
  const fetchFn =
    config.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const sessionId = config.getSessionId ?? getSessionId;

  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = { "X-Session-Id": sessionId() };
    if (options.body !== undefined)
      headers["Content-Type"] = "application/json";
    if (options.idempotent) {
      headers["Idempotency-Key"] =
        typeof options.idempotent === "string"
          ? options.idempotent
          : crypto.randomUUID();
    }

    let response: Response;
    try {
      response = await fetchFn(`${config.baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      });
    } catch (cause) {
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        cause instanceof Error ? cause.message : "Network error",
      );
    }

    if (!response.ok) throw await toApiError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  return { request };
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  return new ApiError(
    response.status,
    body.error?.code ?? "UNKNOWN_ERROR",
    body.error?.message ?? response.statusText,
    body.error?.fields,
    body,
  );
}

export const apiClient = createApiClient({
  baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/v1`,
});
