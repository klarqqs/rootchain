import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TxRecord } from "@/types/transaction";

interface TransactionsState {
  records: TxRecord[];
  /** Hash of the most recently broadcast transaction, for spotlighting in the UI. */
  spotlightHash: string | null;
}

interface TransactionsActions {
  upsert: (record: TxRecord) => void;
  remove: (hash: string) => void;
  setSpotlight: (hash: string | null) => void;
  clear: () => void;
  getByHash: (hash: string) => TxRecord | undefined;
}

const MAX_HISTORY = 200;

export const useTransactionsStore = create<TransactionsState & TransactionsActions>()(
  persist(
    (set, get) => ({
      records: [],
      spotlightHash: null,
      upsert: (record) => {
        const idx = get().records.findIndex((r) => r.hash === record.hash);
        if (idx >= 0) {
          const next = [...get().records];
          next[idx] = record;
          set({ records: next });
        } else {
          const next = [record, ...get().records].slice(0, MAX_HISTORY);
          set({ records: next });
        }
      },
      remove: (hash) =>
        set((s) => ({ records: s.records.filter((r) => r.hash !== hash) })),
      setSpotlight: (hash) => set({ spotlightHash: hash }),
      clear: () => set({ records: [], spotlightHash: null }),
      getByHash: (hash) => get().records.find((r) => r.hash === hash),
    }),
    {
      name: "rootchain.transactions.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
