import { motion } from "framer-motion";
import { useState } from "react";

interface ParticlesProps {
  count?: number;
  color?: string;
}

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const generateDots = (count: number): Dot[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 8 + 12,
    delay: Math.random() * 8,
  }));

export function Particles({ count = 24, color = "#84CC16" }: ParticlesProps) {
  // Generated once via state initializer (purity-safe in React 19)
  const [dots] = useState<Dot[]>(() => generateDots(count));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: color,
            boxShadow: `0 0 ${d.size * 4}px ${color}99`,
          }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.85, 0.2] }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
