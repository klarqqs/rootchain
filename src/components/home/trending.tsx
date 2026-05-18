import { ArrowRight, TrendingUp } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ProduceCard } from "@/components/produce/produce-card";
import { PRODUCE_DATA, type ProduceItem } from "@/data/produce";
import type { Page } from "@/lib/nav";

interface TrendingProps {
  setPage: (p: Page) => void;
  onInvest: (item: ProduceItem) => void;
  onVerify: (item: ProduceItem) => void;
}

export function Trending({ setPage, onInvest, onVerify }: TrendingProps) {
  const trending = PRODUCE_DATA.filter((p) => p.trending).slice(0, 3);

  return (
    <section>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <Pill color="amber" icon={TrendingUp}>
            Trending Now
          </Pill>
          <h2 className="font-black text-3xl lg:text-4xl text-white mt-2 tracking-tight">
            High-velocity harvests.
          </h2>
        </div>
        <Btn variant="ghost" iconRight={ArrowRight} onClick={() => setPage("marketplace")}>
          View all
        </Btn>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trending.map((p, i) => (
          <ProduceCard key={p.id} item={p} index={i} onInvest={onInvest} onVerify={onVerify} />
        ))}
      </div>
    </section>
  );
}
