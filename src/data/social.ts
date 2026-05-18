export interface Testimonial {
  id: string;
  name: string;
  role: string;
  region: string;
  quote: string;
  avatarColor: string;
  initials: string;
  verified: boolean;
  metric?: { label: string; value: string };
  type: "farmer" | "investor";
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Adeola Okonkwo",
    role: "Maize Farmer · Ogun Highlands",
    region: "Ogun, Nigeria",
    quote: "ROOTCHAIN gave us upfront capital for the irrigation we always needed. Three milestones in, our yield is already 18% above target — and the investors see it on-chain in real time.",
    avatarColor: "#84CC16",
    initials: "AO",
    verified: true,
    metric: { label: "Yield uplift", value: "+18.4%" },
    type: "farmer",
  },
  {
    id: "t-2",
    name: "Daria Hoffmann",
    role: "Climate Fund Manager",
    region: "Berlin, DE",
    quote: "The auditability is what sold us. Every USDC we deploy is matched to a verified milestone, with sensor data and photos hashed on Stellar. It's the cleanest impact reporting I've seen.",
    avatarColor: "#0EA5E9",
    initials: "DH",
    verified: true,
    metric: { label: "Deployed", value: "$2.4M" },
    type: "investor",
  },
  {
    id: "t-3",
    name: "Kwame Adjei",
    role: "Cocoa Cooperative Lead",
    region: "Kumasi, Ghana",
    quote: "We used to wait six months for buyer payments. Now investors fund the harvest and settlement is instant — in USDC, not naira. Our entire collective is on the chain.",
    avatarColor: "#A16207",
    initials: "KA",
    verified: true,
    metric: { label: "Settlement", value: "T+0" },
    type: "farmer",
  },
  {
    id: "t-4",
    name: "Mei Tanaka",
    role: "Retail Investor",
    region: "Singapore",
    quote: "I thought agricultural investing was off-limits unless you owned land. With ROOTCHAIN I bought 4 shares of a tilapia harvest in Lagos for $400 — and watched it harvest live.",
    avatarColor: "#38BDF8",
    initials: "MT",
    verified: true,
    metric: { label: "ROI realized", value: "+22.4%" },
    type: "investor",
  },
  {
    id: "t-5",
    name: "Ibrahim Lawal",
    role: "Cattle Rancher",
    region: "Jos, Nigeria",
    quote: "The smart contracts release funds the moment the herd hits each weight benchmark. No middlemen, no delays. My ranch staff get paid the same day milestones confirm.",
    avatarColor: "#DC2626",
    initials: "IL",
    verified: true,
    metric: { label: "Funded", value: "$184K" },
    type: "farmer",
  },
  {
    id: "t-6",
    name: "Chioma Nwosu",
    role: "Catfish Farmer",
    region: "Asaba, Nigeria",
    quote: "ROOTCHAIN is the first time I've seen a fintech actually understand the rhythm of farming. They built around our seasons, not the other way around.",
    avatarColor: "#0EA5E9",
    initials: "CN",
    verified: true,
    metric: { label: "Pond uptime", value: "99.4%" },
    type: "farmer",
  },
];

export interface TrustedPartner {
  name: string;
  category: string;
}

export const TRUSTED_BY: TrustedPartner[] = [
  { name: "Stellar Development Foundation", category: "Protocol Partner" },
  { name: "Circle USDC", category: "Settlement" },
  { name: "Mercy Corps Ventures", category: "Impact" },
  { name: "Acumen Fund", category: "Investor" },
  { name: "African Development Bank", category: "Institution" },
  { name: "MARA Foundation", category: "Climate" },
  { name: "Sankore Capital", category: "VC" },
  { name: "Microsoft for Startups", category: "Infrastructure" },
];

export interface LiveActivity {
  id: string;
  text: string;
  type: "invest" | "milestone" | "claim" | "listing" | "bridge" | "verify";
  ts: string;
}

export const LIVE_ACTIVITY: LiveActivity[] = [
  { id: "a1", text: "0x7a9f…c4e2 invested 2,400 USDC in RC-0421", type: "invest", ts: "just now" },
  { id: "a2", text: "RC-0388 milestone 4 confirmed on-chain", type: "milestone", ts: "12s" },
  { id: "a3", text: "0x3f12…8b91 claimed 1,820 USDC from RC-0512", type: "claim", ts: "44s" },
  { id: "a4", text: "New listing: RC-0628 Red Angus Cattle (480K target)", type: "listing", ts: "1m" },
  { id: "a5", text: "RC-0476 funding 39% complete · 47 shares remaining", type: "milestone", ts: "1m" },
  { id: "a6", text: "Cross-chain bridge: 12,000 USDC settled to Stellar", type: "bridge", ts: "2m" },
  { id: "a7", text: "Field photo verified for RC-0421 (IPFS QmX9…)", type: "verify", ts: "2m" },
  { id: "a8", text: "0xb421…1d70 invested 5,000 USDC in RC-0388", type: "invest", ts: "3m" },
  { id: "a9", text: "@juma.coffee synced a new Kyoto-style cupping attestation · RC-0799", type: "verify", ts: "4m" },
  { id: "a10", text: "12 investors followed Rosa Mbarga (@rosa.palm) after RSPO dossier unlocked", type: "listing", ts: "6m" },
  { id: "a11", text: "$92K USDC tranche escrowed toward RC-0766 palm sterilisation phase", type: "milestone", ts: "7m" },
  { id: "a12", text: "$8.9K routed to Lagos CSA veg crate payouts · RC-0823 milestone 6", type: "claim", ts: "9m" },
  { id: "a13", text: "@helen.soy published rhizobia lab hash on IPFS · RC-0788 diligence", type: "verify", ts: "11m" },
  { id: "a14", text: "0xfeed…abcd matched 740 USDC in RC-0812 pearl millet tranche", type: "invest", ts: "12m" },
];

export interface PlatformStat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const PLATFORM_STATS: PlatformStat[] = [
  { label: "Total Volume Settled", value: 48.2, prefix: "$", suffix: "M", decimals: 1 },
  { label: "Farms On-chain", value: 1284 },
  { label: "Median Investor ROI", value: 21.4, suffix: "%", decimals: 1 },
  { label: "Verified Farmers", value: 642 },
  { label: "Active Harvests", value: 187 },
  { label: "Countries", value: 14 },
];
