export type Page =
  | "home"
  | "marketplace"
  | "verification"
  | "dashboard"
  | "community"
  | "wallet"
  | "farmers"
  | "help"
  | "register"
  | "privacy"
  | "terms"
  | "roadmap"
  | "admin"
  | "launch"
  | "ecosystem"
  | "insights"
  | "compliance"
  | "login"
  | "signup"
  | "forgot-password"
  | "account";

export const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  home: { title: "Overview", subtitle: "Premium AgriFi marketplace built on-chain" },
  marketplace: { title: "Marketplace", subtitle: "Live agricultural investment opportunities" },
  verification: { title: "Blockchain Verification", subtitle: "Immutable proof of produce ownership" },
  dashboard: { title: "Portfolio Analytics", subtitle: "Track your harvest investments in real-time" },
  community: { title: "Community", subtitle: "Direct line to farmers & investors" },
  wallet: { title: "Wallet", subtitle: "Stellar-native USDC settlement & on-chain shares" },
  farmers: { title: "Farmer Directory", subtitle: "Verified producers powering the harvest chain" },
  help: { title: "Help Center", subtitle: "Onboarding, FAQs, alerts, and investor education" },
  register: {
    title: "Farmer Intake",
    subtitle: "Register your cooperative for milestone-verified escrow programs",
  },
  privacy: { title: "Privacy", subtitle: "How ROOTCHAIN collects and protects sensitive data" },
  terms: { title: "Terms of Service", subtitle: "Responsible use of ROOTCHAIN prototypes and testnet tooling" },
  roadmap: { title: "Product Roadmap", subtitle: "Stellar-aligned milestones from demo to issuance" },
  admin: {
    title: "Operator Console",
    subtitle: "Internal tools for escrow monitoring and farmer attestations — token protected",
  },
  launch: { title: "Public Launch · Waitlist", subtitle: "Pilot programs, demos, early investor onboarding" },
  ecosystem: {
    title: "Ecosystem Partnerships",
    subtitle: "Cooperative, NGO, fintech & Stellar network collaborations",
  },
  insights: {
    title: "Agricultural Intelligence",
    subtitle: "Weather + risk overlays for treasury discipline — pilot analytics",
  },
  compliance: {
    title: "Compliance & Disclosures",
    subtitle: "Regulatory preparedness, disclaimers & audit scaffolding",
  },
  login: {
    title: "Sign in",
    subtitle: "Secure access to your ROOTCHAIN portfolio and dashboards",
  },
  signup: {
    title: "Create account",
    subtitle: "Investor, farmer, or operator onboarding with Supabase Auth",
  },
  "forgot-password": {
    title: "Recover access",
    subtitle: "Password reset via secure email — no secrets stored in plaintext",
  },
  account: {
    title: "My profile",
    subtitle: "Account identity, linked wallet, and verification posture",
  },
};
