import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Link2,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { QRPattern } from "@/components/produce/qr-pattern";
import { PRODUCE_DATA } from "@/data/produce";
import { TX_HISTORY, VERIFICATION_TIMELINE } from "@/data/wallet";
import { cn } from "@/lib/utils";

export function VerificationPage() {
  const [selected, setSelected] = useState(PRODUCE_DATA[0]);
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left: produce list */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 px-2 pb-2">
            On-chain Assets
          </div>
          {PRODUCE_DATA.slice(0, 6).map((p) => {
            const active = selected.id === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left transition-all focus-ring",
                  active
                    ? "bg-lime-500/10 border-lime-500/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: p.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm truncate">{p.id}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.name}</div>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-lime-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center: QR + ownership */}
        <div className="lg:col-span-5 space-y-5">
          <Glass className="p-6" glow>
            <div className="flex items-start justify-between mb-5 gap-3">
              <div className="min-w-0">
                <Pill color="lime" icon={ShieldCheck}>
                  BLOCKCHAIN VERIFIED
                </Pill>
                <h3 className="font-black text-2xl text-white mt-3 tracking-tight">
                  {selected.name}
                </h3>
                <div className="text-sm text-slate-400 mt-1 truncate">
                  {selected.farm} · {selected.location}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                  Token ID
                </div>
                <div className="font-mono font-black text-lime-400">{selected.id}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="relative p-3 rounded-2xl border border-line-strong"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <div className="w-44 h-44">
                  <QRPattern seed={selected.id} size={176} />
                </div>
                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #84CC16, #166534)",
                    boxShadow: "0 0 20px rgba(132,204,22,0.5)",
                  }}
                >
                  <Sprout className="w-5 h-5 text-black" strokeWidth={3} />
                </div>
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1">
                    Contract Address
                  </div>
                  <button
                    onClick={() => copy(selected.hash)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/30 border border-line hover:border-lime-500/30 transition group"
                  >
                    <span className="font-mono text-xs text-white truncate">
                      {selected.hash.slice(0, 16)}…{selected.hash.slice(-4)}
                    </span>
                    {copied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 rounded-lg bg-black/30 border border-line">
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      Owners
                    </div>
                    <div className="font-black text-white tabular-nums">42</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-black/30 border border-line">
                    <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      Total Shares
                    </div>
                    <div className="font-black text-white tabular-nums">{selected.sharesTotal}</div>
                  </div>
                </div>
                <Btn variant="outline" icon={Eye} fullWidth>
                  View on Explorer
                </Btn>
              </div>
            </div>
          </Glass>

          {/* Ownership distribution */}
          <Glass className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-white">Ownership Distribution</h4>
              <Pill color="ash">
                {selected.sharesTotal - selected.sharesAvail}/{selected.sharesTotal} held
              </Pill>
            </div>
            <div className="space-y-2.5">
              {[
                { addr: "GA7AY…SRZ", pct: 32, label: "Primary Investor" },
                { addr: "GBQI…X8A", pct: 18, label: "Cocoa Fund DAO" },
                { addr: "GD24…M9F", pct: 12, label: "Adeola Okonkwo (Farmer)" },
                { addr: "GCZA…4LP", pct: 6, label: "Retail Pool" },
                { addr: "Available", pct: 32, label: "Open for Investment", open: true },
              ].map((o) => (
                <div key={o.addr}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{
                          background: o.open
                            ? "rgba(255,255,255,0.1)"
                            : "linear-gradient(135deg, #84CC16, #166534)",
                          border: o.open ? "1px dashed rgba(132,204,22,0.4)" : "none",
                        }}
                      />
                      <span className="font-mono text-slate-400 truncate">{o.addr}</span>
                      <span className="text-slate-600 truncate hidden sm:inline">· {o.label}</span>
                    </div>
                    <span className="font-bold tabular-nums text-white shrink-0">{o.pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${o.pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: o.open
                          ? "rgba(255,255,255,0.15)"
                          : "linear-gradient(90deg, #65A30D, #84CC16)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        </div>

        {/* Right: Timeline + recent tx */}
        <div className="lg:col-span-4 space-y-5">
          <Glass className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-white">Verification Timeline</h4>
              <Pill color="emerald" dot>
                Active
              </Pill>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
              <div className="space-y-4">
                {VERIFICATION_TIMELINE.map((v, i) => {
                  const isActive = v.status === "active";
                  const isPending = v.status === "pending";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative pl-9"
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center",
                          isActive
                            ? "bg-lime-500"
                            : isPending
                              ? "bg-white/5 border border-white/10"
                              : "bg-lime-500/20 border border-lime-500/40",
                        )}
                      >
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-lime-500"
                          />
                        )}
                        {isPending ? (
                          <Clock className="w-3 h-3 text-slate-600 relative" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-lime-300 relative" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "font-bold text-sm",
                              isPending ? "text-slate-600" : "text-white",
                            )}
                          >
                            {v.stage}
                          </div>
                          <div
                            className={cn(
                              "text-[10px]",
                              isPending ? "text-slate-700" : "text-slate-500",
                            )}
                          >
                            {v.time}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "font-mono text-[10px] shrink-0",
                            isPending ? "text-slate-700" : "text-lime-400/70",
                          )}
                        >
                          {v.hash}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Glass>

          <Glass className="p-5">
            <h4 className="font-black text-white mb-3">Smart Contract Activity</h4>
            <div className="space-y-2">
              {TX_HISTORY.slice(0, 4).map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      tx.type === "INVEST"
                        ? "bg-lime-500/10"
                        : tx.type === "CLAIM"
                          ? "bg-emerald-500/10"
                          : "bg-sky-500/10",
                    )}
                  >
                    {tx.type === "INVEST" ? (
                      <ArrowUpRight className="w-4 h-4 text-lime-400" />
                    ) : tx.type === "CLAIM" ? (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Link2 className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white">
                      {tx.type} · {tx.produce}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 truncate">{tx.hash}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-xs text-white tabular-nums">
                      ${tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-600">{tx.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
}
