import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { PLATFORM_FLOW_STEPS } from "@/data/platform-visuals";
import { cn } from "@/lib/utils";

/** Step carousel only — hero carries the product UI; no background video. */
export function PlatformVisualJourney() {
  const [slide, setSlide] = useState(0);
  const max = PLATFORM_FLOW_STEPS.length - 1;
  const step = PLATFORM_FLOW_STEPS[slide];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <Pill color="emerald" className="border-emerald-500/25">
            Four beats
          </Pill>
          <h3 className="font-black text-xl sm:text-2xl text-white mt-2 tracking-tight">How capital moves on RootChain</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous step"
            disabled={slide <= 0}
            onClick={() => setSlide((s) => Math.max(0, s - 1))}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] disabled:opacity-30 hover:bg-white/[0.08]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next step"
            disabled={slide >= max}
            onClick={() => setSlide((s) => Math.min(max, s + 1))}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] disabled:opacity-30 hover:bg-white/[0.08]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Glass className="overflow-hidden border-emerald-500/15 p-0">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[220px] md:min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={step.title}
                src={step.image}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent md:bg-gradient-to-r" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-6 md:right-auto md:max-w-sm">
              <span className="text-[10px] font-black tracking-[0.3em] text-emerald-300/90 uppercase">
                Step {slide + 1} / {PLATFORM_FLOW_STEPS.length}
              </span>
              <div className="font-black text-2xl text-white mt-1 leading-tight">{step.title}</div>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={step.caption}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-slate-400 leading-relaxed"
              >
                {step.caption}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-6">
              {PLATFORM_FLOW_STEPS.map((s, j) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`Go to step ${j + 1}`}
                  onClick={() => setSlide(j)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors max-w-[80px]",
                    j === slide ? "bg-emerald-400" : "bg-white/10 hover:bg-white/20",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </Glass>
    </div>
  );
}
