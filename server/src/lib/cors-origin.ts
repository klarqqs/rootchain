import { env } from "../config/env.js";

/** Private LAN + localhost Vite ports for local development. */
const DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

export function resolveCorsOrigin():
  | string[]
  | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const configured = env.CORS_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (env.NODE_ENV !== "development") {
    return configured;
  }

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (configured.includes(origin) || DEV_ORIGIN.test(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}
