import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";
import type { Investment } from "@/types/portfolio";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { formatUsd, truncateAddr } from "@/lib/utils";

interface InvestmentCertificateModalProps {
  open: boolean;
  investment: Investment | null;
  walletAddress?: string;
  onClose: () => void;
}

export function InvestmentCertificateModal({
  open,
  investment,
  walletAddress,
  onClose,
}: InvestmentCertificateModalProps) {
  return (
    <AnimatePresence>
      {open && investment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <Glass className="p-8 relative elevated" glow>
              <button
                type="button"
                aria-label="Close certificate"
                onClick={onClose}
                className="absolute right-5 top-5 p-2 rounded-xl hover:bg-white/5 transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              <div className="flex justify-between gap-4 flex-wrap mb-6">
                <div>
                  <div className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em]">ROOTCHAIN attest</div>
                  <div className="text-3xl font-black text-white mt-3 leading-tight">Harvest participation certificate</div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill color="lime" icon={BadgeCheck}>
                    Stellar-aligned
                  </Pill>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <CertificateRow label="Certificate ID" value={investment.certificateId ?? investment.id.toUpperCase()} mono />
                <CertificateRow label="Listing" value={`${investment.produceId} · ${investment.produceName}`} />
                <CertificateRow label="Recorded shares" value={investment.shares.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })} />
                <CertificateRow label="Ownership" value={`${(investment.ownershipPct ?? 0).toFixed(3)} % of issuance`} />
                <CertificateRow label="Committed USDC" value={formatUsd(investment.amount)} />
                <CertificateRow label="Projected payout" value={formatUsd(investment.projectedHarvestUsd ?? investment.amount)} />
                <CertificateRow label="Escrow choreography" value={investment.escrowStatus ?? "locked"} capitalize />
                <CertificateRow label="Anchor transaction" mono value={`${investment.txHash.slice(0, 12)}…${investment.txHash.slice(-12)}`} />
                <CertificateRow label="Beneficiary vault" mono value={
                  walletAddress ? truncateAddr(walletAddress, 8, 6) : "Connect wallet for attestation linkage"
                } />
              </div>

              <div className="mt-8 rounded-3xl bg-white/[0.02] border border-white/10 p-4">
                <div className="text-[11px] text-slate-500 uppercase font-black mb-3 tracking-wider">Escrow attestations</div>
                {(investment.milestones ?? []).map((ms) => (
                  <div key={ms.id} className="flex items-start justify-between text-xs py-1 border-t border-white/5 first:border-0 gap-4">
                    <div>
                      <div className="text-white font-bold">{ms.label}</div>
                      <div className="text-[10px] text-slate-500">Unlock weight {ms.releaseWeightPct}%</div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      {ms.status === "verified"
                        ? ms.verifiedAt
                          ? `Verified · ${new Date(ms.verifiedAt).toLocaleDateString()}`
                          : "Verified"
                        : "Pending"}
                    </div>
                  </div>
                ))}
              </div>

              <Btn variant="primary" fullWidth className="mt-6" onClick={onClose}>
                Close attestation viewer
              </Btn>
              <div className="text-[11px] text-slate-500 text-center mt-3">
                Testnet attestations preview — not legal or investment advice — governance-grade custody tooling ships later.
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CertificateRowProps {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}

function CertificateRow({ label, value, mono, capitalize }: CertificateRowProps) {
  return (
    <div className="flex justify-between gap-4">
      <div className="text-slate-500 font-bold">{label}</div>
      <div
        className={[
          "text-right flex-1",
          mono ? "font-mono text-xs tracking-tighter" : "font-semibold",
          capitalize ? "capitalize" : "",
          "text-white",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
