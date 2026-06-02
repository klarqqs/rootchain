import { useCallback, useEffect, useState } from "react";
import {
  listMarketplaceTransactions,
  refreshAllMarketplaceTransactions,
} from "@/database/services/marketplace-investment.service";
import { useIdentityStore } from "@/store/identity.store";
import type { MarketplaceTransaction } from "@/types/marketplace-transaction";

export function useMarketplaceTransactions() {
  const userId = useIdentityStore((s) => s.session?.user?.id);
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setError(null);
      return;
    }
    setLoading(true);
    const res = await listMarketplaceTransactions(userId);
    setTransactions(res.transactions);
    setError(res.error);
    setLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const res = await refreshAllMarketplaceTransactions(userId);
    setTransactions(res.transactions);
    setError(res.error);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { transactions, loading, error, reload: load, refresh };
}
