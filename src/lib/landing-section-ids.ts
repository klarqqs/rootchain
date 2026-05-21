export const LANDING_SECTION_IDS = ["hero", "platform", "community", "how-it-works", "landing-faq"] as const;
export type LandingHomeSectionId = (typeof LANDING_SECTION_IDS)[number];
