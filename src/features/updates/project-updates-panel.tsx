import { motion } from "framer-motion";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProjectUpdates,
  postProjectUpdate,
} from "@/services/project-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import type { ProjectUpdate } from "@/services/project-api.service";

interface ProjectUpdatesPanelProps {
  projectId: string;
  onPosted?: () => void;
  pollMs?: number;
}

export function ProjectUpdatesPanel({
  projectId,
  onPosted,
  pollMs = 20_000,
}: ProjectUpdatesPanelProps) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [updateType, setUpdateType] = useState<"GENERAL" | "MILESTONE" | "HARVEST">("GENERAL");
  const [mediaUrl, setMediaUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!isApiBackendConfigured()) {
      setLoading(false);
      return;
    }
    const rows = await fetchProjectUpdates(projectId);
    setUpdates(rows);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), pollMs);
    return () => clearInterval(t);
  }, [load, pollMs]);

  const submit = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try {
      await postProjectUpdate(projectId, {
        title: title.trim() || undefined,
        body: body.trim(),
        updateType,
        mediaUrl: mediaUrl.trim() || undefined,
      });
      setBody("");
      setTitle("");
      setMediaUrl("");
      await load();
      onPosted?.();
    } finally {
      setBusy(false);
    }
  };

  if (!isApiBackendConfigured()) return null;

  return (
    <Glass className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-lg text-white">Farm updates</h3>
        <Pill color="purple" dot>
          Live feed
        </Pill>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Update title (optional)"
          className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none"
        />
        <select
          value={updateType}
          onChange={(e) => setUpdateType(e.target.value as typeof updateType)}
          className="bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none"
        >
          <option value="GENERAL">General</option>
          <option value="MILESTONE">Milestone</option>
          <option value="HARVEST">Harvest</option>
        </select>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share field progress, irrigation, pest management, or harvest data…"
        rows={3}
        className="w-full bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none resize-none"
      />
      <input
        value={mediaUrl}
        onChange={(e) => setMediaUrl(e.target.value)}
        placeholder="Media URL (image or video)"
        className="w-full bg-black/40 border border-line rounded-xl px-3 py-2 text-sm text-white outline-none"
      />
      <Btn variant="primary" icon={busy ? Loader2 : Send} disabled={busy} onClick={() => void submit()}>
        Publish update
      </Btn>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : updates.length === 0 ? (
        <p className="text-sm text-slate-500">No updates published yet.</p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {updates.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Pill color="ash">{u.updateType}</Pill>
                <span className="text-[10px] text-slate-600">
                  {new Date(u.createdAt).toLocaleString()}
                </span>
              </div>
              {u.title && <div className="font-bold text-white text-sm">{u.title}</div>}
              <p className="text-sm text-slate-400 mt-1 whitespace-pre-wrap">{u.body}</p>
              {u.mediaUrl && (
                <a
                  href={u.mediaUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  View media
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Glass>
  );
}
