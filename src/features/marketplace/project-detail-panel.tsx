import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionLedger } from "@/features/marketplace/transaction-ledger";
import { ProjectUpdatesPanel } from "@/features/updates/project-updates-panel";
import { RiskIntelligenceCard } from "@/features/ai/risk-intelligence-card";
import { LiveActivityFeed } from "@/features/transparency/live-activity-feed";
import { fetchProject } from "@/services/project-api.service";
import type { MarketplaceListing } from "@/types/marketplace";
import { formatUsd } from "@/lib/utils";
import { isApiBackendConfigured } from "@/lib/api/config";

interface ProjectDetailPanelProps {
  listing: MarketplaceListing | null;
  onClose: () => void;
  onInvest: (listing: MarketplaceListing) => void;
  onTxClick?: (hash: string) => void;
}

export function ProjectDetailPanel({ listing, onClose, onInvest, onTxClick }: ProjectDetailPanelProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listing || !isApiBackendConfigured()) return;
    setLoading(true);
    void fetchProject(listing.id).finally(() => setLoading(false));
  }, [listing?.id]);

  if (!listing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="fixed inset-y-0 right-0 z-[90] w-full max-w-lg bg-[#070a09]/95 border-l border-white/[0.06] backdrop-blur-xl overflow-y-auto p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Pill color="lime" dot>
            Verified project
          </Pill>
          <h2 className="font-black text-2xl text-white mt-2">{listing.title}</h2>
          <p className="text-sm text-slate-500">{listing.farmer.name}</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {listing.coverImageUrl && (
        <img src={listing.coverImageUrl} alt="" className="w-full h-44 object-cover rounded-xl" />
      )}

      <Glass className="p-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase text-slate-600 font-bold">Target</div>
          <div className="font-black text-white">{formatUsd(listing.targetAmount)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-600 font-bold">Raised</div>
          <div className="font-black text-lime-300">{formatUsd(listing.raisedAmount)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-600 font-bold">ROI</div>
          <div className="font-black text-white">{listing.expectedRoiPct ?? "—"}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-slate-600 font-bold">AI score</div>
          <div className="font-black text-white">{listing.aiScore ?? "Pending"}</div>
        </div>
      </Glass>

      <p className="text-sm text-slate-400 leading-relaxed">{listing.description}</p>

      <button
        type="button"
        className="w-full py-3 rounded-xl bg-lime-500 text-black font-black text-sm hover:bg-lime-400 transition-colors"
        onClick={() => onInvest(listing)}
      >
        Invest with USDC
      </button>

      {loading ? <Skeleton className="h-24" /> : null}

      {isApiBackendConfigured() && (
        <>
          <RiskIntelligenceCard projectId={listing.id} />
          <LiveActivityFeed projectId={listing.id} />
          <TransactionLedger projectId={listing.id} onTxClick={onTxClick} />
          <ProjectUpdatesPanel projectId={listing.id} pollMs={15_000} />
        </>
      )}
    </motion.div>
  );
}
