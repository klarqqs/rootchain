import { Hero } from "@/components/home/hero";
import { TrustedBy } from "@/components/home/trusted-by";
import { StatsSection } from "@/components/home/stats-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { Trending } from "@/components/home/trending";
import { LiveActivityFeed } from "@/components/home/live-activity-feed";
import { Testimonials } from "@/components/home/testimonials";
import { CTA } from "@/components/home/cta";
import type { ProduceItem } from "@/data/produce";
import type { Page } from "@/lib/nav";

interface HomePageProps {
  setPage: (p: Page) => void;
  onConnectWallet: () => void;
  onInvest: (item: ProduceItem) => void;
  onVerify: (item: ProduceItem) => void;
}

export function HomePage({ setPage, onConnectWallet, onInvest, onVerify }: HomePageProps) {
  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      <Hero setPage={setPage} onConnectWallet={onConnectWallet} />
      <TrustedBy />
      <StatsSection />
      <HowItWorks />
      <Trending setPage={setPage} onInvest={onInvest} onVerify={onVerify} />
      <LiveActivityFeed />
      <Testimonials />
      <CTA setPage={setPage} onConnectWallet={onConnectWallet} />
    </div>
  );
}
