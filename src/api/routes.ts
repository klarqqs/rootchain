/**
 * Future REST API contract. These string keys are consumed by /services
 * today (used as cache keys) and will become real endpoint paths in Phase 3.
 *
 * Keeping them centralized makes the migration mechanical.
 */
export const API = {
  wallet: {
    balance: "/wallet/balance",
    history: "/wallet/history",
  },
  portfolio: {
    snapshot: "/portfolio/snapshot",
    positions: "/portfolio/positions",
  },
  marketplace: {
    list: "/marketplace/produce",
    invest: "/marketplace/invest",
    sell: "/marketplace/sell",
  },
  transactions: {
    submit: "/transactions/submit",
    detail: "/transactions/:hash",
  },
  auth: {
    challenge: "/auth/challenge",
    verify: "/auth/verify",
    session: "/auth/session",
  },
} as const;
