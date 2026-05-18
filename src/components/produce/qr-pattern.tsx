import { useMemo } from "react";

interface QRPatternProps {
  seed?: string;
  size?: number;
}

export function QRPattern({ seed = "RC-0421", size = 200 }: QRPatternProps) {
  const cells = 21;
  const cellSize = size / cells;

  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
    return h;
  }, [seed]);

  const rand = (i: number, j: number) => {
    const v = Math.sin(hash + i * 13.7 + j * 7.3) * 10000;
    return v - Math.floor(v) > 0.5;
  };
  const isFinder = (i: number, j: number) =>
    (i < 7 && j < 7) || (i < 7 && j >= cells - 7) || (i >= cells - 7 && j < 7);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <rect width={size} height={size} fill="#0a0e0c" rx="8" />
      {Array.from({ length: cells }).map((_, i) =>
        Array.from({ length: cells }).map((_, j) => {
          if (isFinder(i, j)) return null;
          if (!rand(i, j)) return null;
          return (
            <rect
              key={`${i}-${j}`}
              x={j * cellSize + 1}
              y={i * cellSize + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill="#BEF264"
              rx="0.5"
            />
          );
        }),
      )}
      {[
        [0, 0],
        [0, cells - 7],
        [cells - 7, 0],
      ].map(([r, c], idx) => (
        <g key={idx}>
          <rect
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize * 7}
            height={cellSize * 7}
            fill="none"
            stroke="#84CC16"
            strokeWidth={cellSize}
          />
          <rect
            x={(c + 2) * cellSize}
            y={(r + 2) * cellSize}
            width={cellSize * 3}
            height={cellSize * 3}
            fill="#84CC16"
          />
        </g>
      ))}
    </svg>
  );
}
