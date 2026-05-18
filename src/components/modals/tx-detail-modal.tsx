import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Radio,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { useTransactionsStore } from "@/store/transactions.store";
import { explorerTxUrl, activeNetworkLabel } from "@/lib/stellar/config";
import { cn } from "@/lib/utils";
import type { TxRecord } from "@/types/transaction";

interface TxDetailModalProps {
  open: boolean;
  onClose: () => void;
  hash: string | null;
}

const STATUS_META: Record<
  TxRecord["status"],
  { label: string; color: string; bg: string; ring: string }
> = {
  building: { label: "Building", color: "text-slate-300", bg: "bg-white/[0.04]", ring: "border-white/10" },
  signing: { label: "Signing", color: "text-sky-300", bg: "bg-sky-500/10", ring: "border-sky-500/30" },
  broadcasting: { label: "Broadcasting", color: "text-amber-300", bg: "bg-amber-500/10", ring: "border-amber-500/30" },
  pending: { label: "Pending", color: "text-amber-300", bg: "bg-amber-500/10", ring: "border-amber-500/30" },
  confirmed: { label: "Confirmed", color: "text-lime-300", bg: "bg-lime-500/10", ring: "border-lime-500/30" },
  failed: { label: "Failed", color: "text-rose-300", bg: "bg-rose-500/10", ring: "border-rose-500/30" },
};

const TARGET_CONFIRMATIONS = 5;

function ProgressDots({ confirmations, status }: { confirmations: number; status: TxRecord["status"] }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TARGET_CONFIRMATIONS }, (_, i) => {
        const filled = i < confirmations || status === "confirmed";
        return (
          <span
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              filled ? "bg-lime-400 shadow-[0_0_8px_rgba(132,204,22,0.6)]" : "bg-white/10",
            )}
          />
        );
      })}
    </div>
  );
}

function StageRow({ active, done, label, description }: { active: boolean; done: boolean; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
          done
            ? "bg-lime-500/20 border-lime-500/40"
            : active
              ? "bg-amber-500/20 border-amber-500/40"
              : "bg-white/5 border-white/10",
        )}
      >
        {done ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-lime-300" />
        ) : active ? (
          <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-slate-500" />
        )}
      </div>
      <div>
        <div className={cn("font-bold text-sm", done || active ? "text-white" : "text-slate-500")}>
          {label}
        </div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </div>
  );
}

export function TxDetailModal({ open, onClose, hash }: TxDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const record = useTransactionsStore((s) => (hash ? s.records.find((r) => r.hash === hash) : undefined));

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!record && open) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <Glass className="p-8 max-w-sm text-center" glow>
            <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="font-black text-white">Transaction not found</h3>
            <p className="text-sm text-slate-400 mt-1">This hash isn&apos;t in your local history.</p>
            <Btn variant="ghost" fullWidth className="mt-5" onClick={onClose}>
              Close
            </Btn>
          </Glass>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && record && (
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
            className="w-full max-w-xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="overflow-hidden" glow elevated>
              {/* Header */}
              <div className="px-6 py-5 flex items-start justify-between border-b border-line">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill color="lime" icon={Radio} dot>
                      {activeNetworkLabel()}
                    </Pill>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.12em]",
                        STATUS_META[record.status].bg,
                        STATUS_META[record.status].ring,
                        STATUS_META[record.status].color,
                      )}
                    >
                      {STATUS_META[record.status].label}
                    </span>
                  </div>
                  <h3 className="font-black text-white text-xl tracking-tight">
                    {record.kind} · {record.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                  </h3>
                  {record.produceName && (
                    <p className="text-sm text-slate-400 mt-1">{record.produceName}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hash + actions */}
              <div className="px-6 py-4 border-b border-line">
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                  Transaction Hash
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs text-white truncate flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/40 border border-line">
                    {record.hash}
                  </div>
                  <button
                    onClick={() => copy(record.hash)}
                    className="p-2 rounded-lg border border-line bg-black/30 hover:border-lime-500/30 transition shrink-0"
                    aria-label="Copy hash"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-lime-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <a
                    href={explorerTxUrl(record.hash)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2 rounded-lg border border-line bg-black/30 hover:border-lime-500/30 transition shrink-0"
                    aria-label="Open in explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-300" />
                  </a>
                </div>
              </div>

              {/* Lifecycle */}
              <div className="px-6 py-5 border-b border-line space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                    Confirmations
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressDots confirmations={record.confirmations} status={record.status} />
                    <span className="font-mono text-xs text-white tabular-nums">
                      {record.status === "confirmed" ? TARGET_CONFIRMATIONS : record.confirmations}/{TARGET_CONFIRMATIONS}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <StageRow
                    label="Building"
                    description="Constructing transaction envelope"
                    done={["signing", "broadcasting", "pending", "confirmed"].includes(record.status)}
                    active={record.status === "building"}
                  />
                  <StageRow
                    label="Signing"
                    description="Awaiting wallet signature"
                    done={["broadcasting", "pending", "confirmed"].includes(record.status)}
                    active={record.status === "signing"}
                  />
                  <StageRow
                    label="Broadcasting"
                    description="Submitting to Stellar network"
                    done={["pending", "confirmed"].includes(record.status)}
                    active={record.status === "broadcasting"}
                  />
                  <StageRow
                    label={`Confirming (${record.confirmations}/${TARGET_CONFIRMATIONS})`}
                    description="Validators acknowledging on-chain"
                    done={record.status === "confirmed"}
                    active={record.status === "pending"}
                  />
                </div>
              </div>

              {/* Receipt */}
              <div className="px-6 py-5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Amount</div>
                  <div className="font-bold text-white tabular-nums">
                    {record.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                  </div>
                </div>
                {record.receivedAsset && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Received</div>
                    <div className="font-bold text-lime-300 tabular-nums">
                      {record.receivedAsset.amount.toLocaleString()} {record.receivedAsset.symbol}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Network Fee</div>
                  <div className="font-bold text-white tabular-nums">{record.fee.toFixed(5)} XLM</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Ledger</div>
                  <div className="font-mono text-white">{record.ledger ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Submitted</div>
                  <div className="text-white">{new Date(record.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Settled</div>
                  <div className="text-white">
                    {record.settledAt ? new Date(record.settledAt).toLocaleTimeString() : "—"}
                  </div>
                </div>
                {record.counterparty && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      Counterparty
                    </div>
                    <div className="font-mono text-white text-xs truncate">{record.counterparty}</div>
                  </div>
                )}
                {record.memo && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Memo</div>
                    <div className="text-white">{record.memo}</div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-line flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {record.status === "confirmed"
                    ? "Audited end-to-end. Settled in USDC."
                    : "Real-time updates from the simulator."}
                </span>
                <Btn variant="outline" onClick={onClose}>
                  Done
                </Btn>
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
