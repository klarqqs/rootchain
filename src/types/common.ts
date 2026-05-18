/**
 * Cross-cutting types used across services, stores, and hooks.
 */

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  lastFetched: number | null;
}

export const initialAsyncState = <T,>(): AsyncState<T> => ({
  status: "idle",
  data: null,
  error: null,
  lastFetched: null,
});

export interface ApiError extends Error {
  code?: string;
  status?: number;
}

export type Result<T, E = ApiError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T,>(value: T): Result<T> => ({ ok: true, value });
export const err = <T = never>(error: ApiError): Result<T> => ({ ok: false, error });
