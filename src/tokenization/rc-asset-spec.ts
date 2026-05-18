/**
 * Planned ROOTCHAIN issuance metadata for future Soroban/Stellar issuance.
 *
 * ⚠ Phase 4 only prepares scaffolding — assets are NOT minted onto testnet/mainnet yet.
 */

export interface PlannedAssetSpec {
  code: string;
  /** Human-readable network description (actual issuer set at issuance time). */
  issuerPlaceholder: string;
  description: string;
  decimals: number;
  memoTemplate: string;
}

export function describePlannedHarvestShare(symbol: string, produceId: string): PlannedAssetSpec {
  return {
    code: symbol,
    issuerPlaceholder:
      "[ROOTCHAIN_ISSUER] Configure VITE_PLATFORM_ISSUER for future asset experiments.",
    description: `Future farm-backed share linked to harvested listing ${produceId}.`,
    decimals: 7,
    memoTemplate: `rc-harvest-share:${produceId}`,
  };
}
