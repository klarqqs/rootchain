/**
 * Railway API backend configuration.
 */

export function getApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (!raw?.trim()) return null;
  return raw.trim().replace(/\/$/, "");
}

export function isApiBackendConfigured(): boolean {
  return getApiBaseUrl() !== null;
}
