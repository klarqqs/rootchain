import { Brain, CloudRain, MapPin, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjectRisk, type RiskAssessment } from "@/services/ai-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";

interface RiskIntelligenceCardProps {
  projectId: string;
}

export function RiskIntelligenceCard({ projectId }: RiskIntelligenceCardProps) {
  const [data, setData] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isApiBackendConfigured()) {
      setLoading(false);
      return;
    }
    void fetchProjectRisk(projectId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (!isApiBackendConfigured()) return null;

  if (loading) return <Skeleton className="h-48" />;

  if (!data) return null;

  const bandColor =
    data.riskBand === "low" ? "lime" : data.riskBand === "high" ? "rose" : "amber";

  return (
    <Glass className="p-5 space-y-4 border border-violet-500/15">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="font-black text-lg text-white">AI risk intelligence</h3>
        </div>
        <Pill color={bandColor}>{data.riskBand} risk</Pill>
      </div>
      <p className="text-[10px] text-slate-600 uppercase tracking-wider">{data.modelVersion}</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Risk score", value: data.riskScore, icon: Shield },
          { label: "Trust score", value: data.trustScore, icon: TrendingUp },
          { label: "Predicted ROI", value: `${data.predictedRoiPct}%`, icon: TrendingUp },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-black/30 border border-white/[0.06] p-3">
            <m.icon className="w-3.5 h-3.5 text-slate-500 mb-1" />
            <div className="text-[10px] uppercase text-slate-600 font-bold">{m.label}</div>
            <div className="font-black text-xl text-white tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          Location stress {data.locationRisk}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <CloudRain className="w-3.5 h-3.5" />
          Weather stress {data.weatherRisk}
        </div>
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto">
        {data.factors.map((f) => (
          <div key={f.id} className="text-xs border-b border-white/[0.04] pb-2">
            <div className="flex justify-between font-bold text-slate-300">
              <span>{f.label}</span>
              <span className="tabular-nums text-lime-300">{f.score}</span>
            </div>
            <p className="text-slate-500 mt-0.5">{f.narrative}</p>
          </div>
        ))}
      </div>
    </Glass>
  );
}
