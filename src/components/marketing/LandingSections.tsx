import { useEffect } from "react";
import { HeroSection } from "@/components/marketing/HeroSection";
import { PlatformStory } from "@/components/marketing/platform-story";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { LANDING_SECTION_IDS } from "@/lib/landing-section-ids";
import { useLandingHomeScroll } from "@/components/marketing/landing-home-scroll-context";
import { LandingCommunitySection, LandingFaqSection } from "@/components/marketing/landing-community-faq";
import type { Page } from "@/lib/nav";

export interface LandingSectionsProps {
  setPage: (p: Page) => void;
}

const NAV_OFFSET = 100;

export function LandingSections({ setPage }: LandingSectionsProps) {
  const { setActiveSection, setScrollProgress } = useLandingHomeScroll();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const ids = [...LANDING_SECTION_IDS];
      let active = ids[0];
      for (let i = ids.length - 1; i >= 0; i--) {
        const id = ids[i];
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= NAV_OFFSET + 40) {
          active = id;
          break;
        }
      }
      setActiveSection(active);

      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const first = document.getElementById("hero") ?? document.getElementById("platform");
      const last = document.getElementById("landing-faq");
      if (first && last) {
        const anchorTop = first.getBoundingClientRect().top + scrollTop;
        const anchorBottom = last.getBoundingClientRect().bottom + scrollTop;
        const span = Math.max(1, anchorBottom - anchorTop - window.innerHeight * 0.4);
        const raw = (scrollTop - anchorTop + NAV_OFFSET) / span;
        setScrollProgress(Math.min(1, Math.max(0, raw)));
      } else {
        const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
        setScrollProgress(Math.min(1, Math.max(0, scrollTop / maxScroll)));
      }
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [setActiveSection, setScrollProgress]);

  return (
    <div className="w-full">
      <HeroSection setPage={setPage} />
      <PlatformStory />
      <LandingCommunitySection setPage={setPage} />
      <HowItWorks />
      <LandingFaqSection setPage={setPage} />
    </div>
  );
}
