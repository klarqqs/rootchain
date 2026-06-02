import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Unlink2,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SendModal, type WalletAction } from "@/features/wallet/send-modal";
import { useWallet } from "@/hooks/use-wallet";
import { useTrustline } from "@/hooks/use-trustline";
import { useTransactionsStore } from "@/store/transactions.store";
import { explorerAccountUrl, activeNetworkLabel, explorerTxUrl } from "@/lib/stellar/config";
import { canExecuteReal } from "@/services/tx-dispatch";
import { cn, formatUsd, truncateAddr } from "@/lib/utils";
import type { TxRecord } from "@/types/transaction";

interface WalletPageProps {
  walletConnected: boolean;
  onConnectWallet: () => void;
  onTxClick?: (hash: string) => void;
}

export function WalletPage({ walletConnected, onConnectWallet, onTxClick }: WalletPageProps) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [composer, setComposer] = useState<{ open: boolean; action: WalletAction }>({ open: false, action: "send" });

  const { account, balances, totalUsd, refresh, isConnected, disconnectWallet } = useWallet();
  const [disconnecting, setDisconnecting] = useState(false);
  const records = useTransactionsStore((s) => s.records);
  const { status: tlStatus, check: checkTrustline, addUsdc } = useTrustline();
  const isRealWallet = canExecuteReal();

  // Auto-refresh balances and check trustline when this page is opened.
  useEffect(() => {
    if (walletConnected) {
      refresh();
      if (isRealWallet) checkTrustline();
    }
  }, [walletConnected, refresh, isRealWallet, checkTrustline]);

  const xlmBalance = balances.find((b) => b.symbol === "XLM");
  const usdcBalance = balances.find((b) => b.symbol === "USDC");

  const copy = () => {
    if (!account) return;
    navigator.clipboard?.writeText(account.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const doRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await disconnectWallet();
    setDisconnecting(false);
  };

  if (!isConnected || !walletConnected || !account) {
    return (
      <div className="pb-16">
        <Glass className="p-12 text-center max-w-xl mx-auto" glow>
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #84CC16, #166534)",
              boxShadow: "0 0 40px rgba(132,204,22,0.4)",
            }}
          >
            <Wallet className="w-8 h-8 text-black" strokeWidth={2.4} />
          </div>
          <h3 className="font-black text-2xl text-white">No wallet connected</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Connect Freighter or LOBSTR to view balances and sign Stellar transactions.
          </p>
          <div className="mt-6">
            <Btn variant="primary" icon={Wallet} size="lg" onClick={onConnectWallet}>
              Connect Wallet
            </Btn>
          </div>
        </Glass>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 pb-16">
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Balance hero */}
          <Glass className="lg:col-span-8 p-6 relative overflow-hidden" glow elevated>
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-30"
              style={{ background: "radial-gradient(circle, rgba(132,204,22,0.4), transparent 60%)" }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill color="lime" dot>
                    {activeNetworkLabel()}
                  </Pill>
                  <Pill color="ash">{account.label ?? account.provider}</Pill>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHidden((h) => !h)}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                    aria-label="Toggle balance visibility"
                  >
                    {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={doRefresh}
                    disabled={refreshing}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-60"
                    aria-label="Refresh balances"
                  >
                    {refreshing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-500">
                Total Balance
              </div>
              <div className="font-black text-5xl lg:text-6xl text-white tracking-tight tabular-nums mt-1 leading-none">
                {hidden ? (
                  <span className="text-slate-700">••••••••</span>
                ) : (
                  <>
                    $<AnimatedCounter value={totalUsd} decimals={2} />
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Live balances from Stellar Horizon · {activeNetworkLabel()}
              </p>

              {/* Address row */}
              <div className="mt-5 flex items-center gap-2 max-w-full">
                <button
                  onClick={copy}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line bg-black/30 hover:border-lime-500/30 transition group max-w-full"
                >
                  <span className="font-mono text-xs text-white truncate">
                    {truncateAddr(account.publicKey, 14, 6)}
                  </span>
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
                  )}
                </button>
                <button
                  className="p-2 rounded-xl border border-line bg-black/30 hover:border-lime-500/30 transition"
                  aria-label="Show QR"
                >
                  <QrCode className="w-4 h-4 text-slate-300" />
                </button>
                <a
                  href={explorerAccountUrl(account.publicKey)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-2 rounded-xl border border-line bg-black/30 hover:border-lime-500/30 transition"
                  aria-label="Open account on explorer"
                >
                  <ExternalLink className="w-4 h-4 text-slate-300" />
                </a>
              </div>

              <div className="mt-4">
                <Btn
                  variant="outline"
                  size="sm"
                  icon={Unlink2}
                  loading={disconnecting}
                  onClick={() => void handleDisconnect()}
                  className="!border-rose-500/30 !text-rose-200 hover:!bg-rose-500/10 hover:!text-rose-100"
                >
                  Disconnect Wallet
                </Btn>
              </div>

              {/* Phase 3 banners — trustline on any live ledger; Friendbot only on testnet */}
              {isRealWallet && (
                <div className="mt-4 space-y-2">
                  {tlStatus === "no-usdc" && (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/[0.06]">
                      <div className="text-xs text-sky-200 flex items-center gap-2">
                        <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                        No USDC trustline — add to receive USDC
                      </div>
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={addUsdc}
                        className="shrink-0 !text-sky-200 hover:!text-white"
                      >
                        Add USDC
                      </Btn>
                    </div>
                  )}
                  {tlStatus === "has-usdc" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-lime-500/20 bg-lime-500/[0.04]">
                      <BadgeCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <span className="text-[11px] text-lime-300 font-bold">USDC trustline active</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.04]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[11px] text-violet-300 font-bold">
                      Stellar Mainnet · verify every signature in your wallet before approving.
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Btn
                  variant="primary"
                  icon={Send}
                  fullWidth
                  onClick={() => setComposer({ open: true, action: "send" })}
                >
                  Send
                </Btn>
                <Btn variant="ghost" icon={ArrowDownLeft} fullWidth onClick={copy}>
                  Receive
                </Btn>
                <Btn
                  variant="ghost"
                  icon={Plus}
                  fullWidth
                  onClick={() => setComposer({ open: true, action: "deposit" })}
                >
                  Deposit
                </Btn>
                <Btn variant="ghost" icon={Link2} fullWidth>
                  Bridge
                </Btn>
              </div>
            </div>
          </Glass>

          {/* On-chain asset snapshot */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            <Glass className="p-4">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">XLM</div>
              <div className="font-black text-2xl text-white tabular-nums mt-1">
                {(xlmBalance?.amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 7 })}
              </div>
              <div className="text-xs text-slate-500 font-bold mt-1">Native lumen</div>
            </Glass>
            <Glass className="p-4">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">USDC</div>
              <div className="font-black text-2xl text-white tabular-nums mt-1">
                {(usdcBalance?.amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 font-bold mt-1">Circle USDC on Stellar</div>
            </Glass>
            <Glass className="p-4 col-span-2 lg:col-span-1">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Network</div>
              <div className="font-black text-lg text-white mt-1">{activeNetworkLabel()}</div>
              <div className="text-xs text-lime-400 font-bold mt-1">On-chain balances only</div>
            </Glass>
          </div>
        </div>

        {/* Assets + tx history */}
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Assets */}
          <Glass className="lg:col-span-5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-white tracking-tight">Assets</h3>
              <Pill color="ash">XLM + USDC</Pill>
            </div>
            <div className="space-y-2">
              {balances.map((a, i) => (
                <motion.div
                  key={a.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-lime-500/20 transition group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                    style={{
                      background: `${a.color}22`,
                      color: a.color,
                      border: `1px solid ${a.color}40`,
                    }}
                  >
                    {a.icon || a.symbol.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-white">{a.symbol}</div>
                      <span
                        className={cn(
                          "text-[10px] font-bold tabular-nums",
                          a.chg24h >= 0 ? "text-lime-400" : "text-rose-400",
                        )}
                      >
                        {a.chg24h >= 0 ? "+" : ""}
                        {a.chg24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {a.issuer ? truncateAddr(a.issuer, 6, 4) : "Native"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-white tabular-nums">
                      {a.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      {formatUsd(a.usdValue)}
                    </div>
                  </div>
                </motion.div>
              ))}
              {balances.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500">
                  No balances yet — fund this account to see assets here.
                </div>
              )}
            </div>
            <button className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-lime-500/30 hover:bg-lime-500/[0.04] text-xs font-bold text-slate-400 hover:text-lime-300 transition flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Asset
            </button>
          </Glass>

          {/* Tx history */}
          <Glass className="lg:col-span-7 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-white tracking-tight">Recent Activity</h3>
              <Pill color="emerald" dot>
                {records.length} on chain
              </Pill>
            </div>
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1 -mr-1">
              {records.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  No transactions yet — invest in a harvest to see activity here.
                </div>
              ) : (
                records.map((tx, i) => (
                  <TransactionRow key={tx.hash} tx={tx} index={i} onClick={onTxClick} />
                ))
              )}
            </div>
          </Glass>
        </div>
      </div>

      <SendModal
        open={composer.open}
        action={composer.action}
        onClose={() => setComposer({ open: false, action: composer.action })}
        onTxComplete={onTxClick}
      />
    </>
  );
}

function TransactionRow({
  tx,
  index,
  onClick,
}: {
  tx: TxRecord;
  index: number;
  onClick?: (hash: string) => void;
}) {
  const isOutbound = tx.kind === "INVEST" || tx.kind === "TRANSFER" || tx.kind === "WITHDRAW";
  const isPending = tx.status === "pending" || tx.status === "broadcasting" || tx.status === "signing" || tx.status === "building";
  const hashClean = tx.hash.replace(/^0x/i, "").toLowerCase();
  const showExplorer = tx.status === "confirmed" && tx.hash !== "failed" && /^[a-f0-9]{64}$/.test(hashClean);
  const amountPrimary =
    tx.paymentPresentation === "native_xlm"
      ? `${tx.amount.toLocaleString("en-US", { maximumFractionDigits: 7 })} XLM`
      : formatUsd(tx.amount);

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick?.(tx.hash)}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition group text-left"
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
          isOutbound
            ? "bg-lime-500/10 border-lime-500/20"
            : "bg-emerald-500/10 border-emerald-500/20",
        )}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        ) : isOutbound ? (
          <ArrowUpRight className="w-4 h-4 text-lime-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
          {tx.kind}
          {showExplorer && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                Ledger
              </span>
            </>
          )}
          {tx.produceId && (
            <>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{tx.produceId}</span>
            </>
          )}
          {tx.status === "confirmed" && <CheckCircle2 className="w-3 h-3 text-lime-400" />}
          {isPending && (
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
              {tx.status}
            </span>
          )}
        </div>
        <div className="font-mono text-[10px] text-slate-500 truncate">
          {hashClean.slice(0, 10)}…{hashClean.slice(-6)}
        </div>
      </div>
      <div className="text-right shrink-0 max-w-[40%]">
        <div className="font-bold text-sm text-white tabular-nums">{amountPrimary}</div>
        {tx.paymentPresentation === "native_xlm" && typeof tx.usdNotional === "number" ? (
          <div className="text-[10px] text-slate-600">{formatUsd(tx.usdNotional)} ≈ USD</div>
        ) : typeof tx.chainAmountXlm === "number" ? (
          <div className="text-[10px] text-violet-300 tabular-nums">{tx.chainAmountXlm.toFixed(4)} XLM</div>
        ) : (
          <div className="text-[10px] text-slate-600">fee {tx.fee.toFixed(6)} XLM</div>
        )}
        <div className="text-[10px] text-slate-600">{relativeTime(tx.createdAt)}</div>
      </div>
      {showExplorer ? (
        <a
          href={explorerTxUrl(tx.hash)}
          target="_blank"
          rel="noreferrer noopener"
          className="p-1 rounded-md text-slate-600 hover:text-lime-300 shrink-0"
          aria-label="View on Stellar explorer"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : (
        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 shrink-0" />
      )}
    </motion.button>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
