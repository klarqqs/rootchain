import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PillColor = "lime" | "emerald" | "amber" | "rose" | "sky" | "ash" | "purple" | "slate";

interface PillProps {
  children: React.ReactNode;
  color?: PillColor;
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const COLOR_MAP: Record<PillColor, string> = {
  lime: "text-lime-300 bg-lime-500/10 border-lime-500/20",
  emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  rose: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  sky: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  ash: "text-slate-300 bg-slate-500/10 border-slate-500/20",
  slate: "text-slate-400 bg-slate-500/5 border-slate-500/15",
  purple: "text-violet-300 bg-violet-500/10 border-violet-500/20",
};

export function Pill({ children, color = "lime", icon: Icon, dot, className, size = "sm" }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold tracking-[0.12em] uppercase",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
        COLOR_MAP[color],
        className,
      )}
    >
      {dot && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-current opacity-70 animate-ping" />
          <span className="relative inline-flex w-full h-full rounded-full bg-current" />
        </span>
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
