/**
 * Marketplace-facing farmer network layer (UI + future API hydration).
 * Handle keys omit the leading @ used in ProduceItem.farmerHandle.
 */

export interface MarketFarmerProfile {
  /** Matches ProduceItem.farmerHandle without @ prefix */
  handle: string;
  displayName: string;
  portraitUrl: string;
  specialty: string;
  farm: string;
  location: string;
  region: "West Africa" | "East Africa" | "Southern Africa" | "Central Africa";
  yearsExperience: number;
  verified: boolean;
  roundsFunded: number;
  harvestSuccessPct: number;
  investorRating: number /** 1–5 */;
  bio: string;
}

export const MARKET_FARMERS: MarketFarmerProfile[] = [
  {
    handle: "adeola.farm",
    displayName: "Adeola Okonkwo",
    portraitUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Cereals & mechanized maize",
    farm: "Ogun Highlands Cooperative",
    location: "Ogun, NG",
    region: "West Africa",
    yearsExperience: 16,
    verified: true,
    roundsFunded: 14,
    harvestSuccessPct: 94,
    investorRating: 4.85,
    bio: "Cooperative chair operating precision irrigation pilots with on-chain disbursement rails.",
  },
  {
    handle: "kwame.cocoa",
    displayName: "Kwame Adjei",
    portraitUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Cocoa grading & fermentary ops",
    farm: "Ashanti Cocoa Collective",
    location: "Kumasi, GH",
    region: "West Africa",
    yearsExperience: 22,
    verified: true,
    roundsFunded: 31,
    harvestSuccessPct: 97,
    investorRating: 4.92,
    bio: "Export-focused cooperative lead with audited moisture certificates per lot.",
  },
  {
    handle: "nneka.roots",
    displayName: "Nneka Eze",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Cassava & starch derivatives",
    farm: "Cross River Roots",
    location: "Calabar, NG",
    region: "West Africa",
    yearsExperience: 13,
    verified: true,
    roundsFunded: 11,
    harvestSuccessPct: 91,
    investorRating: 4.71,
    bio: "Roots processor linking smallholders to chipped export markets.",
  },
  {
    handle: "tobi.kebbi",
    displayName: "Tobi Adelaja",
    portraitUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Irrigated paddy rice",
    farm: "Kebbi Rice Mills",
    location: "Kebbi, NG",
    region: "West Africa",
    yearsExperience: 18,
    verified: true,
    roundsFunded: 26,
    harvestSuccessPct: 93,
    investorRating: 4.74,
    bio: "Flood-plain rice corridors with volumetric telemetry on every levy gate.",
  },
  {
    handle: "ifeoma.aqua",
    displayName: "Ifeoma Bassey",
    portraitUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Tilapia RAS & pond networks",
    farm: "Lekki Aquaculture",
    location: "Lagos, NG",
    region: "West Africa",
    yearsExperience: 15,
    verified: true,
    roundsFunded: 21,
    harvestSuccessPct: 89,
    investorRating: 4.82,
    bio: "Recirc aquaculture mentor with lagoon-side satellite dissolved-oxygen dashboards.",
  },
  {
    handle: "yusuf.poultry",
    displayName: "Yusuf Bello",
    portraitUrl:
      "https://images.unsplash.com/photo-1599566150163-90194bfbd541?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Contract broiler arcs",
    farm: "Kaduna Poultry Co.",
    location: "Kaduna, NG",
    region: "West Africa",
    yearsExperience: 12,
    verified: true,
    roundsFunded: 17,
    harvestSuccessPct: 88,
    investorRating: 4.61,
    bio: "Layer + broiler integrator aligning feed conversion KPIs with investor cohorts.",
  },
  {
    handle: "ibrahim.ranch",
    displayName: "Ibrahim Lawal",
    portraitUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Grass-fed Angus finishing",
    farm: "Plateau Ranches",
    location: "Jos, NG",
    region: "West Africa",
    yearsExperience: 24,
    verified: true,
    roundsFunded: 42,
    harvestSuccessPct: 95,
    investorRating: 4.93,
    bio: "Ranch economist pairing satellite pasture NDVI with biometric ear tags.",
  },
  {
    handle: "chioma.delta",
    displayName: "Chioma Nwosu",
    portraitUrl:
      "https://images.unsplash.com/photo-1573496527892-71f69306a065?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Catfish grow-out ponds",
    farm: "Delta AquaFarms",
    location: "Asaba, NG",
    region: "West Africa",
    yearsExperience: 11,
    verified: true,
    roundsFunded: 13,
    harvestSuccessPct: 90,
    investorRating: 4.63,
    bio: "Pond economist digitizing biomass sampling for milestone releases.",
  },
  {
    handle: "amara.sorghum",
    displayName: "Amara Kone",
    portraitUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Sahel cereals & hardy sorghum",
    farm: "Bamako Drylands",
    location: "Bamako, ML",
    region: "West Africa",
    yearsExperience: 19,
    verified: true,
    roundsFunded: 27,
    harvestSuccessPct: 92,
    investorRating: 4.76,
    bio: "Conservation agriculture trainer focused on rainfall-indexed disbursements.",
  },
  {
    handle: "zara.toma",
    displayName: "Zara Mukhtar",
    portraitUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Greenhouse tomato clusters",
    farm: "Jos Flora Glasshouses",
    location: "Plateau, NG",
    region: "West Africa",
    yearsExperience: 10,
    verified: true,
    roundsFunded: 9,
    harvestSuccessPct: 93,
    investorRating: 4.57,
    bio: "Hydro-led tomato operator publishing weekly Brix proofs to escrow reviewers.",
  },
  {
    handle: "david.yam",
    displayName: "David Ntung",
    portraitUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Seed yam mound cultivation",
    farm: "Obudu Highland Tubers",
    location: "Cross River, NG",
    region: "West Africa",
    yearsExperience: 21,
    verified: true,
    roundsFunded: 18,
    harvestSuccessPct: 89,
    investorRating: 4.72,
    bio: "Tuber agronomist bundling heirloom cultivars into export-grade crates.",
  },
  {
    handle: "fatima.pepper",
    displayName: "Fatima Yusuf",
    portraitUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Scotch bonnets & cayenne dryers",
    farm: "Kano Spice Collective",
    location: "Kano, NG",
    region: "West Africa",
    yearsExperience: 14,
    verified: true,
    roundsFunded: 15,
    harvestSuccessPct: 87,
    investorRating: 4.54,
    bio: "Post-harvest heat curve specialist guarding capsaicin stability for exporters.",
  },
  {
    handle: "samuel.wheat",
    displayName: "Samuel Bekoe",
    portraitUrl:
      "https://images.unsplash.com/photo-1542190891-2093bf387bcc?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Irrigated winter wheat belts",
    farm: "Nkawkaw Grain Exchange",
    location: "Eastern Region, GH",
    region: "West Africa",
    yearsExperience: 17,
    verified: true,
    roundsFunded: 23,
    harvestSuccessPct: 90,
    investorRating: 4.79,
    bio: "Rotational wheat-grower benchmarking protein premiums against Chicago soft red.",
  },
  {
    handle: "helen.soy",
    displayName: "Helena Musoke",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497491208-87b942cabd8c?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Rain-fed soybean blocks",
    farm: "Albertine Soy Corridor",
    location: "Mbarara, UG",
    region: "East Africa",
    yearsExperience: 20,
    verified: true,
    roundsFunded: 34,
    harvestSuccessPct: 92,
    investorRating: 4.81,
    bio: "Soil-health advocate integrating rhizobia inoculants tracked per escrow tranche.",
  },
  {
    handle: "juma.coffee",
    displayName: "Juma Mwangi",
    portraitUrl:
      "https://images.unsplash.com/photo-1545167622-3a936fafb01f?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Washed arabica terraces",
    farm: "Thika Highlands Cooperative",
    location: "Kiambu, KE",
    region: "East Africa",
    yearsExperience: 15,
    verified: true,
    roundsFunded: 29,
    harvestSuccessPct: 96,
    investorRating: 4.94,
    bio: "Micro-lot coffee curator hashing cupping scores before capital unlocks.",
  },
  {
    handle: "aminat.gnuts",
    displayName: "Aminath Diallo",
    portraitUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Groundnut shells & confection lots",
    farm: "Zaria Legume Consortium",
    location: "Kaduna, NG",
    region: "West Africa",
    yearsExperience: 13,
    verified: true,
    roundsFunded: 12,
    harvestSuccessPct: 88,
    investorRating: 4.62,
    bio: "Aflatoxin sentinel lab tethered directly to disbursement auditors.",
  },
  {
    handle: "lindiwe.fruit",
    displayName: "Lindiwe Dlamini",
    portraitUrl:
      "https://images.unsplash.com/photo-1525134479668-ebee49858a87?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Table grapes & citrus",
    farm: "Breede Valley Orchards",
    location: "Western Cape, ZA",
    region: "Southern Africa",
    yearsExperience: 18,
    verified: true,
    roundsFunded: 41,
    harvestSuccessPct: 94,
    investorRating: 4.83,
    bio: "Perennial crop financier structuring cold-chain milestones.",
  },
  {
    handle: "masego.goat",
    displayName: "Masego Radebe",
    portraitUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60fea?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Boer-cross veld goats",
    farm: "Molopo Caprine Trust",
    location: "Northern Cape, ZA",
    region: "Southern Africa",
    yearsExperience: 16,
    verified: true,
    roundsFunded: 28,
    harvestSuccessPct: 91,
    investorRating: 4.73,
    bio: "Rangeland rotational grazier aligning stocking rate telemetry with escrow gates.",
  },
  {
    handle: "rosa.palm",
    displayName: "Rosa Mbarga",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497161161-c3e737079e71?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "RSPO-aligned palm fractions",
    farm: "Kribi Coastal Mills",
    location: "Kribi, CM",
    region: "Central Africa",
    yearsExperience: 19,
    verified: true,
    roundsFunded: 33,
    harvestSuccessPct: 90,
    investorRating: 4.71,
    bio: "Palm economist linking traceable fresh fruit bunches to refinery SLA clocks.",
  },
  {
    handle: "peter.swine",
    displayName: "Peter Achebe",
    portraitUrl:
      "https://images.unsplash.com/photo-1504257432389-3eacd1e8f3bf?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Contract finishing swine arcs",
    farm: "Nsukka Protein Partners",
    location: "Enugu, NG",
    region: "West Africa",
    yearsExperience: 12,
    verified: false,
    roundsFunded: 6,
    harvestSuccessPct: 84,
    investorRating: 4.41,
    bio: "Indoor-finishing prototype farm piloting biometric feed conversion audits.",
  },
  {
    handle: "hana.dairy",
    displayName: "Hana Mekonnen",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497161079-0533dcb6d40c?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Pastoral dairy herds",
    farm: "Sidama Dairy Union",
    location: "Hawassa, ET",
    region: "East Africa",
    yearsExperience: 25,
    verified: true,
    roundsFunded: 52,
    harvestSuccessPct: 95,
    investorRating: 4.91,
    bio: "Dairy coop GM orchestrating chilling-plant escrow releases on milk-fat tests.",
  },
  {
    handle: "kemi.vegbox",
    displayName: "Kemi Sowande",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497491366-0863e50c7d5c?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Peri-urban mixed veg crates",
    farm: "Epe Veg Express",
    location: "Lagos, NG",
    region: "West Africa",
    yearsExperience: 9,
    verified: true,
    roundsFunded: 12,
    harvestSuccessPct: 86,
    investorRating: 4.53,
    bio: "Last-mile CSA operator pairing weekly crates with escrow-friendly harvest SLAs.",
  },
  {
    handle: "tendai.onions",
    displayName: "Tendai Marufu",
    portraitUrl:
      "https://images.unsplash.com/photo-1573497491213-bd28d074b6c4?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Short-day onion ladders",
    farm: "Mashonaland Bulb Growers",
    location: "Marondera, ZW",
    region: "Southern Africa",
    yearsExperience: 15,
    verified: true,
    roundsFunded: 21,
    harvestSuccessPct: 89,
    investorRating: 4.58,
    bio: "Curing-floor humidity telemetry mapped to disbursement attestations.",
  },
  {
    handle: "nala.millet",
    displayName: "Nala Ouédraogo",
    portraitUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=240&h=240&q=80",
    specialty: "Fonio & pearl millet",
    farm: "Sahel Grain Circles",
    location: "Ouagadougou, BF",
    region: "West Africa",
    yearsExperience: 17,
    verified: true,
    roundsFunded: 23,
    harvestSuccessPct: 88,
    investorRating: 4.62,
    bio: "Climate-smart cereals bundler aligning rainfall-index insurance with escrow.",
  },
];

/** Central lookup by handle slug (no @ prefix). */
export const FARMER_BY_HANDLE: Record<string, MarketFarmerProfile> = Object.fromEntries(
  MARKET_FARMERS.map((f) => [f.handle, f]),
);

export function normalizeFarmerHandle(h: string): string {
  return h.replace(/^@/, "").trim();
}

export function getMarketFarmerByHandle(rawHandle: string): MarketFarmerProfile | undefined {
  return FARMER_BY_HANDLE[normalizeFarmerHandle(rawHandle)];
}
