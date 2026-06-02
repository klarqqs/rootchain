import { useEffect, useState } from "react";
import {
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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchInvestorAnalytics } from "@/services/analytics-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import { formatUsd } from "@/lib/utils";

const COLORS = ["#84CC16", "#A78BFA", "#38BDF8", "#F59E0B", "#F43F5E"];

export function InvestorAnalyticsPanel() {
  const [data, setData] = useState<{
    totalInvested: number;
    diversificationScore: number;
    cropAllocation: { crop: string; amount: number; pct: number }[];
    riskAllocation: { risk: string; amount: number; pct: number }[];
    roiSeries: { label: string; projected: number; invested: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiBackendConfigured()) {
      setLoading(false);
      return;
    }
    void fetchInvestorAnalytics()
      .then((a) => setData(a as typeof data))
      .finally(() => setLoading(false));
  }, []);

  if (!isApiBackendConfigured()) return null;
  if (loading) return <Skeleton className="h-64" />;
  if (!data) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Glass className="p-5">
        <h3 className="font-black text-white mb-1">Portfolio diversification</h3>
        <p className="text-xs text-slate-500 mb-4">
          Score {data.diversificationScore}/100 · {formatUsd(data.totalInvested)} deployed
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data.cropAllocation} dataKey="amount" nameKey="crop" innerRadius={50} outerRadius={80}>
              {data.cropAllocation.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatUsd(Number(v ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
      </Glass>

      <Glass className="p-5">
        <h3 className="font-black text-white mb-4">Risk allocation</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.riskAllocation}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="risk" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip formatter={(v) => formatUsd(Number(v ?? 0))} />
            <Bar dataKey="amount" fill="#84CC16" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Glass>

      <Glass className="p-5 lg:col-span-2">
        <h3 className="font-black text-white mb-4">Projected returns vs invested</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.roiSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip formatter={(v) => formatUsd(Number(v ?? 0))} />
            <Bar dataKey="invested" fill="#334155" radius={[4, 4, 0, 0]} />
            <Bar dataKey="projected" fill="#84CC16" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Glass>
    </div>
  );
}
