/**
 * Re-export of /data seeds plus future server-side mock fixtures.
 *
 * /data — typed UI seeds (Phase 1)
 * /mock-data — backend simulation fixtures (this folder)
 *
 * Components should still import from `@/data/*`; services should pull from
 * here so swapping to a real backend touches one boundary.
 */
export * from "@/data/produce";
export * from "@/data/market";
export * from "@/data/wallet";
export * from "@/data/community";
export * from "@/data/social";
