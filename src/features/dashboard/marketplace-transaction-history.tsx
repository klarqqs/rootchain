import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Sprout,
  XCircle,
} from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { useMarketplaceTransactions } from "@/hooks/use-marketplace-transactions";
import type { MarketplaceTransaction, MarketplaceTransactionStatus } from "@/types/marketplace-transaction";
import { cn, formatUsd, truncateAddr } from "@/lib/utils";

const STATUS_META: Record<
  MarketplaceTransactionStatus,
  { label: string; pill: "amber" | "lime" | "rose"; icon: typeof Clock }
> = {
  pending: { label: "Pending", pill: "amber", icon: Clock },
  confirmed: { label: "Confirmed", pill: "lime", icon: CheckCircle2 },
  failed: { label: "Failed", pill: "rose", icon: XCircle },
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionRow({ tx, index }: { tx: MarketplaceTransaction; index: number }) {
  const meta = STATUS_META[tx.status];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02]"
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
          tx.status === "pending" && "bg-amber-500/10 border-amber-500/25",
          tx.status === "confirmed" && "bg-lime-500/10 border-lime-500/25",
          tx.status === "failed" && "bg-rose-500/10 border-rose-500/25",
        )}
      >
        {tx.status === "pending" ? (
          <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
        ) : (
          <Icon className={cn("w-4 h-4", tx.status === "confirmed" ? "text-lime-400" : "text-rose-400")} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-white truncate">
          {tx.projectTitle ?? "Marketplace project"}
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          {formatUsd(tx.amount)} · {tx.walletAddress ? truncateAddr(tx.walletAddress, 6, 4) : "—"} ·{" "}
          {formatWhen(tx.createdAt)}
        </div>
      </div>
      <Pill color={meta.pill} dot>
        {meta.label}
      </Pill>
    </motion.div>
  );
}

export function MarketplaceTransactionHistory() {
  const { transactions, loading, error, refresh } = useMarketplaceTransactions();

  return (
    <Glass className="p-5 h-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-black text-lg text-white tracking-tight">Investment Transactions</h3>
          <p className="text-xs text-slate-500">Live records from Supabase · Stellar settlement next</p>
        </div>
        <Btn variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={() => void refresh()}>
          Refresh
        </Btn>
      </div>

      {error && (
        <p className="text-xs text-rose-200 mb-3 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2">
          {error}
        </p>
      )}

      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading transactions…
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10">
          <Sprout className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No marketplace investments yet.</p>
          <p className="text-xs text-slate-600 mt-1">Invest in an active project to see history here.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {transactions.map((tx, i) => (
            <TransactionRow key={tx.id} tx={tx} index={i} />
          ))}
        </div>
      )}
    </Glass>
  );
}
