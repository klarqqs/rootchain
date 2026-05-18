import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Globe,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { FarmerCard } from "@/features/farmers/farmer-card";
import { farmerDbService } from "@/database";
import type { FarmerProfile } from "@/database/types";
import { tokens } from "@/lib/tokens";
import { explorerAccountUrl } from "@/lib/stellar/config";

const REGIONS = ["All", "West Africa", "East Africa", "Southern Africa"];

export function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<FarmerProfile | null>(null);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    farmerDbService.listFarmers(30).then((data) => {
      setFarmers(data);
      setLoading(false);
    });
  }, []);

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.farm_name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      (f.specialties ?? []).some((s) => s.toLowerCase().includes(q));
    const matchRegion = region === "All" || f.region === region;
    const matchVerified = !verifiedOnly || f.verified;
    return matchSearch && matchRegion && matchVerified;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill color="lime" icon={Users}>Farmer Directory</Pill>
          <h1 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">
            The farmers behind the chain.
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Every ROOTCHAIN farmer is on-boarded with a Stellar address, location verification,
            and milestone-based payout contracts.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Pill color="emerald" dot>
            {farmers.filter((f) => f.verified).length} Verified
          </Pill>
          <Pill color="ash" icon={Globe}>
            {new Set(farmers.map((f) => f.region)).size} regions
          </Pill>
        </div>
      </div>

      {/* Filters */}
      <Glass className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line flex-1 min-w-[200px]"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, farm, or specialty…"
              className="bg-transparent outline-none text-sm text-white placeholder:text-slate-600 flex-1 min-w-0"
            />
          </div>
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition border ${
              verifiedOnly
                ? "bg-lime-400 text-black border-lime-400"
                : "bg-white/[0.03] text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified only
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                region === r
                  ? "bg-lime-400 text-black border-lime-400"
                  : "bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Glass>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Glass key={i} className="p-5 h-64 shimmer-loop" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Glass className="p-12 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <div className="font-black text-white">No farmers found.</div>
          <div className="text-sm text-slate-500">Adjust the filter or search term.</div>
        </Glass>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f, i) => (
            <FarmerCard key={f.id} farmer={f} index={i} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Farmer detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Glass className="overflow-hidden" glow elevated>
                {/* Hero */}
                <div
                  className="relative h-32 flex items-end p-6"
                  style={{
                    background: `linear-gradient(135deg, ${selected.avatar_color ?? tokens.lime[500]}44, ${tokens.forest}66)`,
                  }}
                >
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-end gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-black text-xl ring-2 ring-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${selected.avatar_color ?? tokens.lime[500]}, ${tokens.forest})`,
                      }}
                    >
                      {selected.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-black text-white text-xl flex items-center gap-2">
                        {selected.name}
                        {selected.verified && (
                          <BadgeCheck className="w-5 h-5 text-lime-400" />
                        )}
                      </div>
                      <div className="text-sm text-white/70">{selected.farm_name}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2">
                    {selected.verified && <Pill color="lime" icon={Award}>Verified Farmer</Pill>}
                    <Pill color="ash" icon={MapPin}>
                      {selected.location}
                    </Pill>
                    {selected.join_year && (
                      <Pill color="slate">Member since {selected.join_year}</Pill>
                    )}
                  </div>

                  {/* Bio */}
                  {selected.bio && (
                    <p className="text-sm text-slate-300 leading-relaxed">{selected.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Harvests", value: selected.total_harvests },
                      {
                        label: "Total Funded",
                        value:
                          selected.total_funded >= 1_000_000
                            ? `$${(selected.total_funded / 1_000_000).toFixed(1)}M`
                            : `$${(selected.total_funded / 1000).toFixed(0)}K`,
                      },
                      { label: "Active Listings", value: selected.active_listings },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center"
                      >
                        <div className="font-black text-white text-lg tabular-nums">{s.value}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Specialties */}
                  {selected.specialties && selected.specialties.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                        Specialties
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.specialties.map((s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-lime-500/10 border border-lime-500/20 text-lime-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stellar address */}
                  {selected.stellar_address && (
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                        Stellar Address
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-white truncate flex-1 px-3 py-2 rounded-lg bg-black/40 border border-line">
                          {selected.stellar_address}
                        </code>
                        <a
                          href={explorerAccountUrl(selected.stellar_address)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-3 py-2 rounded-lg border border-line bg-black/30 hover:border-lime-500/30 text-xs font-bold text-lime-300 transition shrink-0"
                        >
                          Explorer ↗
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Btn variant="outline" onClick={() => setSelected(null)}>
                      Close
                    </Btn>
                  </div>
                </div>
              </Glass>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
