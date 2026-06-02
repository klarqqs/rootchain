import { motion } from "framer-motion";
import { BarChart3, Plus, Sprout, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchFarmerDashboard,
  portfolioUsesApi,
  type FarmerDashboard,
} from "@/services/portfolio-api.service";
import { formatUsd } from "@/lib/utils";
import { ProjectUpdatesPanel } from "@/features/updates/project-updates-panel";

interface FarmerDashboardPanelProps {
  onCreateProject?: () => void;
}

export function FarmerDashboardPanel({ onCreateProject }: FarmerDashboardPanelProps) {
  const [data, setData] = useState<FarmerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const reload = () => {
    if (!portfolioUsesApi()) return;
    setLoading(true);
    void fetchFarmerDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  if (!portfolioUsesApi()) {
    return (
      <Glass className="p-6 text-sm text-slate-400">
        Farmer analytics require Railway API (<code className="text-lime-300">VITE_API_URL</code>).
      </Glass>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!data) return null;

  const activeProject = selectedProject ?? data.projects.find((p) => p.status === "active")?.id ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pill color="lime" dot icon={Sprout}>
          Farmer verification: {data.summary.verificationStatus}
        </Pill>
        {onCreateProject && (
          <Btn variant="primary" icon={Plus} size="sm" onClick={onCreateProject}>
            New farm project
          </Btn>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total raised", value: formatUsd(data.summary.totalRaised), icon: BarChart3 },
          { label: "Funding target", value: formatUsd(data.summary.totalTarget), icon: BarChart3 },
          { label: "Unique investors", value: String(data.summary.uniqueInvestors), icon: Users },
          { label: "Active projects", value: String(data.summary.activeProjects), icon: Sprout },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Glass className="p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{c.label}</div>
              <div className="font-black text-2xl text-white tabular-nums mt-1">{c.value}</div>
            </Glass>
          </motion.div>
        ))}
      </div>

      <Glass className="p-5 space-y-3">
        <h3 className="font-black text-lg text-white">Project management</h3>
        {data.projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet. Create your first farm offering.</p>
        ) : (
          <div className="space-y-2">
            {data.projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                  activeProject === p.id
                    ? "border-lime-500/40 bg-lime-500/5"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-bold text-white">{p.title}</div>
                    <div className="text-xs text-slate-500 capitalize">{p.status} · {p.cropType}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lime-300 tabular-nums">{formatUsd(p.raisedAmount)}</div>
                    <div className="text-[11px] text-slate-500">of {formatUsd(p.targetAmount)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Glass>

      <Glass className="p-5">
        <h3 className="font-black text-lg text-white mb-2">Withdrawals</h3>
        <p className="text-sm text-slate-400">
          Available: <span className="text-white font-bold">{formatUsd(data.withdrawals.available)}</span>
          {" · "}
          {data.withdrawals.note}
        </p>
      </Glass>

      {activeProject && (
        <ProjectUpdatesPanel projectId={activeProject} onPosted={reload} />
      )}
    </div>
  );
}
