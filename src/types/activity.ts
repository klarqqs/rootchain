/** Platform-wide persisted activity surfaced in the bell drawer (push-ready payloads). */

export type ActivityTone = "neutral" | "success" | "warning" | "danger";

export type ActivityCategory =
  | "txn"
  | "invest"
  | "escrow"
  | "milestone"
  | "distribution"
  | "wallet"
  | "intel";

export interface ActivityItem {
  id: string;
  createdAt: number;
  read: boolean;
  category: ActivityCategory;
  tone: ActivityTone;
  title: string;
  body?: string;
  meta?: {
    txHash?: string;
    produceId?: string;
    escrowStatus?: string;
  };
}
