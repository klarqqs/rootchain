import { useState } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { Btn } from "@/components/ui/button";
import { PUBLIC_FAQ_ITEMS } from "@/data/public-faq";
import type { Page } from "@/lib/nav";

export function LandingCommunitySection({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section
      data-landing-section="community"
      id="community"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[120px] py-16 lg:py-20 border-t border-white/[0.05]"
    >
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <Pill color="emerald" icon={MessagesSquare} className="border-emerald-500/25">
            Community
          </Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight leading-tight">
            Farmers, investors, and operators on one rail.
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Share diligence, coordinate milestones, and stay aligned with field reality — without losing the audit trail
            that capital partners expect.
          </p>
          <Btn variant="primary" className="mt-6" onClick={() => setPage("community")}>
            Open community
          </Btn>
        </div>
        <div className="lg:col-span-7">
          <Glass className="p-6 lg:p-8 border-white/[0.06]">
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold shrink-0">01</span>
                <span>Cooperative operators publish harvest updates and evidence packs for investor review.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold shrink-0">02</span>
                <span>Diaspora and institutional LPs follow the same threads — no parallel email chains.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400 font-bold shrink-0">03</span>
                <span>When you are ready, everything links forward to marketplace listings and wallet settlement.</span>
              </li>
            </ul>
          </Glass>
        </div>
      </div>
    </section>
  );
}

export function LandingFaqSection({ setPage }: { setPage: (p: Page) => void }) {
  const [openIx, setOpenIx] = useState<number | null>(0);

  return (
    <section
      data-landing-section="landing-faq"
      id="landing-faq"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-[120px] py-16 lg:py-20 pb-24"
    >
      <div className="max-w-2xl mb-8">
        <Pill color="ash" className="border-white/10 text-slate-300">
          FAQ
        </Pill>
        <h2 className="font-black text-3xl lg:text-4xl text-white mt-3 tracking-tight">Straight answers.</h2>
        <p className="text-sm text-slate-500 mt-2">
          Full help center lives in the app — here are the essentials while you are browsing.
        </p>
      </div>
      <div className="max-w-3xl space-y-2">
        {PUBLIC_FAQ_ITEMS.map((item, i) => {
          const open = openIx === i;
          return (
            <Glass key={item.q} className="overflow-hidden border-white/[0.06]">
              <button
                type="button"
                onClick={() => setOpenIx(open ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-bold text-white text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/[0.05] pt-3">
                  {item.a}
                </div>
              )}
            </Glass>
          );
        })}
      </div>
      <div className="mt-8">
        <Btn variant="outline" size="sm" onClick={() => setPage("help")}>
          Help center &amp; alerts
        </Btn>
      </div>
    </section>
  );
}
