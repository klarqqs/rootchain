import { motion } from "framer-motion";
import { TICKER } from "@/data/market";
import { tokens } from "@/lib/tokens";

export function Ticker() {
  return (
    <div className="relative w-full border-y border-line bg-black/40 backdrop-blur-xl overflow-hidden h-9">
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${tokens.bg}, transparent)` }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to left, ${tokens.bg}, transparent)` }}
      />
      <motion.div
        className="flex items-center gap-10 h-full whitespace-nowrap will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] font-bold tracking-wider">
            <span className="text-slate-500">{t.sym}</span>
            <span className="text-white tabular-nums">${t.price.toFixed(t.price < 1 ? 3 : 2)}</span>
            <span className={`tabular-nums ${t.chg >= 0 ? "text-lime-400" : "text-rose-400"}`}>
              {t.chg >= 0 ? "▲" : "▼"} {Math.abs(t.chg).toFixed(1)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
