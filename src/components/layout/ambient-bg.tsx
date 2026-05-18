import { tokens } from "@/lib/tokens";

export function AmbientBg() {
  return (
    <>
      {/* Base */}
      <div className="fixed inset-0 -z-50" style={{ background: tokens.bg }} />

      {/* Radial glows */}
      <div
        className="fixed inset-0 -z-40 opacity-70 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 85% -10%, rgba(132,204,22,0.18), transparent 50%), radial-gradient(circle at 10% 110%, rgba(22,101,52,0.18), transparent 50%), radial-gradient(circle at 50% 50%, rgba(132,204,22,0.04), transparent 70%)",
        }}
      />

      {/* Animated grid */}
      <div
        className="fixed inset-0 -z-30 opacity-[0.05] pointer-events-none grid-bg"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          animation: "var(--animate-grid-move)",
        }}
      />

      {/* Noise overlay */}
      <svg className="fixed inset-0 -z-20 w-full h-full opacity-[0.025] pointer-events-none mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.52 0 0 0 0 0.8 0 0 0 0 0.09 0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </>
  );
}
