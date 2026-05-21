/** Subtle Africa silhouette with pilot-market highlights — decorative only. */
export function HeroAfricaMap() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="africaGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <filter id="countryDot">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="900" fill="url(#africaGlow)" />
      {/* Simplified continent outline */}
      <path
        fill="none"
        stroke="rgba(148,163,184,0.12)"
        strokeWidth="1.2"
        d="M420 120c-40 8-72 42-88 78-22 52-18 118 8 168 28 58 72 98 118 128 42 28 88 48 132 62 38 12 78 8 108-18 32-28 48-72 42-112-6-48-32-92-68-128-38-38-82-68-128-88-32-14-68-22-102-18-28 4-52 16-72 32-18 14-32 32-42 52-8 16-12 34-10 52 2 22 12 42 28 58 16 16 38 28 62 32 24 4 50 0 72-12 22-12 40-32 52-54 12-22 18-48 16-72-4-28-18-54-40-72-22-18-50-28-78-26-32 2-62 16-86 36-24 20-42 46-50 74-8 28-4 58 12 82 16 24 42 42 72 48 30 6 62 0 88-16 26-16 46-40 58-66 12-26 16-54 10-80-8-26-24-48-46-62-22-14-48-20-74-16z"
        opacity="0.5"
      />
      {/* Pilot markets */}
      {[
        { cx: 398, cy: 318, label: "NG" },
        { cx: 352, cy: 352, label: "GH" },
        { cx: 468, cy: 468, label: "KE" },
        { cx: 478, cy: 432, label: "RW" },
      ].map((m) => (
        <g key={m.label} filter="url(#countryDot)">
          <circle cx={m.cx} cy={m.cy} r="14" fill="rgba(16,185,129,0.08)" />
          <circle cx={m.cx} cy={m.cy} r="5" fill="#34d399" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}
