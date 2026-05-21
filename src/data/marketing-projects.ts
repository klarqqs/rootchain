export interface MarketingFeaturedProject {
  id: string;
  name: string;
  location: string;
  crop: string;
  roi: string;
  fundedPct: number;
  duration: string;
  verified: boolean;
  raised: string;
  remainingShares: number;
  image: string;
}

/** Curated public showcase projects — illustrative pilot data. */
export const MARKETING_FEATURED_PROJECTS: MarketingFeaturedProject[] = [
  {
    id: "mp-1",
    name: "Kaduna Rice Expansion",
    location: "Kaduna, Nigeria",
    crop: "Irrigated rice",
    roi: "19.2%",
    fundedPct: 78,
    duration: "14 months",
    verified: true,
    raised: "$612K",
    remainingShares: 124,
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
  },
  {
    id: "mp-2",
    name: "Ogun Poultry Growth Project",
    location: "Ogun, Nigeria",
    crop: "Layer poultry",
    roi: "22.8%",
    fundedPct: 54,
    duration: "11 months",
    verified: true,
    raised: "$284K",
    remainingShares: 89,
    image:
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80",
  },
  {
    id: "mp-3",
    name: "Lagos Hydroponic Farm",
    location: "Lagos, Nigeria",
    crop: "Leafy greens",
    roi: "17.4%",
    fundedPct: 91,
    duration: "9 months",
    verified: true,
    raised: "$428K",
    remainingShares: 31,
    image:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
  },
  {
    id: "mp-4",
    name: "Kano Tomato Greenhouse",
    location: "Kano, Nigeria",
    crop: "Tomatoes",
    roi: "24.1%",
    fundedPct: 63,
    duration: "12 months",
    verified: true,
    raised: "$356K",
    remainingShares: 67,
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc1?w=800&q=80",
  },
];
