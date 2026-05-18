import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { ProduceItem } from "@/data/produce";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface ProduceVisualProps {
  item: ProduceItem;
  size?: "card" | "compact" | "hero";
}

export function ProduceVisual({ item, size = "card" }: ProduceVisualProps) {
  const Icon = item.icon;
  const heightClass =
    size === "hero" ? "h-56" : size === "compact" ? "h-32" : "h-44";
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl ring-1 ring-white/[0.04]", heightClass)}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${item.color}33, transparent 60%), linear-gradient(135deg, #0a0e0c 0%, #141b17 100%)`,
      }}
    >
      {item.imageUrl ? (
        <>
          <img
            src={item.imageUrl}
            alt={`${item.name} harvest visual`}
            width={960}
            height={540}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition duration-700",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent transition duration-700",
              loaded ? "opacity-100" : "opacity-95",
            )}
          />
          <div className={cn(
            "absolute inset-0 bg-white/[0.04]",
            loaded && "opacity-80",
          )} />

          {/* Loading skeleton shimmer */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              loaded ? "opacity-0 pointer-events-none" : "opacity-100 shimmer-loop bg-white/[0.07]",
            )}
          />

          {/* Subtle topographic noise on top of photo */}
          <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-soft-light pointer-events-none">
            <defs>
              <pattern id={`topo-${item.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 20 Q 10 12, 20 20 T 40 20"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#topo-${item.id})`} />
          </svg>
        </>
      ) : (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <pattern id={`topo-flat-${item.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 20 Q 10 12, 20 20 T 40 20"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#topo-flat-${item.id})`} />
          </svg>
          <div
            className="absolute inset-0 mix-blend-overlay opacity-50"
            style={{
              background: `conic-gradient(from 220deg at 60% 40%, ${item.color}40, transparent 30%, ${item.color}20 60%, transparent 80%)`,
            }}
          />
        </>
      )}

      {/* Accent icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: item.imageUrl ? 0.22 : 1 }}
        >
          <Icon
            className={cn(size === "hero" ? "w-20 h-20" : "w-16 h-16")}
            style={{ color: item.color, filter: `drop-shadow(0 0 20px ${item.color}80)` }}
            strokeWidth={1.2}
            aria-hidden
          />
        </motion.div>
      </div>

      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-[1]">
        {item.verified && (
          <Pill color="lime" icon={ShieldCheck}>
            Verified
          </Pill>
        )}
        {item.trending && (
          <Pill color="amber" icon={TrendingUp}>
            Trending
          </Pill>
        )}
      </div>
      <div className="absolute top-2.5 right-2.5 z-[1]">
        <Pill color="ash">{item.id}</Pill>
      </div>

      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-[1]">
        <Pill color="emerald" dot>
          Growth {item.growth}%
        </Pill>
        <span className="text-[10px] font-mono text-slate-200/90 truncate max-w-[120px] drop-shadow">
          {item.hash.slice(0, 6)}…{item.hash.slice(-4)}
        </span>
      </div>
    </div>
  );
}
