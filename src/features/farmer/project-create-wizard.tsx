import { motion } from "framer-motion";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { createProject, submitProject } from "@/services/project-api.service";
import { isApiBackendConfigured } from "@/lib/api/config";
import { useNotificationsStore } from "@/store/notifications.store";

const CROPS = ["maize", "cassava", "cocoa", "rice", "coffee", "sorghum", "other"] as const;

interface ProjectCreateWizardProps {
  onClose: () => void;
  onCreated?: () => void;
}

export function ProjectCreateWizard({ onClose, onCreated }: ProjectCreateWizardProps) {
  const push = useNotificationsStore((s) => s.push);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cropType, setCropType] = useState<string>("maize");
  const [location, setLocation] = useState("");
  const [targetAmount, setTargetAmount] = useState(25000);
  const [expectedRoiPct, setExpectedRoiPct] = useState(18);
  const [riskLevel, setRiskLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [harvestTimeline, setHarvestTimeline] = useState("Q4 2026");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  if (!isApiBackendConfigured()) {
    return (
      <Glass className="p-6 text-sm text-slate-400">
        Project creation requires the Railway API. Set <code className="text-lime-300">VITE_API_URL</code>.
      </Glass>
    );
  }

  const submit = async (andPublish: boolean) => {
    if (!title.trim() || !location.trim() || !startDate || !endDate) {
      push({ tone: "warning", title: "Missing fields", description: "Complete all required fields.", duration: 4000 });
      return;
    }
    setBusy(true);
    try {
      const media = [
        ...(imageUrl.trim() ? [{ url: imageUrl.trim(), kind: "IMAGE" as const }] : []),
        ...(videoUrl.trim() ? [{ url: videoUrl.trim(), kind: "VIDEO" as const }] : []),
      ];
      const project = await createProject({
        title,
        description,
        cropType,
        location,
        targetAmount,
        expectedRoiPct,
        riskLevel,
        aiScore: 72,
        harvestTimeline,
        startDate,
        endDate,
        media: media.length ? media : [{ url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200", kind: "IMAGE" }],
      });
      if (andPublish) {
        await submitProject(project.id);
        push({
          tone: "success",
          title: "Submitted for review",
          description: "Admin verification required before going live.",
          duration: 6000,
        });
      } else {
        push({ tone: "success", title: "Draft saved", description: "Add media and submit when ready.", duration: 5000 });
      }
      onCreated?.();
      onClose();
    } catch (e) {
      push({
        tone: "error",
        title: "Could not create project",
        description: e instanceof Error ? e.message : "Request failed",
        duration: 6000,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-lime-400" />
        <h2 className="font-black text-xl text-white">Create farm project</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:col-span-2">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:col-span-2">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full input-dark resize-none" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Crop
          <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="mt-1 w-full input-dark">
            {CROPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Funding goal (USDC)
          <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Est. ROI %
          <input type="number" value={expectedRoiPct} onChange={(e) => setExpectedRoiPct(Number(e.target.value))} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Risk level
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as typeof riskLevel)} className="mt-1 w-full input-dark">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Harvest timeline
          <input value={harvestTimeline} onChange={(e) => setHarvestTimeline(e.target.value)} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:col-span-2">
          Cover image URL
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className="mt-1 w-full input-dark" />
        </label>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:col-span-2">
          Farm video URL (optional)
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" className="mt-1 w-full input-dark" />
        </label>
      </div>

      <p className="text-[11px] text-slate-600">
        AI risk score is assigned as a placeholder (72) until the scoring engine is connected.
      </p>

      <div className="flex flex-wrap gap-2">
        <Btn variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Btn>
        <Btn variant="ghost" disabled={busy} onClick={() => void submit(false)}>
          Save draft
        </Btn>
        <Btn variant="primary" icon={busy ? Loader2 : Upload} disabled={busy} onClick={() => void submit(true)}>
          Submit for verification
        </Btn>
      </div>

      <style>{`
        .input-dark {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
      `}</style>
    </motion.div>
  );
}
