import { ExternalLink, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjectTransactions } from "@/services/project-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import { formatUsd, truncateAddr } from "@/lib/utils";
import { activeIsPublicNetwork } from "@/lib/stellar/effective-network";

interface TransactionLedgerProps {
  projectId: string;
  onTxClick?: (hash: string) => void;
}

export function TransactionLedger({ projectId, onTxClick }: TransactionLedgerProps) {
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof fetchProjectTransactions>>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiBackendConfigured()) {
      setLoading(false);
      return;
    }
    let alive = true;
    void fetchProjectTransactions(projectId)
      .then((t) => {
        if (alive) setRows(t);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  if (!isApiBackendConfigured()) return null;

  const explorerBase = activeIsPublicNetwork()
    ? "https://stellar.expert/explorer/public/tx/"
    : "https://stellar.expert/explorer/testnet/tx/";

  return (
    <Glass className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-lime-400" />
        <h3 className="font-black text-lg text-white">On-chain transparency</h3>
      </div>
      <p className="text-xs text-slate-500">
        Confirmed USDC investments with Stellar transaction hashes and timestamps.
      </p>

      {loading ? (
        <Skeleton className="h-32" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No confirmed investments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-600 border-b border-white/[0.06]">
                <th className="py-2 pr-3">Investor</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Tx hash</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-white/[0.04]">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-white">{t.investor.name}</div>
                    <div className="text-[10px] text-slate-600">{t.investor.emailMasked}</div>
                  </td>
                  <td className="py-3 pr-3 font-bold text-lime-300 tabular-nums">
                    {formatUsd(t.amount)}
                  </td>
                  <td className="py-3 pr-3">
                    {t.stellarTxHash ? (
                      <button
                        type="button"
                        className="font-mono text-xs text-emerald-400 hover:underline"
                        onClick={() => onTxClick?.(t.stellarTxHash!)}
                      >
                        {truncateAddr(t.stellarTxHash, 10)}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <Pill color={t.status === "confirmed" ? "lime" : "ash"}>{t.status}</Pill>
                  </td>
                  <td className="py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(t.timestamp).toLocaleString()}
                    {t.stellarTxHash && (
                      <a
                        href={`${explorerBase}${t.stellarTxHash}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="ml-2 inline text-emerald-500"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Glass>
  );
}
