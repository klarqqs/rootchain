/**
 * Single source of truth for ROOTCHAIN visual tokens that need JS access
 * (Recharts, inline gradients, motion). For pure CSS, use src/index.css.
 */
export const tokens = {
  bg: "#070A09",
  surface: "#0E1411",
  surface2: "#141B17",
  surface3: "#1A221E",
  line: "rgba(132, 204, 22, 0.08)",
  lineStrong: "rgba(132, 204, 22, 0.18)",
  lime: {
    50: "#F7FEE7",
    200: "#D9F99D",
    300: "#BEF264",
    400: "#A3E635",
    500: "#84CC16",
    600: "#65A30D",
  },
  forest: "#166534",
  emerald: "#4ADE80",
  ink: "#F1F5F4",
  inkMuted: "#94A3B8",
  inkFaint: "#64748B",
  inkGhost: "#475569",
  danger: "#F87171",
  amber: "#FBBF24",
  sky: "#38BDF8",
  earth: "#A8A29E",
} as const;
