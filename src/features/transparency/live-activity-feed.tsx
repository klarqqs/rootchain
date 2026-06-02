import { motion } from "framer-motion";
import { Activity, Radio } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPlatformActivity, type PlatformActivity } from "@/services/transparency-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import { useRealtime } from "@/hooks/use-realtime";

export function LiveActivityFeed({ projectId }: { projectId?: string }) {
  const [items, setItems] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isApiBackendConfigured()) {
      setLoading(false);
      return;
    }
    const rows = await fetchPlatformActivity(30, projectId);
    setItems(rows);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtime((event) => {
    if (event.type === "activity") {
      void load();
    }
  });

  if (!isApiBackendConfigured()) return null;

  return (
    <Glass className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-lime-400" />
          <h3 className="font-black text-lg text-white">Live activity</h3>
        </div>
        <Pill color="purple" icon={Radio} dot>
          Realtime
        </Pill>
      </div>

      {loading ? (
        <Skeleton className="h-32" />
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No platform activity yet.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {items.map((a, i) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
            >
              <div className="flex justify-between gap-2 text-[10px] text-slate-600 uppercase font-bold">
                <span>{a.type.replace(/_/g, " ")}</span>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <div className="font-semibold text-white text-sm mt-0.5">{a.title}</div>
              <p className="text-xs text-slate-500">{a.summary}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </Glass>
  );
}
