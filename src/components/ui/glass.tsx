import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type GlassProps = HTMLMotionProps<"div"> & {
  hover?: boolean;
  glow?: boolean;
  elevated?: boolean;
  inset?: boolean;
};

export const Glass = forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { className, hover, glow, elevated, inset, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative rounded-2xl border transition-all duration-500",
        elevated ? "surface-elev" : "surface",
        glow ? "glow-lime" : "glow-deep",
        inset && "ring-1 ring-white/[0.04]",
        "border-line",
        hover && "hover:border-[color:var(--color-line-strong)] hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
