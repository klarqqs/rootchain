import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Quote, Star } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { TESTIMONIALS } from "@/data/social";
import { tokens } from "@/lib/tokens";

export function Testimonials() {
  return (
    <section>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <Pill color="amber" icon={Star}>
            Community
          </Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">
            Voices from the chain.
          </h2>
        </div>
        <p className="text-slate-500 max-w-md text-sm">
          Verified farmers and global investors using ROOTCHAIN today. Every quote ties to a real on-chain record.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Glass className="p-5 h-full flex flex-col" hover glow={i === 0 || i === 3}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-black shrink-0 ring-1 ring-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${t.avatarColor}, ${tokens.forest})`,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                      <span className="truncate">{t.name}</span>
                      {t.verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{t.role}</div>
                  </div>
                </div>
                <Quote className="w-5 h-5 text-lime-400/40 shrink-0" />
              </div>

              <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {t.region}
                </div>
                {t.metric && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                      {t.metric.label}
                    </span>
                    <span className="font-black text-lime-400 tabular-nums text-sm">
                      {t.metric.value}
                    </span>
                  </div>
                )}
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
