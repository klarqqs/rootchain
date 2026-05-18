import { AnimatePresence, motion } from "framer-motion";
import { Lock, Upload, X, Zap } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { UPLOAD_CATEGORY_OPTIONS } from "@/data/produce";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  category: string;
  quantity: string;
  quality: number;
  harvestDate: string;
  roi: number;
  target: string;
  shares: number;
}

const FIELDS: Array<{
  l: string;
  k: keyof FormState;
  t: "text" | "select" | "date" | "number";
  p?: string;
  opts?: string[];
}> = [
  { l: "Produce Name", k: "name", t: "text", p: "Premium Yellow Maize" },
  { l: "Category", k: "category", t: "select", opts: UPLOAD_CATEGORY_OPTIONS },
  { l: "Quantity", k: "quantity", t: "text", p: "12,400 kg" },
  { l: "Harvest Date", k: "harvestDate", t: "date" },
  { l: "Funding Target (USDC)", k: "target", t: "number", p: "100000" },
  { l: "Total Shares", k: "shares", t: "number", p: "100" },
];

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    category: "maize",
    quantity: "",
    quality: 85,
    harvestDate: "",
    roi: 18,
    target: "",
    shares: 100,
  });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm({ ...form, [k]: v });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="p-6" glow elevated>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <Pill color="lime" icon={Upload}>
                    Farmer Portal
                  </Pill>
                  <h3 className="font-black text-2xl text-white tracking-tight mt-2">
                    Tokenize your harvest.
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Mint a fractional on-chain claim for your next yield.
                  </p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <label
                htmlFor="farm-media-upload"
                className="border-2 border-dashed border-line-strong rounded-2xl p-6 mb-5 text-center hover:border-lime-500/40 cursor-pointer transition block"
                style={{ background: "rgba(132,204,22,0.02)" }}
              >
                <Upload className="w-8 h-8 text-lime-400 mx-auto mb-2" />
                <div className="font-bold text-white text-sm">Harvest media & lab attestations</div>
                <div className="text-xs text-slate-500 mt-1">Tap to select · images & PDF · client-side preview · wire Supabase Storage later</div>
                <input
                  id="farm-media-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf,video/*"
                  onChange={(e) => setMediaFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {mediaFiles.length > 0 && (
                <ul className="text-[11px] text-slate-400 space-y-1 mb-5 -mt-2">
                  {mediaFiles.map((f, i) => (
                    <li key={`${f.name}-${f.size}-${i}`} className="flex justify-between gap-2 px-3 py-2 rounded-xl border border-white/5">
                      <span className="truncate">{f.name}</span>
                      <span className="tabular-nums shrink-0">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {FIELDS.map((f) => (
                  <div key={f.k}>
                    <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1.5">
                      {f.l}
                    </label>
                    {f.t === "select" ? (
                      <select
                        value={form[f.k] as string}
                        onChange={(e) => set(f.k, e.target.value as never)}
                        className="w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm text-white font-bold outline-none focus:border-lime-500/40 transition capitalize"
                      >
                        {f.opts!.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.t}
                        value={form[f.k] as string | number}
                        placeholder={f.p}
                        onChange={(e) =>
                          set(f.k, (f.t === "number" ? Number(e.target.value) : e.target.value) as never)
                        }
                        className="w-full bg-black/30 border border-line rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-lime-500/40 transition placeholder:text-slate-700"
                      />
                    )}
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center justify-between mb-1.5">
                    <span>Quality Score</span>
                    <span className="text-lime-400 tabular-nums">{form.quality}/100</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={form.quality}
                    onChange={(e) => set("quality", Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500 flex items-center justify-between mb-1.5">
                    <span>Expected ROI</span>
                    <span className="text-lime-400 tabular-nums">{form.roi}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={form.roi}
                    onChange={(e) => set("roi", Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-line">
                <div className="text-xs text-slate-500 flex items-center">
                  <Lock className="w-3 h-3 inline mr-1" /> Mint fee: ~0.40 USDC · gasless after launch
                </div>
                <div className="flex gap-2">
                  <Btn variant="ghost" onClick={onClose}>
                    Cancel
                  </Btn>
                  <Btn variant="primary" icon={Zap}>
                    Deploy Contract
                  </Btn>
                </div>
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
