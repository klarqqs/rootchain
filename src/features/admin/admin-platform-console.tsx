import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Btn } from "@/components/ui/button";
import {
  fetchPendingFarmers,
  fetchPendingProjects,
  reviewProject,
  verifyFarmer,
  type AdminReviewDecision,
} from "@/services/admin-api.service";
import { fetchAdminAnalytics } from "@/services/analytics-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import { formatUsd } from "@/lib/utils";
import { useNotificationsStore } from "@/store/notifications.store";

type PendingFarmer = Awaited<ReturnType<typeof fetchPendingFarmers>>["farmers"][number];
type PendingProject = Awaited<ReturnType<typeof fetchPendingProjects>>["projects"][number];

export function AdminPlatformConsole() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [pendingFarmers, setPendingFarmers] = useState<PendingFarmer[]>([]);
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const reload = async () => {
    if (!isApiBackendConfigured()) return;
    setLoading(true);
    try {
      const [a, f, p] = await Promise.all([
        fetchAdminAnalytics(),
        fetchPendingFarmers(),
        fetchPendingProjects(),
      ]);
      setAnalytics(a);
      setPendingFarmers(f.farmers);
      setPendingProjects(p.projects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const runReview = async (
    kind: "farmer" | "project",
    id: string,
    decision: AdminReviewDecision,
  ) => {
    setActingId(`${kind}:${id}`);
    try {
      if (kind === "farmer") await verifyFarmer(id, decision);
      else await reviewProject(id, decision);
      useNotificationsStore.getState().push({
        tone: "success",
        title: decision === "APPROVED" ? "Approved" : "Rejected",
        description:
          kind === "farmer"
            ? "Farmer verification updated on-chain rail."
            : "Project review recorded; farmer notified.",
        duration: 5000,
      });
      await reload();
    } catch (e) {
      useNotificationsStore.getState().push({
        tone: "error",
        title: "Action failed",
        description: e instanceof Error ? e.message : "Could not complete review.",
        duration: 6000,
      });
    } finally {
      setActingId(null);
    }
  };

  if (!isApiBackendConfigured()) {
    return (
      <Glass className="p-6 text-sm text-slate-400">
        Connect Railway API for live admin operations.
      </Glass>
    );
  }

  if (loading) return <Skeleton className="h-48" />;

  const vol = analytics?.volume as { totalUsdc?: number; confirmedInvestments?: number } | undefined;
  const users = analytics?.users as { total?: number; farmers?: number; investors?: number } | undefined;
  const fraud = analytics?.fraudSignals as Record<string, string> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Pill color="lime" dot>
          Live admin console
        </Pill>
        <Btn variant="outline" size="sm" onClick={() => void reload()}>
          Refresh
        </Btn>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Glass className="p-4">
          <div className="text-[10px] uppercase text-slate-600 font-bold">Platform volume</div>
          <div className="font-black text-2xl text-white">{formatUsd(vol?.totalUsdc ?? 0)}</div>
          <div className="text-xs text-slate-500">{vol?.confirmedInvestments ?? 0} investments</div>
        </Glass>
        <Glass className="p-4">
          <div className="text-[10px] uppercase text-slate-600 font-bold">Users</div>
          <div className="font-black text-2xl text-white">{users?.total ?? 0}</div>
          <div className="text-xs text-slate-500">
            {users?.farmers ?? 0} farmers · {users?.investors ?? 0} investors
          </div>
        </Glass>
        <Glass className="p-4">
          <div className="text-[10px] uppercase text-slate-600 font-bold">Pending farmers</div>
          <div className="font-black text-2xl text-amber-300">{pendingFarmers.length}</div>
        </Glass>
        <Glass className="p-4">
          <div className="text-[10px] uppercase text-slate-600 font-bold">Pending projects</div>
          <div className="font-black text-2xl text-amber-300">{pendingProjects.length}</div>
        </Glass>
      </div>

      {fraud && (
        <Glass className="p-4">
          <h3 className="font-black text-white mb-2">Fraud monitoring</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(fraud).map(([k, v]) => (
              <Pill key={k} color={v === "elevated" ? "rose" : "ash"}>
                {k}: {v}
              </Pill>
            ))}
          </div>
        </Glass>
      )}

      <Glass className="p-5 space-y-3">
        <h3 className="font-black text-white">Farmer verification queue</h3>
        {pendingFarmers.length === 0 && (
          <p className="text-xs text-slate-500 italic">No pending farmer attestations.</p>
        )}
        {pendingFarmers.map((f) => {
          const busy = actingId === `farmer:${f.id}`;
          return (
            <div
              key={f.id}
              className="flex flex-wrap gap-3 items-center justify-between rounded-2xl border border-white/[0.04] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{f.displayName}</div>
                <div className="text-[11px] text-slate-500">
                  {f.user.fullName ?? f.user.email} · {f.verificationStatus}
                </div>
              </div>
              <div className="flex gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runReview("farmer", f.id, "APPROVED")}
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </Btn>
                <Btn
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runReview("farmer", f.id, "REJECTED")}
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </Btn>
              </div>
            </div>
          );
        })}
      </Glass>

      <Glass className="p-5 space-y-3">
        <h3 className="font-black text-white">Project review queue</h3>
        {pendingProjects.length === 0 && (
          <p className="text-xs text-slate-500 italic">No projects awaiting institutional review.</p>
        )}
        {pendingProjects.map((p) => {
          const busy = actingId === `project:${p.id}`;
          return (
            <div
              key={p.id}
              className="flex flex-wrap gap-3 items-center justify-between rounded-2xl border border-white/[0.04] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{p.title}</div>
                <div className="text-[11px] text-slate-500">
                  {p.farmer.displayName}
                  {p.cropType ? ` · ${p.cropType}` : ""} · {formatUsd(p.fundingGoalUsdc)} goal
                </div>
              </div>
              <div className="flex gap-2">
                <Btn
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runReview("project", p.id, "APPROVED")}
                >
                  <Check className="w-3.5 h-3.5" />
                  List
                </Btn>
                <Btn
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void runReview("project", p.id, "REJECTED")}
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </Btn>
              </div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}
