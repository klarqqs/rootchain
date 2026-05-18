import { motion } from "framer-motion";
import { Cloud, CloudRain, Droplets, Sun, Wind } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";

const FORECAST = [
  { day: "Mon", icon: Sun, temp: 32, rain: 5 },
  { day: "Tue", icon: Sun, temp: 33, rain: 0 },
  { day: "Wed", icon: Cloud, temp: 31, rain: 20 },
  { day: "Thu", icon: CloudRain, temp: 28, rain: 80 },
  { day: "Fri", icon: CloudRain, temp: 27, rain: 70 },
  { day: "Sat", icon: Cloud, temp: 30, rain: 30 },
  { day: "Sun", icon: Sun, temp: 32, rain: 10 },
];

export function WeatherWidget() {
  return (
    <Glass className="p-5 relative overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #FBBF24, transparent 60%)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base text-white tracking-tight">Field Conditions</h3>
            <div className="text-xs text-slate-500">Ogun, NG · RC-0421</div>
          </div>
          <Pill color="amber" dot>
            Live
          </Pill>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <motion.div
            animate={{ rotate: [0, 8, 0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Sun className="w-14 h-14 text-amber-400" style={{ filter: "drop-shadow(0 0 16px rgba(251,191,36,0.5))" }} />
          </motion.div>
          <div>
            <div className="font-black text-4xl text-white tabular-nums leading-none">32°</div>
            <div className="text-xs text-slate-400 mt-1">Sunny · feels 35°</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <Droplets className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Humidity</div>
            <div className="font-bold text-white tabular-nums text-sm">68%</div>
          </div>
          <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <Wind className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wind</div>
            <div className="font-bold text-white tabular-nums text-sm">12 km/h</div>
          </div>
          <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <CloudRain className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rain</div>
            <div className="font-bold text-white tabular-nums text-sm">5%</div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-1">
          {FORECAST.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.day} className="flex-1 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">{f.day}</div>
                <Icon className="w-4 h-4 text-amber-400/80 mx-auto my-1" />
                <div className="text-xs font-bold text-white tabular-nums">{f.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </Glass>
  );
}
