/**
 * Portfolio service — derives analytics from the in-memory portfolio store
 * + transaction history. Phase 2 mirrors what Phase 3's REST API will return.
 */

import { mockGet } from "@/api/client";
import { usePortfolioStore } from "@/store/portfolio.store";
import { useTransactionsStore } from "@/store/transactions.store";
import type { Investment, PortfolioSnapshot } from "@/types/portfolio";
import type { Result } from "@/types/common";
import { ok } from "@/types/common";

export async function getPortfolioSnapshot(): Promise<Result<PortfolioSnapshot>> {
  return mockGet(() => ok(usePortfolioStore.getState().snapshot));
}

export async function listPositions(): Promise<Result<Investment[]>> {
  return mockGet(() => ok(usePortfolioStore.getState().positions));
}

export async function getRecentTransactions(limit = 12) {
  return mockGet(() =>
    ok(useTransactionsStore.getState().records.slice(0, limit)),
  );
}
