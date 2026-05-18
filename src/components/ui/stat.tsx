import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Glass } from "./glass";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string | React.ReactNode;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
  sub?: string;
  accent?: "lime" | "amber" | "sky" | "rose";
}

const ACCENT: Record<NonNullable<StatProps["accent"]>, { bg: string; text: string; ring: string }> = {
  lime: { bg: "bg-lime-500/10", text: "text-lime-400", ring: "border-lime-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", ring: "border-amber-500/20" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-400", ring: "border-sky-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", ring: "border-rose-500/20" },
};

export function Stat({
  label,
  value,
  delta,
  deltaPositive = true,
  icon: Icon,
  sub,
  accent = "lime",
}: StatProps) {
  const a = ACCENT[accent];
  return (
    <Glass className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
          {label}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center", a.bg, a.ring)}>
            <Icon className={cn("w-4 h-4", a.text)} />
          </div>
        )}
      </div>
      <div className="font-black text-2xl lg:text-[26px] text-white tracking-tight tabular-nums leading-none">
        {value}
      </div>
      {(delta || sub) && (
        <div className="flex items-center gap-2 mt-3">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-bold tabular-nums",
                deltaPositive ? "text-lime-400" : "text-rose-400",
              )}
            >
              {deltaPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {delta}
            </span>
          )}
          {sub && <span className="text-xs text-slate-500">{sub}</span>}
        </div>
      )}
    </Glass>
  );
}
