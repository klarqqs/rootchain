/**
 * Public marketing assets for the platform journey (replace URLs with your own CDN).
 * Images: Unsplash (license per Unsplash terms). Video: MDN sample (CC0) as placeholder loop.
 */
export const PLATFORM_HERO_VIDEO = {
  src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  type: "video/mp4" as const,
  poster:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80&auto=format&fit=crop",
  caption: "Placeholder motion — swap for your filmed cooperative / field operations reel.",
};

export const PLATFORM_FLOW_STEPS: {
  title: string;
  caption: string;
  image: string;
}[] = [
  {
    title: "Verify the farm",
    caption: "Operators ingest cooperative dossiers, soil baselines, and issuance parameters before a program opens.",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Capital locks in escrow",
    caption: "Investors fund milestone rails on Stellar testnet — USDC flows mirror how production escrow will behave.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Milestones hit the ledger",
    caption: "Field evidence, attestations, and releases are designed to hash to one audit trail investors can read.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Harvest settles transparently",
    caption: "Proceeds route to farmer rails and investor wallets with the same disclosure posture you expect from AgriFi.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80&auto=format&fit=crop",
  },
];
