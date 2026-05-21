import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Clock, MapPin, Sprout } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { MARKETING_FEATURED_PROJECTS } from "@/data/marketing-projects";
import type { Page } from "@/lib/nav";

export interface FeaturedProjectsProps {
  setPage: (p: Page) => void;
}

export function FeaturedProjects({ setPage }: FeaturedProjectsProps) {
  return (
    <section id="featured" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Pill color="amber" className="border-amber-500/20 text-amber-100/90">
            Verified pipeline
          </Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">Featured farm programs.</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg">
            Illustrative pilot listings — each mirrors the diligence pack, funding curve, and milestone cadence you will
            see in production.
          </p>
        </div>
        <Btn variant="outline" iconRight={ArrowUpRight} onClick={() => setPage("marketplace")}>
          View marketplace
        </Btn>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {MARKETING_FEATURED_PROJECTS.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group"
          >
            <Glass
              className="overflow-hidden h-full flex flex-col border-white/[0.05] transition-all duration-300 group-hover:border-emerald-500/25 group-hover:shadow-[0_0_48px_-12px_rgba(16,185,129,0.25)]"
              hover
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {p.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/50 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="font-black text-white text-lg leading-tight tracking-tight">{p.name}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-400/80 shrink-0" />
                    {p.location}
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-amber-200/80" />
                    {p.crop}
                  </span>
                  <span className="font-black text-emerald-300 tabular-nums">{p.roi} ROI</span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <span>Funded</span>
                    <span>{p.fundedPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.fundedPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.05 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-2">
                    <div className="text-slate-600 font-bold uppercase tracking-wider text-[9px]">Raised</div>
                    <div className="font-black text-white tabular-nums">{p.raised}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-2">
                    <div className="text-slate-600 font-bold uppercase tracking-wider text-[9px]">Shares left</div>
                    <div className="font-black text-amber-100/90 tabular-nums">{p.remainingShares}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-2 col-span-2 flex items-center justify-between">
                    <span className="text-slate-600 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration
                    </span>
                    <span className="font-bold text-slate-200">{p.duration}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPage("marketplace")}
                  className="mt-auto w-full py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] border border-white/[0.08] text-slate-200 hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-white transition-colors"
                >
                  Open diligence
                </button>
              </div>
            </Glass>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
