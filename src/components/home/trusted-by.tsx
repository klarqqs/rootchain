import { motion } from "framer-motion";
import { TRUSTED_BY } from "@/data/social";
import { Pill } from "@/components/ui/pill";

export function TrustedBy() {
  return (
    <section>
      <div className="text-center mb-8">
        <Pill color="ash">Trusted by partners across the chain</Pill>
        <h2 className="font-black text-2xl lg:text-3xl text-white mt-3 tracking-tight">
          Backed by infrastructure you already trust.
        </h2>
      </div>
      <div className="relative overflow-hidden mask-fade-x">
        <motion.div
          className="flex items-center gap-8 lg:gap-12 whitespace-nowrap will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        >
          {[...TRUSTED_BY, ...TRUSTED_BY, ...TRUSTED_BY].map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex items-center gap-3 px-5 py-3 rounded-xl border border-line bg-white/[0.02] shrink-0"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-black shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #BEF264 0%, #84CC16 50%, #166534 100%)",
                }}
              >
                {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{p.name}</div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                  {p.category}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
