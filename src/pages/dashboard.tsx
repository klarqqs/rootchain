import { useState } from "react";
import {
  DollarSign,
  Download,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Stat } from "@/components/ui/stat";
import { CommodityStats } from "@/components/dashboard/commodity-stats";
import { MarketInsights } from "@/components/dashboard/market-insights";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { TransparencyStrip } from "@/features/dashboard/transparency-strip";
import { HarvestEscrowRail } from "@/features/dashboard/harvest-escrow-rail";
import { AgIntelPanel } from "@/features/dashboard/ag-intel-panel";
import { InvestmentCertificateModal } from "@/features/investments/investment-certificate-modal";
import { MarketplaceTransactionHistory } from "@/features/dashboard/marketplace-transaction-history";
import { InvestorPortfolioPanel } from "@/features/dashboard/investor-portfolio";
import { FarmerDashboardPanel } from "@/features/dashboard/farmer-dashboard";
import { useIdentityStore } from "@/store/identity.store";
import { portfolioUsesApi } from "@/services/portfolio-api.service";
import { InvestorAnalyticsPanel } from "@/features/analytics/investor-analytics-panel";
import { LiveActivityFeed } from "@/features/transparency/live-activity-feed";
import { ALLOCATION, HARVEST_PERF, PORTFOLIO_CHART } from "@/data/market";
import { cn, formatUsd } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolio } from "@/hooks/use-portfolio";
import type { Investment } from "@/types/portfolio";

const TOOLTIP_STYLE = {
  background: "rgba(7,10,9,0.95)",
  border: "1px solid rgba(132,204,22,0.3)",
  borderRadius: 12,
  fontSize: 12,
  fontFamily: "Satoshi, Inter, sans-serif",
} as const;

interface DashboardPageProps {
  onTxClick?: (hash: string) => void;
  onOpenMarketplace?: () => void;
  onCreateProject?: () => void;
}

export function DashboardPage({
  onTxClick,
  onOpenMarketplace,
  onCreateProject,
}: DashboardPageProps) {
  const profile = useIdentityStore((s) => s.profile);
  const { totalUsd, balances, account } = useWallet();
  const { snapshot, positions, advanceHarvestMilestone } = usePortfolio();
  const usdc = balances.find((b) => b.symbol === "USDC" || b.asset === "USDC");
  const [certificateTarget, setCertificateTarget] = useState<Investment | null>(null);

  // Derive allocation from positions when we have enough; otherwise keep
  // the seeded ALLOCATION constant for visual realism.
  const derivedAllocation = (() => {
    if (positions.length < 2) return null;
    const groups = new Map<string, { amount: number; color: string }>();
    const colorFor = (id: string) => {
      const m: Record<string, string> = {
        "RC-0421": "#84CC16",
        "RC-0388": "#A16207",
        "RC-0476": "#F1F5F4",
        "RC-0628": "#DC2626",
        "RC-0301": "#0EA5E9",
      };
      return m[id] ?? "#64748B";
    };
    for (const p of positions) {
      const cur = groups.get(p.produceId) ?? { amount: 0, color: colorFor(p.produceId) };
      cur.amount += p.amount;
      groups.set(p.produceId, cur);
    }
    const total = [...groups.values()].reduce((s, g) => s + g.amount, 0);
    return [...groups.entries()].map(([name, g]) => ({
      name,
      value: Math.round((g.amount / total) * 100),
      color: g.color,
    }));
  })();
  const allocation = derivedAllocation ?? ALLOCATION;
  const role = profile?.role;
  const showLiveEngine = portfolioUsesApi() && (role === "investor" || role === "farmer");

  const escapeCsvCell = (v: string | number | undefined | null) => {
    const raw = `${v ?? ""}`;
    const needsQuote =
      raw.includes('"') || raw.includes(",") || raw.includes("\n") || raw.includes("\r");
    const sanitized = raw.replace(/"/g, '""');
    return needsQuote ? `"${sanitized}"` : sanitized;
  };

  const exportPortfolioCsv = () => {
    const headerLabels = [
      "investment_id",
      "produce_id",
      "produce_name",
      "amount_usdc",
      "shares",
      "expected_roi_pct",
      "tx_hash",
      "ledger_asset_code",
      "ledger_asset_issuer",
    ];
    const headerRow = headerLabels.map((cell) => escapeCsvCell(cell)).join(",");
    const dataRows =
      positions.length === 0
        ? ""
        : positions
            .map((p) =>
              [
                p.id,
                p.produceId,
                p.produceName,
                p.amount,
                p.shares,
                p.expectedRoi,
                p.txHash,
                p.ledgerAssetCode ?? "",
                p.ledgerAssetIssuer ?? "",
              ]
                .map((cell) => escapeCsvCell(cell))
                .join(","),
            )
            .join("\n") + "\n";

    const csv = `${headerRow}\n${dataRows}`;
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rootchain-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-16">
      {showLiveEngine && role === "investor" && (
        <>
          <InvestorPortfolioPanel onOpenMarketplace={onOpenMarketplace} onTxClick={onTxClick} />
          <InvestorAnalyticsPanel />
          <LiveActivityFeed />
        </>
      )}
      {showLiveEngine && role === "farmer" && (
        <FarmerDashboardPanel onCreateProject={onCreateProject} />
      )}

      <Glass className="p-4 flex flex-wrap items-center justify-between gap-3 border border-white/[0.04]">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Reporting lane</div>
          <div className="font-bold text-white mt-1">Export portfolio attestations · CSV bundle</div>
          <div className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Positions inherit live ledger issuance metadata captured at investment settlement — ideal attachment for coop audits or accelerator diligence rooms.
          </div>
        </div>
        <Btn variant="outline" icon={Download} onClick={exportPortfolioCsv}>
          Export CSV
        </Btn>
      </Glass>
      {/* Top stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Portfolio Value"
          value={totalUsd > 0 ? formatUsd(totalUsd) : formatUsd(0)}
          delta="+6.94%"
          icon={Wallet}
          sub="7d"
        />
        <Stat
          label="Active Harvests"
          value={snapshot.activeCount > 0 ? String(snapshot.activeCount) : "12"}
          delta={snapshot.activeCount > 0 ? `+${snapshot.activeCount} active` : "+2 this month"}
          icon={Sprout}
        />
        <Stat
          label="Projected Yield"
          value={snapshot.totalProjected > 0 ? formatUsd(snapshot.totalProjected) : "$ 34,820"}
          delta={`+${snapshot.blendedRoi.toFixed(1)}% ROI`}
          icon={TrendingUp}
        />
        <Stat
          label="Liquidity Radar"
          value={usdc ? formatUsd(usdc.amount) : "$ 4,120.00"}
          delta={
            snapshot.blendedRiskScore
              ? `Risk blend ${snapshot.blendedRiskScore.toFixed(2)}/10`
              : "+1.8 vs basket"
          }
          icon={DollarSign}
        />
      </div>

      <TransparencyStrip />

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-12">
          <HarvestEscrowRail
            positions={positions}
            onAdvance={advanceHarvestMilestone}
            onOpenCertificate={(inv) => setCertificateTarget(inv)}
          />
        </div>

        {/* Portfolio chart */}
        <Glass className="lg:col-span-8 p-5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-black text-lg text-white tracking-tight">Portfolio Performance</h3>
              <div className="text-xs text-slate-500">Value vs. projection — last 8 months</div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {["1W", "1M", "3M", "1Y", "ALL"].map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition",
                    i === 4
                      ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                      : "text-slate-500 hover:text-white",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PORTFOLIO_CHART}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84CC16" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="m" stroke="#475569" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#84CC16", fontWeight: 700 }} />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#pGrad)"
                  name="Projection"
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#84CC16"
                  strokeWidth={2.5}
                  fill="url(#vGrad)"
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* Allocation */}
        <Glass className="lg:col-span-4 p-5">
          <h3 className="font-black text-lg text-white tracking-tight mb-1">Allocation</h3>
          <div className="text-xs text-slate-500 mb-4">By produce category</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {allocation.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {allocation.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-white/[0.02]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: a.color }}
                  />
                  <span className="text-slate-300 font-bold truncate">{a.name}</span>
                </div>
                <span className="text-white font-bold tabular-nums shrink-0">{a.value}%</span>
              </div>
            ))}
          </div>
        </Glass>

        {/* Harvest performance */}
        <Glass className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-lg text-white tracking-tight">Harvest Performance</h3>
              <div className="text-xs text-slate-500">Yield score by asset</div>
            </div>
            <Pill color="lime" dot>
              Live
            </Pill>
          </div>
          <div className="h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HARVEST_PERF}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BEF264" />
                    <stop offset="100%" stopColor="#65A30D" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(132,204,22,0.05)" }} />
                <Bar dataKey="yield" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* Weather */}
        <div className="lg:col-span-4">
          <WeatherWidget />
        </div>

        <div className="lg:col-span-12">
          <AgIntelPanel />
        </div>

        {/* Commodity stats — full width */}
        <div className="lg:col-span-12">
          <CommodityStats />
        </div>

        {/* Market insights */}
        <div className="lg:col-span-7">
          <MarketInsights />
        </div>

        {/* Marketplace investment transactions (Supabase) */}
        <div className="lg:col-span-5">
          <MarketplaceTransactionHistory />
        </div>
      </div>

      <InvestmentCertificateModal
        open={!!certificateTarget}
        investment={certificateTarget}
        walletAddress={account?.publicKey}
        onClose={() => setCertificateTarget(null)}
      />
    </div>
  );
}
