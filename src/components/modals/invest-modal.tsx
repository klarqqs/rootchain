import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, DollarSign, ExternalLink, Loader2, Wallet, X, Zap, Radio } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import type { ProduceItem } from "@/data/produce";
import { tokens } from "@/lib/tokens";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolioStore } from "@/store/portfolio.store";
import { marketplaceService } from "@/services";
import { persistInvestment as syncInvestmentRemote } from "@/database/services/investment.service";
import { shortHash } from "@/utils/hash";
import { explorerTxUrl } from "@/lib/stellar/config";
import { canExecuteReal } from "@/services/tx-dispatch";
import { USDC_XLM_RATE as STELLAR_RATE } from "@/lib/stellar/tx-executor";
import type { TxRecord } from "@/types/transaction";
import { cn, truncateAddr } from "@/lib/utils";
import {
  ownershipPct as ownershipSlice,
  tokenPriceUsd,
} from "@/tokenization/harvest-metrics";
import { InvestorDisclaimerStripe } from "@/features/compliance/investor-disclaimer-stripe";
import { isSupabaseAuthEnforced } from "@/lib/auth-routes";
import { useIdentityStore } from "@/store/identity.store";
import { useNotificationsStore } from "@/store/notifications.store";

interface InvestModalProps {
  open: boolean;
  onClose: () => void;
  item: ProduceItem | null;
  onTxComplete?: (hash: string) => void;
}

type Stage = "form" | "confirming" | "success" | "error";

export function InvestModal({ open, onClose, item, onTxComplete }: InvestModalProps) {
  const [amount, setAmount] = useState(500);
  const [stage, setStage] = useState<Stage>("form");
  const [txRecord, setTxRecord] = useState<TxRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isConnected, balances, account, refresh } = useWallet();
  const usdc = balances.find((b) => b.symbol === "USDC" || b.asset === "USDC");
  const xlmBal = balances.find((b) => b.symbol === "XLM" || b.asset === "XLM")?.amount ?? 0;
  const usdcBalance = usdc?.amount ?? 0;
  const addInvestment = usePortfolioStore((s) => s.addInvestment);
  const isReal = isConnected && canExecuteReal();
  const xlmEquivalent = isReal ? (amount / STELLAR_RATE).toFixed(4) : null;
  const ledgerXlmRequired = amount / STELLAR_RATE;

  const FEE_GUARD_XLM = 0.03;

  const shares = item ? Math.floor((amount / item.target) * item.sharesTotal * 10) / 10 : 0;
  const projected = item ? amount * (1 + item.roi / 100) : 0;
  const tokenPriceSnapshot = item ? tokenPriceUsd(item) : null;
  const ownershipPreview = item ? ownershipSlice(shares, item) : 0;
  const insufficient = isConnected
    ? isReal
      ? xlmBal < ledgerXlmRequired + FEE_GUARD_XLM
      : amount > usdcBalance
    : false;
  const enforcedProfileGate = isSupabaseAuthEnforced();
  const identityUser = useIdentityStore((s) => s.session?.user);
  const notify = useNotificationsStore((s) => s.push);

  // Reset is performed on every close path (reset() below), so re-opening
  // always lands in a fresh state without cascading renders.

  const submit = async () => {
    if (!item) return;
    if (!isConnected) {
      setErrorMessage("Connect your wallet before investing.");
      setStage("error");
      return;
    }
    if (enforcedProfileGate && !identityUser) {
      notify({
        tone: "error",
        title: "Account required",
        description: "Sign in so ROOTCHAIN can attribute this allocation to your secure profile.",
        duration: 6200,
      });
      setErrorMessage("Authenticate your ROOTCHAIN account before allocating capital.");
      setStage("error");
      return;
    }
    if (insufficient) {
      setErrorMessage(
        isReal
          ? `Not enough lumens yet (need roughly ${ledgerXlmRequired.toFixed(4)} XLM + fees · available ${xlmBal.toFixed(4)} XLM). Tap Friendbot from Wallet or deposit test XLM before investing.`
          : `Insufficient USDC for demo balances. Available: ${usdcBalance.toFixed(2)}.`,
      );
      setStage("error");
      return;
    }

    setStage("confirming");
    const tx = marketplaceService.invest({ produce: item, amount });

    const finalRecord = await tx.finalized;
    setTxRecord(finalRecord);

    if (finalRecord.status === "confirmed") {
      const inv = tx.buildInvestment(finalRecord);
      addInvestment(inv);
      if (account?.publicKey) {
        void syncInvestmentRemote(account.publicKey, inv, finalRecord.hash, ledgerXlmRequired).catch(() => {
          /* optional Supabase wiring */
        });
      }
      void refresh();
      setStage("success");
    } else {
      setErrorMessage(finalRecord.memo ?? "Transaction failed.");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("form");
    setAmount(500);
    setTxRecord(null);
    setErrorMessage(null);
    onClose();
  };

  const handleViewTx = () => {
    if (txRecord) onTxComplete?.(txRecord.hash);
    reset();
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={reset}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="p-6" glow elevated>
              {stage === "form" && (
                <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Pill color="lime" icon={DollarSign}>
                          Invest USDC
                        </Pill>
                        {isReal && (
                          <Pill color="purple">
                            ⚡ Real Stellar
                          </Pill>
                        )}
                      </div>
                      <button onClick={reset} className="p-2 rounded-lg hover:bg-white/5">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  <h3 className="font-black text-xl text-white tracking-tight">{item.name}</h3>
                  <div className="text-xs text-slate-500 mb-5">
                    {item.farmer} · {item.location}
                  </div>

                  {!isConnected && (
                    <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] text-xs text-amber-200 flex items-start gap-2">
                      <Wallet className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Connect a wallet first — this will simulate the transfer until you do.</span>
                    </div>
                  )}

                  {isConnected && account && (
                    <div className="mb-4 flex items-center justify-between text-xs">
                      <span className="text-slate-400">From</span>
                      <span className="font-mono text-slate-200">
                        {truncateAddr(account.publicKey, 6, 6)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                          Investment Amount
                        </label>
                        {isConnected && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 text-right max-w-[62%]">
                            {isReal ? (
                              <>
                                {`${xlmBal.toFixed(4)} XLM`}
                                <span className="text-slate-600 mx-1">·</span>
                                {`${usdcBalance.toFixed(2)} USDC row`}
                              </>
                            ) : (
                              <>
                                Demo {`${usdcBalance.toFixed(2)}`} USDC
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className={cn(
                            "w-full bg-black/40 border-2 rounded-2xl px-5 py-4 text-2xl font-black text-white outline-none transition tabular-nums",
                            insufficient
                              ? "border-rose-500/60 focus:border-rose-500/80"
                              : "focus:border-lime-500/50",
                          )}
                          style={!insufficient ? { borderColor: tokens.lineStrong } : undefined}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lime-400 font-black">
                          USDC
                        </span>
                      </div>
                      {insufficient && (
                        <div className="mt-2 text-[11px] text-rose-300 font-bold">
                          Amount exceeds available balance.
                        </div>
                      )}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {[5, 10, 25, 100, 500, 1000, 2500].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAmount(v)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-white/[0.03] hover:bg-lime-500/10 text-slate-300 hover:text-lime-300 border border-white/5 transition"
                          >
                            ${v}
                          </button>
                        ))}
                        {isConnected && usdcBalance > 0 && (
                          <button
                            onClick={() => setAmount(Math.floor(usdcBalance))}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-lime-500/10 hover:bg-lime-500/20 text-lime-300 border border-lime-500/20 transition"
                          >
                            Max
                          </button>
                        )}
                      </div>
                    </div>

                    <Glass className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ownership Shares</span>
                          <span className="font-bold text-white tabular-nums">{shares.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Token unit price</span>
                          <span className="font-bold text-white tabular-nums">
                            $
                            {(tokenPriceSnapshot ?? 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Your ownership slice</span>
                          <span className="font-bold text-lime-200 tabular-nums">
                            {ownershipPreview.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Backing cohort</span>
                          <span className="font-bold text-slate-100 tabular-nums">
                            {(item?.investorCount ?? 0).toLocaleString()} investors on-file
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expected ROI</span>
                          <span className="font-bold text-lime-400 tabular-nums">+{item.roi}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Projected at Harvest</span>
                          <span className="font-bold text-white tabular-nums">
                            ${projected.toFixed(2)}
                          </span>
                        </div>
                        {xlmEquivalent && (
                          <div className="flex justify-between border-t border-line pt-2">
                            <span className="text-slate-400">Actual on-chain transfer</span>
                            <span className="font-bold text-violet-300 tabular-nums">
                              {xlmEquivalent} XLM
                            </span>
                          </div>
                        )}
                        <div className={cn("flex justify-between", !xlmEquivalent && "border-t border-line pt-2")}>
                          <span className="text-slate-400">Network Fee</span>
                          <span className="font-bold text-white">~0.00001 XLM</span>
                        </div>
                      </div>
                    </Glass>

                    <InvestorDisclaimerStripe compact />

                    <Btn
                      variant="primary"
                      icon={Zap}
                      fullWidth
                      onClick={submit}
                      disabled={amount <= 0 || (isConnected && insufficient)}
                    >
                      {isReal
                        ? "Sign with Freighter"
                        : isConnected
                          ? "Confirm & Sign"
                          : "Simulate Investment"}
                    </Btn>
                    <p className="text-[11px] text-slate-500 text-center">
                      Funds enter a smart contract escrow until milestone-based release.
                    </p>
                  </div>
                </>
              )}

              {stage === "confirming" && (
                <div className="py-8 text-center">
                  <div className="relative w-14 h-14 mx-auto mb-5">
                    <Loader2 className="w-14 h-14 text-lime-400 animate-spin" />
                    {isReal && (
                      <Radio
                        className="w-5 h-5 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    )}
                  </div>
                  <h3 className="font-black text-xl text-white">
                    {isReal ? "Anchoring settlement on Horizon…" : "Broadcasting transaction…"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {isReal ?
                      "Freighter signatures submit to whichever Stellar passphrase ROOTCHAIN is routing."
                    : "Awaiting simulated confirmation"}
                  </p>
                </div>
              )}

              {stage === "success" && txRecord && (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-500/20 border border-lime-500/40 flex items-center justify-center"
                    style={{ boxShadow: "0 0 40px rgba(132,204,22,0.4)" }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-lime-400" />
                  </motion.div>
                  <h3 className="font-black text-xl text-white">Investment Confirmed</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    You now own {shares.toFixed(1)} shares of {item.id}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-line">
                    <span className="font-mono text-[11px] text-lime-300">
                      {shortHash(txRecord.hash)}
                    </span>
                    <a
                      href={
                        txRecord.hash !== "failed" ? explorerTxUrl(txRecord.hash) : "#"
                      }
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`text-slate-500 hover:text-white ${txRecord.hash === "failed" ? "pointer-events-none opacity-40" : ""}`}
                      aria-label="Open in explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Btn variant="ghost" onClick={reset}>
                      Done
                    </Btn>
                    <Btn variant="outline" onClick={handleViewTx}>
                      View receipt
                    </Btn>
                  </div>
                </div>
              )}

              {stage === "error" && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="font-black text-xl text-white">Investment failed</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                    {errorMessage ?? "Please try again."}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Btn variant="ghost" onClick={reset}>
                      Cancel
                    </Btn>
                    <Btn
                      variant="primary"
                      onClick={() => {
                        setErrorMessage(null);
                        setStage("form");
                      }}
                    >
                      Try again
                    </Btn>
                  </div>
                </div>
              )}
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
