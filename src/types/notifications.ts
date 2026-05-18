export type ToastTone = "success" | "info" | "warning" | "error" | "loading";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** ms; 0 means sticky until dismissed. */
  duration?: number;
  /** Optional action button text + handler. */
  action?: { label: string; onClick: () => void };
  /** Optional metadata for special cases (e.g. tx hash drilldown). */
  meta?: { txHash?: string };
}
