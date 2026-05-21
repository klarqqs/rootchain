import { LandingSections } from "@/components/marketing/LandingSections";
import type { Page } from "@/lib/nav";

interface HomePageProps {
  setPage: (p: Page) => void;
}

export function HomePage({ setPage }: HomePageProps) {
  return <LandingSections setPage={setPage} />;
}
