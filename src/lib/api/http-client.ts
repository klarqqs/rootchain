import { getApiBaseUrl } from "./config";
import { clearTokens, getAccessToken, loadTokens, saveTokens } from "./token-storage";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function refreshAccessToken(): Promise<string | null> {
  const base = getApiBaseUrl();
  const stored = loadTokens();
  if (!base || !stored?.refreshToken) return null;

  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: stored.refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const json = (await res.json()) as ApiSuccess<{
    tokens: { accessToken: string; refreshToken: string };
  }>;

  saveTokens({
    accessToken: json.data.tokens.accessToken,
    refreshToken: json.data.tokens.refreshToken,
  });
  return json.data.tokens.accessToken;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; retryOn401?: boolean; retries?: number } = {},
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiRequestError(0, "API_NOT_CONFIGURED", "VITE_API_URL is not set");
  }

  const maxRetries = opts.retries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers = new Headers(init.headers);
      if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
      }

      const useAuth = opts.auth !== false;
      if (useAuth) {
        const token = getAccessToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }

      const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
      let res = await fetch(url, { ...init, headers });

      if (res.status === 401 && useAuth && opts.retryOn401 !== false) {
        const next = await refreshAccessToken();
        if (next) {
          headers.set("Authorization", `Bearer ${next}`);
          res = await fetch(url, { ...init, headers });
        }
      }

      const json = (await res.json()) as ApiSuccess<T> | ApiErrorBody;

      if (!res.ok || !json.success) {
        const err = !json.success
          ? json.error
          : { code: "HTTP_ERROR", message: res.statusText };
        throw new ApiRequestError(res.status, err.code, err.message);
      }

      return json.data;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ApiRequestError && e.status >= 400 && e.status < 500) throw e;
      if (attempt < maxRetries) await sleep(300 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Request failed");
}
