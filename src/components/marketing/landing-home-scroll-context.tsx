/* eslint-disable react-refresh/only-export-components -- hook + provider pair */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { LandingHomeSectionId } from "@/lib/landing-section-ids";

type LandingHomeScrollValue = {
  activeSection: LandingHomeSectionId;
  setActiveSection: (id: LandingHomeSectionId) => void;
  scrollProgress: number;
  setScrollProgress: (n: number) => void;
  reset: () => void;
};

const LandingHomeScrollContext = createContext<LandingHomeScrollValue | null>(null);

export function LandingHomeScrollProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<LandingHomeSectionId>("platform");
  const [scrollProgress, setScrollProgress] = useState(0);

  const reset = useCallback(() => {
    setActiveSection("platform");
    setScrollProgress(0);
  }, []);

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      scrollProgress,
      setScrollProgress,
      reset,
    }),
    [activeSection, scrollProgress, reset],
  );

  return <LandingHomeScrollContext.Provider value={value}>{children}</LandingHomeScrollContext.Provider>;
}

export function useLandingHomeScroll() {
  const ctx = useContext(LandingHomeScrollContext);
  if (!ctx) {
    throw new Error("useLandingHomeScroll must be used within LandingHomeScrollProvider");
  }
  return ctx;
}
