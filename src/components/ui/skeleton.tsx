import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg shimmer-loop bg-white/[0.03]",
        className,
      )}
    />
  );
}
