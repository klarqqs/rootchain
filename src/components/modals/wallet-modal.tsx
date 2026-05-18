import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Lock, Wallet, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { WALLET_PROVIDERS, type WalletProvider } from "@/data/wallet";
import { WalletIcon } from "@/components/wallet/wallet-icon";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletStore } from "@/store/wallet.store";
import { truncateAddr } from "@/lib/utils";
import {
  ENV_STELLAR_NETWORK,
  MAINNET_ROUTING_ENABLED,
  activeIsPublicNetwork,
  activeNetworkLabel,
} from "@/lib/stellar/config";
import { useStellarRuntimeStore } from "@/store/stellar-runtime.store";
import type { StellarNetwork } from "@/types/wallet";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

type Step = "choose" | "connecting" | "success" | "error";

export function WalletModal({ open, onClose, onConnect }: WalletModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { connect: doConnect, account } = useWallet();
  const userNetworkOverride = useStellarRuntimeStore((s) => s.userNetworkOverride);
  const setUserNetworkOverride = useStellarRuntimeStore((s) => s.setUserNetworkOverride);

  const connect = async (w: WalletProvider) => {
    setProvider(w);
    setErrorMessage(null);
    setStep("connecting");
    const success = await doConnect(w.id);
    if (success) {
      setStep("success");
      setTimeout(() => {
        onConnect();
        onClose();
        setStep("choose");
      }, 1100);
    } else {
      setErrorMessage(useWalletStore.getState().lastError);
      setStep("error");
    }
  };

  const reset = () => {
    setStep("choose");
    setProvider(null);
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
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
              {step === "choose" && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Pill color="lime" icon={Wallet}>
                          Connect Wallet
                        </Pill>
                        <Pill color="emerald" dot>
                          {activeNetworkLabel()}
                        </Pill>
                      </div>
                      <h3 className="font-black text-2xl text-white tracking-tight mt-2">
                        Link your wallet.
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Freighter signs real Horizon operations aligned to whichever ledger ROOTCHAIN routes (see ledger control below).
                        Other providers simulate flows for onboarding.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/5 -mt-1 -mr-1"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {WALLET_PROVIDERS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => connect(w)}
                        className="w-full p-3 rounded-xl border border-line bg-white/[0.02] hover:bg-white/[0.05] hover:border-lime-500/30 transition flex items-center gap-3 group focus-ring"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5"
                          style={{ background: `${w.color}10` }}
                        >
                          <WalletIcon provider={w} size={28} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                            {w.name}
                            {w.recommended && (
                              <span className="px-1.5 py-0.5 rounded-md bg-lime-500/15 text-lime-300 text-[9px] font-bold tracking-wider uppercase">
                                Recommended
                              </span>
                            )}
                            {w.popular && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[9px] font-bold tracking-wider uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{w.desc}</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                          {w.type}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-lime-400 transition shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-line space-y-3">
                    {MAINNET_ROUTING_ENABLED ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white">
                            Horizon ledger
                          </span>
                          {activeIsPublicNetwork() ? (
                            <span className="text-[10px] font-bold text-amber-300 uppercase">Real funds zone</span>
                          ) : null}
                        </div>
                        <label className="sr-only" htmlFor="stellar-runtime-select">
                          Select Stellar Horizon network routing
                        </label>
                        <select
                          id="stellar-runtime-select"
                          className="w-full bg-black/40 border border-line rounded-xl px-2 py-2 text-xs font-bold text-white outline-none focus-ring"
                          value={userNetworkOverride === null ? "__env__" : userNetworkOverride}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__env__") setUserNetworkOverride(null);
                            else setUserNetworkOverride(val as StellarNetwork);
                          }}
                        >
                          <option value="__env__">Follow build (.env · {ENV_STELLAR_NETWORK})</option>
                          <option value="TESTNET">Always Stellar Testnet</option>
                          {MAINNET_ROUTING_ENABLED ? (
                            <option value="PUBLIC">Stellar Public (real funds)</option>
                          ) : null}
                          <option value="FUTURENET">Futurenet (experiments)</option>
                        </select>
                        <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                          Match Freighter&apos;s passphrase to{" "}
                          <span className="text-lime-200">{activeNetworkLabel()}</span> before signing.
                          Public ledger routes require operators to configure escrow + issuers independently.
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-400/25 bg-blue-400/[0.05] px-3 py-2 text-[11px] text-blue-50">
                        Ledger switching is pinned to TESTNET unless{" "}
                        <code className="text-[10px] text-lime-200">VITE_MAINNET_ROUTING_ENABLED=true</code> is baked into the build — keeping pilots safe prior to escrow partners signing off.
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        We never store your seed phrase. Connections are non-custodial — signatures only authorize flows you approve in Freighter.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {step === "connecting" && provider && (
                <div className="py-8 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-lime-400/30 border-t-lime-400"
                    />
                    <div
                      className="absolute inset-3 rounded-full flex items-center justify-center"
                      style={{ background: `${provider.color}10` }}
                    >
                      <WalletIcon provider={provider} size={36} />
                    </div>
                  </div>
                  <h3 className="font-black text-xl text-white">
                    Connecting to {provider.name}…
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Approve the connection in your wallet.
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full bg-lime-500/20 border border-lime-500/40 flex items-center justify-center"
                    style={{ boxShadow: "0 0 40px rgba(132,204,22,0.4)" }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-lime-400" />
                  </motion.div>
                  <h3 className="font-black text-xl text-white">Wallet Connected</h3>
                  <p className="font-mono text-xs text-slate-500 mt-1">
                    {account ? truncateAddr(account.publicKey, 8, 6) : "—"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Routed through {activeNetworkLabel()}
                  </p>
                </div>
              )}

              {step === "error" && provider && (
                <div className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center"
                  >
                    <AlertTriangle className="w-9 h-9 text-rose-400" />
                  </motion.div>
                  <h3 className="font-black text-xl text-white">
                    Couldn&apos;t connect to {provider.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                    {errorMessage ?? "Please try again or pick another wallet."}
                  </p>
                  <div className="mt-5 flex gap-2 justify-center">
                    <button
                      onClick={reset}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10"
                    >
                      Try another wallet
                    </button>
                    <button
                      onClick={() => connect(provider)}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-sm font-bold"
                    >
                      Retry
                    </button>
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
