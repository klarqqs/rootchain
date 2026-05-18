import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "dark" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface BtnProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black shadow-[0_8px_28px_-8px_rgba(132,204,22,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50",
  ghost: "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10",
  outline:
    "border border-lime-500/30 hover:border-lime-500/60 text-lime-300 hover:bg-lime-500/[0.06]",
  dark: "bg-black/40 hover:bg-black/60 text-white border border-white/10",
  danger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30",
  subtle: "text-slate-400 hover:text-white hover:bg-white/5",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2",
};

export function Btn({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconR,
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-colors duration-200 focus-ring relative overflow-hidden",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth && "w-full",
        loading && "cursor-wait",
        className,
      )}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 shimmer-loop" />
      )}
      {Icon && <Icon className={cn(size === "lg" ? "w-5 h-5" : "w-4 h-4", "shrink-0")} />}
      <span className="relative">{children}</span>
      {IconR && <IconR className={cn(size === "lg" ? "w-5 h-5" : "w-4 h-4", "shrink-0")} />}
    </motion.button>
  );
}
