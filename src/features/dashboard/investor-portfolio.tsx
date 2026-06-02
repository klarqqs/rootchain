import { motion } from "framer-motion";
import { ArrowUpRight, LineChart, Sprout, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Btn } from "@/components/ui/button";
import { fetchInvestorPortfolio, type InvestorPortfolio } from "@/services/portfolio-api.service";
import { portfolioUsesApi } from "@/services/portfolio-api.service";
import { formatUsd, truncateAddr } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";

interface InvestorPortfolioPanelProps {
  onOpenMarketplace?: () => void;
  onTxClick?: (hash: string) => void;
}

export function InvestorPortfolioPanel({ onOpenMarketplace, onTxClick }: InvestorPortfolioPanelProps) {
  const [data, setData] = useState<InvestorPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const { totalUsd, balances } = useWallet();
  const usdc = balances.find((b) => b.symbol === "USDC" || b.asset === "USDC");

  useEffect(() => {
    if (!portfolioUsesApi()) {
      setLoading(false);
      return;
    }
    let alive = true;
    void fetchInvestorPortfolio()
      .then((p) => {
        if (alive) setData(p);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!portfolioUsesApi()) {
    return (
      <Glass className="p-6 text-sm text-slate-400">
        Connect <code className="text-lime-300">VITE_API_URL</code> for live portfolio analytics.
      </Glass>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total invested", value: formatUsd(data.summary.totalInvested), icon: Wallet },
          { label: "Projected returns", value: formatUsd(data.summary.projectedReturns), icon: LineChart },
          { label: "Active positions", value: String(data.summary.activePositions), icon: Sprout },
          { label: "Wallet USDC", value: formatUsd(usdc?.amount ?? 0), icon: Wallet },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Glass className="p-4 elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <card.icon className="w-4 h-4 text-lime-400" />
              </div>
              <div className="font-black text-2xl text-white tabular-nums">{card.value}</div>
            </Glass>
          </motion.div>
        ))}
      </div>

      <Glass className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-lg text-white">Active farm positions</h3>
            <p className="text-xs text-slate-500">
              Projected ROI {data.summary.projectedRoiPct}% · Wallet {formatUsd(totalUsd)}
            </p>
          </div>
          {onOpenMarketplace && (
            <Btn variant="primary" size="sm" icon={ArrowUpRight} onClick={onOpenMarketplace}>
              Deploy capital
            </Btn>
          )}
        </div>

        {data.positions.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No confirmed investments yet.</p>
        ) : (
          <div className="space-y-2">
            {data.positions.map((p) => (
              <div
                key={p.investmentId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <div className="font-bold text-white">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.cropType} · {p.location} · {p.fundingProgressPct}% funded
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lime-300 tabular-nums">{formatUsd(p.amount)}</div>
                  <div className="text-[11px] text-slate-500">
                    Proj. {formatUsd(p.projectedReturn)} · {p.expectedRoiPct}% ROI
                  </div>
                </div>
                {p.stellarTxHash && onTxClick && (
                  <button
                    type="button"
                    className="text-[11px] font-mono text-emerald-400 hover:underline"
                    onClick={() => onTxClick(p.stellarTxHash!)}
                  >
                    {truncateAddr(p.stellarTxHash, 8)}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Glass>

      <Glass className="p-5">
        <h3 className="font-black text-lg text-white mb-3">Recent activity</h3>
        <div className="space-y-2">
          {data.recentActivity.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2">
              <div>
                <span className="text-white font-semibold">{a.projectTitle}</span>
                <span className="ml-2">
                  <Pill color="ash">{a.status}</Pill>
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lime-300 tabular-nums">{formatUsd(a.amount)}</div>
                <div className="text-[10px] text-slate-600">{new Date(a.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}
