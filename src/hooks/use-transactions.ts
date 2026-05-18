import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTransactionsStore } from "@/store/transactions.store";

export function useTransactions() {
  return useTransactionsStore(
    useShallow((s) => ({
      records: s.records,
      spotlightHash: s.spotlightHash,
      setSpotlight: s.setSpotlight,
    })),
  );
}

export function useTransaction(hash: string | null) {
  const getByHash = useTransactionsStore((s) => s.getByHash);
  return useCallback(() => (hash ? getByHash(hash) : undefined), [hash, getByHash])();
}
