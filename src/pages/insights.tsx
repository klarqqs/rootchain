import { useEffect, useState } from "react";
import { CloudFog, Gauge, Waves } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { buildPilotRiskBrief } from "@/intelligence/pilot-risk-brief";

interface WeatherSnapshot {
  temp: number | null;
  speed: number | null;
}

export function InsightsPage() {
  const [weather, setWeather] = useState<WeatherSnapshot>({
    temp: null,
    speed: null,
  });

  useEffect(() => {
    /** Pilot coordinates — Nairobi highlands centroid (Open-Meteo public API). */
    const ctl = new AbortController();
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=-1.286389&longitude=36.817223&current_weather=true";
    fetch(url, { signal: ctl.signal })
      .then((r) => r.json())
      .then((payload) => {
        const cw = payload?.current_weather;
        if (!cw) return;
        setWeather({
          temp: typeof cw.temperature === "number" ? cw.temperature : null,
          speed: typeof cw.windspeed === "number" ? cw.windspeed : null,
        });
      })
      .catch(() => {
        /* low-bandwidth / offline — degrade silently */
      });
    return () => ctl.abort();
  }, []);

  const comfort =
    weather.temp === null
      ? null
      : Math.max(
          0,
          Math.min(
            100,
            100 - Math.abs(weather.temp - 22) * 2 - (weather.speed ?? 0) / 6,
          ),
        );

  const brief = buildPilotRiskBrief({
    risk: "Moderate",
    escrowReleasedPct: 41,
    daysToHarvest: 48,
    weatherComfort: comfort ?? 55,
  });

  return (
    <div className="space-y-5 pb-16 max-w-4xl mx-auto">
      <Glass className="p-6 elevated" glow>
        <div className="flex items-center gap-2 flex-wrap">
          <Pill color="sky" dot>
            Ag intelligence overlays
          </Pill>
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
            Client-side forecasting · augment with Agritecture / proprietary models later
          </span>
        </div>
        <h2 className="font-black text-3xl text-white tracking-tight mt-3 mb-3">
          Weather-informed capital pacing (pilot telemetry).
        </h2>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Glass className="p-4 flex items-start gap-2">
            <CloudFog className="w-4 h-4 text-sky-300 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500">Temp</div>
              <div className="font-black text-xl text-white tabular-nums">
                {weather.temp !== null ? `${weather.temp.toFixed(1)}°C` : "—"}
              </div>
            </div>
          </Glass>
          <Glass className="p-4 flex items-start gap-2">
            <Waves className="w-4 h-4 text-lime-300 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500">Wind</div>
              <div className="font-black text-xl text-white tabular-nums">
                {weather.speed !== null ? `${weather.speed.toFixed(1)} km/h` : "—"}
              </div>
            </div>
          </Glass>
          <Glass className="p-4 flex items-start gap-2">
            <Gauge className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500">Comfort blend</div>
              <div className="font-black text-xl text-white tabular-nums">
                {comfort !== null ? `${comfort.toFixed(1)} · 100` : "Fetching…"}
              </div>
            </div>
          </Glass>
        </div>

        <div className="rounded-2xl border border-white/[0.08] px-4 py-3 space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-white">Pilot capital risk lens</div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-black text-3xl tabular-nums text-lime-200">{brief.score}</span>
            <span className="text-sm text-slate-300 flex-1 min-w-[12rem]">{brief.headline}</span>
          </div>
          <ul className="text-xs text-slate-500 space-y-1 mt-3 list-disc pl-5">
            {brief.drivers.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </Glass>
    </div>
  );
}
