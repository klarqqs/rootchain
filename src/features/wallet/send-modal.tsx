/**
 * Send / Deposit composer modal.
 * Sits inside /features because it's a wallet-feature-specific surface.
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Send,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { useWallet } from "@/hooks/use-wallet";
import { transactionService } from "@/services";
import { canExecuteReal } from "@/services/tx-dispatch";
import { explorerTxUrl, activeIsPublicNetwork } from "@/lib/stellar/config";
import { USDC_XLM_RATE } from "@/lib/stellar/tx-executor";
import { shortHash } from "@/utils/hash";
import type { TxPaymentPresentation, TxRecord } from "@/types/transaction";
import { tokens } from "@/lib/tokens";

export type WalletAction = "send" | "deposit";

interface SendModalProps {
  open: boolean;
  action: WalletAction;
  onClose: () => void;
  onTxComplete?: (hash: string) => void;
}

type Stage = "form" | "submitting" | "success" | "error";

const ACTION_META = {
  send: { title: "Send", icon: Send, ctaIcon: Zap, cta: "Sign & Send" },
  deposit: { title: "Deposit USDC", icon: ArrowDownLeft, ctaIcon: Plus, cta: "Confirm Deposit" },
} as const;

const FEE_BUFFER_XLM = 0.025;

export function SendModal({ open, action, onClose, onTxComplete }: SendModalProps) {
  const meta = ACTION_META[action];
  const ActionIcon = meta.icon;
  const CtaIcon = meta.ctaIcon;

  const [amount, setAmount] = useState<number>(50);
  const [destination, setDestination] = useState("");
  const [memo, setMemo] = useState("");
  const [sendPresentation, setSendPresentation] = useState<TxPaymentPresentation>("usd_notional");
  const [stage, setStage] = useState<Stage>("form");
  const [record, setRecord] = useState<TxRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isConnected, balances } = useWallet();
  const ledgerPath = canExecuteReal();

  const usdc = balances.find((b) => b.symbol === "USDC" || b.asset === "USDC");
  const xlm = balances.find((b) => b.symbol === "XLM" || b.asset === "XLM");

  const usdcBal = usdc?.amount ?? 0;
  const xlmBal = xlm?.amount ?? 0;

  const chainXlmEstimate =
    action === "deposit"
      ? amount / USDC_XLM_RATE
      : sendPresentation === "usd_notional"
        ? amount / USDC_XLM_RATE
        : amount;

  const insufficient = useMemo(() => {
    if (!isConnected) return false;
    if (action === "deposit") {
      if (ledgerPath) return xlmBal < chainXlmEstimate + FEE_BUFFER_XLM;
      return amount > usdcBal;
    }
    if (sendPresentation === "native_xlm") return amount > xlmBal - FEE_BUFFER_XLM;
    if (ledgerPath) return xlmBal < chainXlmEstimate + FEE_BUFFER_XLM;
    return amount > usdcBal;
  }, [
    action,
    amount,
    chainXlmEstimate,
    isConnected,
    ledgerPath,
    sendPresentation,
    usdcBal,
    xlmBal,
  ]);

  const submit = async () => {
    if (!isConnected) {
      setErrorMessage("Connect a wallet first.");
      setStage("error");
      return;
    }
    if (action === "send" && destination.trim().length < 10) {
      setErrorMessage("Enter a valid destination address.");
      setStage("error");
      return;
    }
    if (insufficient) {
      setErrorMessage(
        ledgerPath
          ? `Not enough lumens including fees. Need roughly ${chainXlmEstimate.toFixed(4)} XLM (plus reserve). Available ${xlmBal.toFixed(4)} XLM.`
          : sendPresentation === "native_xlm"
            ? `Insufficient native XLM. Available ${xlmBal.toFixed(4)} XLM.`
            : `Insufficient mock USDC. Available ${usdcBal.toFixed(2)}.`,
      );
      setStage("error");
      return;
    }

    setStage("submitting");
    const tx =
      action === "send"
        ? transactionService.submitTransfer({
            destination: destination.trim(),
            amount,
            memo: memo.trim() || undefined,
            paymentPresentation: sendPresentation,
          })
        : transactionService.submitDeposit({ amount, memo: memo.trim() || undefined });

    const final = await tx.finalized;
    setRecord(final);
    setStage(final.status === "confirmed" ? "success" : "error");
    if (final.status !== "confirmed") {
      setErrorMessage(final.memo ?? "Transaction failed.");
    }
  };

  const close = () => {
    setAmount(50);
    setDestination("");
    setMemo("");
    setStage("form");
    setRecord(null);
    setErrorMessage(null);
    setSendPresentation("usd_notional");
    onClose();
  };

  const handleViewTx = () => {
    if (record) onTxComplete?.(record.hash);
    close();
  };

  const denomLabel =
    action === "deposit"
      ? "USDC"
      : sendPresentation === "native_xlm"
        ? "XLM"
        : "USDC (notional)";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={close}
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
                      <Pill color="lime" icon={ActionIcon}>
                        {meta.title}
                      </Pill>
                      {ledgerPath && (
                        <Pill color="purple">
                          Horizon live
                        </Pill>
                      )}
                    </div>
                    <button onClick={close} className="p-2 rounded-lg hover:bg-white/5">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {action === "send" && ledgerPath && (
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSendPresentation("usd_notional")}
                        className={`flex-1 text-[11px] font-black uppercase rounded-xl border px-2 py-2 transition ${
                          sendPresentation === "usd_notional"
                            ? "border-lime-500/60 bg-lime-500/10 text-lime-200"
                            : "border-white/10 text-slate-500 hover:border-white/20"
                        }`}
                      >
                        USDC notion
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendPresentation("native_xlm")}
                        className={`flex-1 text-[11px] font-black uppercase rounded-xl border px-2 py-2 transition ${
                          sendPresentation === "native_xlm"
                            ? "border-violet-500/60 bg-violet-500/10 text-violet-200"
                            : "border-white/10 text-slate-500 hover:border-white/20"
                        }`}
                      >
                        Native XLM
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {action === "send" && (
                      <div>
                        <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1.5">
                          Destination Address (Stellar G-key)
                        </label>
                        <input
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="GAXX…XXXX"
                          className="w-full bg-black/40 border-2 border-line-strong rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-lime-500/50 transition placeholder:text-slate-700"
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                          Amount
                        </label>
                        {isConnected && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 text-right leading-tight max-w-[60%]">
                            {ledgerPath ? (
                              <>
                                {`${xlmBal.toLocaleString("en-US", { maximumFractionDigits: 4 })} XLM`}
                                <span className="text-slate-600 mx-1">·</span>
                                {`${usdcBal.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD row`}
                              </>
                            ) : (
                              <>
                                {sendPresentation === "native_xlm"
                                  ? `${xlmBal.toFixed(4)} XLM`
                                  : `${usdcBal.toFixed(2)} demo USDC`}
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
                          className="w-full bg-black/40 border-2 rounded-2xl px-5 py-4 text-2xl font-black text-white outline-none focus:border-lime-500/50 transition tabular-nums"
                          style={{ borderColor: insufficient ? "#F87171" : tokens.lineStrong }}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lime-400 font-black text-lg">
                          {denomLabel}
                        </span>
                      </div>
                      {ledgerPath && (
                        <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
                          Freighter settles in native XLM.{" "}
                          {action === "deposit" || sendPresentation === "usd_notional"
                            ? `Roughly ${chainXlmEstimate.toFixed(4)} XLM for this notional (${USDC_XLM_RATE} ≈ FX).`
                            : "Amount is denominated entirely in lumens plus the base fee."}
                        </p>
                      )}
                      {insufficient && (
                        <div className="mt-2 text-[11px] text-rose-300 font-bold leading-snug">
                          Amount exceeds what this wallet can broadcast right now (include fees + reserves).
                        </div>
                      )}
                      {/* Quick amount presets — use small amounts on public network */}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {(sendPresentation === "native_xlm" ? [1, 2, 5, 10] : [5, 10, 25, 50]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setAmount(v)}
                            className="flex-1 min-w-[72px] py-1.5 rounded-lg text-xs font-bold bg-white/[0.03] hover:bg-lime-500/10 text-slate-300 hover:text-lime-300 border border-white/5 transition"
                          >
                            {sendPresentation === "native_xlm" ? `${v} XLM` : `$${v}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1.5">
                        Memo (optional)
                      </label>
                      <input
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Note for recipient / deposit tag"
                        className="w-full bg-black/40 border-2 border-line-strong rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-lime-500/50 transition placeholder:text-slate-700"
                      />
                    </div>

                    <Glass className="p-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Network Fee</span>
                        <span className="font-bold text-white">&lt; 0.0001 XLM (exact in receipt)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Settlement</span>
                        <span className="font-bold text-white">
                          {activeIsPublicNetwork() ? "&lt;5s median on Stellar" : "&lt;5s median on testnet"}
                        </span>
                      </div>
                    </Glass>

                    <Btn
                      variant="primary"
                      icon={CtaIcon}
                      fullWidth
                      onClick={submit}
                      disabled={amount <= 0 || (action === "send" && !destination.trim()) || insufficient}
                    >
                      {meta.cta}
                    </Btn>
                  </div>
                </>
              )}

              {stage === "submitting" && (
                <div className="py-10 text-center">
                  <Loader2 className="w-12 h-12 text-lime-400 mx-auto mb-4 animate-spin" />
                  <h3 className="font-black text-xl text-white">Broadcasting transaction…</h3>
                  <p className="text-sm text-slate-500 mt-1">Approve the signature prompt if Freighter asks</p>
                </div>
              )}

              {stage === "success" && record && (
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
                  <h3 className="font-black text-xl text-white">{record.kind} Confirmed</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {record.paymentPresentation === "native_xlm"
                      ? `${amount.toLocaleString()} XLM routed on-chain`
                      : `${amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })} USDC notional (≈ ${(record.chainAmountXlm ?? chainXlmEstimate).toFixed(4)} XLM)`}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-line">
                    <span className="font-mono text-[11px] text-lime-300">
                      {shortHash(record.hash)}
                    </span>
                    {record.status === "confirmed" && record.hash !== "failed" ? (
                      <a
                        href={explorerTxUrl(record.hash)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-slate-500 hover:text-white"
                        aria-label="Open in explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Btn variant="ghost" onClick={close}>
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
                  <h3 className="font-black text-xl text-white">Transaction failed</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">{errorMessage ?? "Please try again."}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Btn variant="ghost" onClick={close}>
                      Cancel
                    </Btn>
                    <Btn variant="primary" onClick={() => setStage("form")}>
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
