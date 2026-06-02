import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, DollarSign, Loader2, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { submitMarketplaceInvestment } from "@/database/services/marketplace-investment.service";
import {
  createApiInvestment,
  executeApiInvestment,
  investmentsUseApi,
} from "@/services/investment-api.service";
import { useWallet } from "@/hooks/use-wallet";
import { getIdentityUserId } from "@/store/identity.store";
import { useNotificationsStore } from "@/store/notifications.store";
import type { MarketplaceListing } from "@/types/marketplace";
import { formatUsd, truncateAddr } from "@/lib/utils";

type Stage = "form" | "submitting" | "signing" | "confirmed" | "pending" | "error";

interface ProjectInvestModalProps {
  open: boolean;
  listing: MarketplaceListing | null;
  onClose: () => void;
  onSuccess?: () => void;
  onConnectWallet?: () => void;
}

export function ProjectInvestModal({
  open,
  listing,
  onClose,
  onSuccess,
  onConnectWallet,
}: ProjectInvestModalProps) {
  const [amount, setAmount] = useState(500);
  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultTxHash, setResultTxHash] = useState<string | null>(null);

  const userId = getIdentityUserId();
  const notify = useNotificationsStore((s) => s.push);
  const { isConnected, account } = useWallet();

  const projectActive = listing?.status === "active";
  const walletAddress = account?.publicKey ?? null;
  const useApi = investmentsUseApi();

  useEffect(() => {
    if (!open) {
      setStage("form");
      setErrorMessage(null);
      setResultTxHash(null);
      setAmount(500);
    }
  }, [open]);

  const close = () => {
    if (stage === "submitting" || stage === "signing") return;
    onClose();
  };

  const submit = async () => {
    if (!listing) return;

    if (!userId) {
      notify({
        tone: "error",
        title: "Sign in required",
        description: "Authenticate before investing in a marketplace project.",
        duration: 5000,
      });
      return;
    }

    if (!isConnected || !walletAddress) {
      notify({
        tone: "info",
        title: "Wallet required",
        description: "Connect Freighter or LOBSTR to invest on RootChain.",
        duration: 5000,
      });
      onConnectWallet?.();
      return;
    }

    if (!projectActive) {
      setErrorMessage("This project is not accepting investments.");
      setStage("error");
      return;
    }

    if (amount <= 0) {
      setErrorMessage("Investment amount must be greater than zero.");
      setStage("error");
      return;
    }

    setStage("submitting");
    setErrorMessage(null);

    try {
      if (useApi) {
        const { investmentId } = await createApiInvestment({
          projectId: listing.id,
          amount,
          walletAddress,
        });

        setStage("signing");
        const executed = await executeApiInvestment({
          investmentId,
          projectId: listing.id,
          amount,
          walletAddress,
        });

        if (!executed.ok) {
          setErrorMessage(executed.error);
          setStage("error");
          notify({ tone: "error", title: "On-chain failed", description: executed.error, duration: 6000 });
          return;
        }

        setResultTxHash(executed.hash);
        setStage("confirmed");
        notify({
          tone: "success",
          title: "Investment confirmed",
          description: `${formatUsd(amount)} USDC settled on Stellar.`,
          duration: 6000,
        });
        onSuccess?.();
        return;
      }

      const res = await submitMarketplaceInvestment({
        userId,
        projectId: listing.id,
        amount,
        walletAddress,
        projectTitle: listing.title,
      });

      if (!res.ok) {
        setErrorMessage(res.error);
        setStage("error");
        notify({ tone: "error", title: "Investment failed", description: res.error, duration: 6000 });
        return;
      }

      setResultTxHash(res.value.transactionId);
      setStage("pending");
      notify({
        tone: "success",
        title: "Investment pending",
        description: `${formatUsd(amount)} recorded for ${listing.title}.`,
        duration: 6000,
      });
      onSuccess?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Investment failed";
      setErrorMessage(msg);
      setStage("error");
      notify({ tone: "error", title: "Investment failed", description: msg, duration: 6000 });
    }
  };

  return (
    <AnimatePresence>
      {open && listing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="p-6" glow elevated>
              <div className="flex items-center justify-between mb-4">
                <Pill color="lime" icon={DollarSign}>
                  Invest in project
                </Pill>
                <button
                  type="button"
                  onClick={close}
                  disabled={stage === "submitting" || stage === "signing"}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <h3 className="font-black text-xl text-white">{listing.title}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {listing.farmer.name} · {formatUsd(listing.raisedAmount)} /{" "}
                {formatUsd(listing.targetAmount)} raised
              </p>

              {stage === "form" && (
                <>
                  {!isConnected && (
                    <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
                      Connect a Stellar wallet. Settlement is USDC to RootChain escrow with on-chain verification.
                    </div>
                  )}

                  {isConnected && walletAddress && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                      <Wallet className="w-3.5 h-3.5 text-lime-400" />
                      Connected:{" "}
                      <span className="font-mono text-slate-300">
                        {truncateAddr(walletAddress, 8, 6)}
                      </span>
                    </div>
                  )}

                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex flex-col gap-1">
                    Amount (USDC)
                    <input
                      type="number"
                      min={1}
                      step={50}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      disabled={!projectActive}
                      className="bg-black/40 border border-line rounded-xl px-3 py-2 text-white font-semibold outline-none focus-ring disabled:opacity-50"
                    />
                  </label>

                  {!isConnected ? (
                    <Btn variant="primary" className="w-full mt-5" icon={Wallet} onClick={() => onConnectWallet?.()}>
                      Connect wallet
                    </Btn>
                  ) : (
                    <Btn
                      variant="primary"
                      className="w-full mt-5"
                      disabled={!projectActive || amount <= 0}
                      onClick={() => void submit()}
                    >
                      {useApi ? "Sign & invest on-chain" : "Confirm investment"}
                    </Btn>
                  )}
                </>
              )}

              {(stage === "submitting" || stage === "signing") && (
                <div className="py-8 text-center">
                  <Loader2 className="w-10 h-10 text-lime-400 mx-auto mb-3 animate-spin" />
                  <p className="font-bold text-white">
                    {stage === "signing" ? "Signing USDC payment…" : "Creating investment record…"}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {stage === "signing"
                      ? "Approve the transaction in your wallet extension."
                      : "Reserving allocation and preparing Stellar envelope."}
                  </p>
                </div>
              )}

              {stage === "confirmed" && (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-lime-400 mx-auto mb-3" />
                  <p className="font-black text-lg text-white">Investment confirmed</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {formatUsd(amount)} USDC · verified on Stellar
                  </p>
                  {resultTxHash && (
                    <p className="text-[10px] font-mono text-emerald-400 mt-3 truncate">{resultTxHash}</p>
                  )}
                  <Btn variant="outline" className="w-full mt-5" onClick={close}>
                    Done
                  </Btn>
                </div>
              )}

              {stage === "pending" && (
                <div className="py-6 text-center">
                  <Clock className="w-10 h-10 text-amber-300 mx-auto mb-3" />
                  <p className="font-black text-lg text-white">Investment pending</p>
                  <p className="text-xs text-slate-500 mt-3">
                    Record saved — complete Stellar settlement when API backend is enabled.
                  </p>
                  <Btn variant="outline" className="w-full mt-5" onClick={close}>
                    Done
                  </Btn>
                </div>
              )}

              {stage === "error" && (
                <div className="py-6 text-center">
                  <p className="font-bold text-rose-200">Could not complete investment</p>
                  <p className="text-xs text-slate-400 mt-2">{errorMessage}</p>
                  <div className="flex gap-2 mt-5">
                    <Btn variant="outline" className="flex-1" onClick={close}>
                      Close
                    </Btn>
                    <Btn variant="primary" className="flex-1" onClick={() => setStage("form")}>
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
