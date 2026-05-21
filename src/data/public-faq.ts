export interface PublicFaqItem {
  q: string;
  a: string;
}

/** When true, copy reflects phased Stellar Public (mainnet) routing enabled at build time. */
const MAINNET_FAQ_MODE = import.meta.env.VITE_MAINNET_ROUTING_ENABLED === "true";

export const PUBLIC_FAQ_ITEMS: PublicFaqItem[] = [
  {
    q: "Is this mainnet?",
    a: MAINNET_FAQ_MODE
      ? "This deployment allows Stellar Public (mainnet) when the app and your wallet are set to the public ledger. Transactions use real network fees and configured issuers — always confirm Freighter’s network and asset details before signing."
      : "By default ROOTCHAIN uses Stellar testnet for pilots. Operators can enable phased mainnet routing with explicit env configuration, custody, and disclosures before moving real funds.",
  },
  {
    q: "Where do deposits go?",
    a: MAINNET_FAQ_MODE
      ? "When your wallet signs a transfer, funds follow the on-chain path shown in the receipt (escrow / platform accounts from your deployment env). Always verify the destination on a block explorer before signing."
      : "When Freighter executes a transfer, escrow receives test XLM equivalents. Investor ownership is mirrored in your portfolio + optional Supabase indexing.",
  },
  {
    q: "Are returns guaranteed?",
    a: "No. Projections are illustrative. Always treat demo environments as simulations until independent audits publish.",
  },
  {
    q: "How do escalations work?",
    a: "Use the Farmer intake form for registration. Operators can track submissions in Admin Console once VITE_ADMIN_TOKEN is configured.",
  },
];
