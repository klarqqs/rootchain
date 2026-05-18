# ROOTCHAIN

> **Africa's Agricultural Financial Infrastructure — built on Stellar, settled in USDC.**
>
> **Phase 1** — Premium UI/UX Foundation (complete).
> **Phase 2** — Safe backend foundation + Stellar Testnet integration (complete).

A premium AgriFi marketplace UI inspired by **Stripe · Coinbase · Linear · Vercel · Apple**. Every component is hand-crafted, animated, responsive, and modular.

Phase 2 layered a real fintech backbone underneath without disturbing Phase 1's design.

---

## Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | **React 19 + Vite 8 + TypeScript**                  |
| Styling      | **Tailwind CSS v4** (via `@tailwindcss/vite`)       |
| Animations   | **Framer Motion**                                   |
| Charts       | **Recharts**                                        |
| Icons        | **Lucide**                                          |
| Typography   | **Satoshi** (display) · **Inter** (fallback) · **JetBrains Mono** |
| Design Tokens | Centralized in `src/index.css` `@theme` + `src/lib/tokens.ts` |

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

Type-check on its own: `npx tsc -b`.

---

## Folder map

```
src/
├── App.tsx                          # Root layout + state machine (page, modals, wallet)
├── main.tsx                         # React entry
├── index.css                        # Tailwind v4 + design tokens + global utilities
├── vite-env.d.ts
├── lib/
│   ├── nav.ts                       # Page type + page metadata
│   ├── tokens.ts                    # Design tokens for JS-driven styling (charts, motion)
│   └── utils.ts                     # cn(), formatUsd(), truncateAddr(), etc.
├── data/                            # Typed mock data (will be swapped for live APIs in Phase 2)
│   ├── produce.ts
│   ├── market.ts
│   ├── wallet.ts
│   ├── community.ts
│   └── social.ts
├── components/
│   ├── ui/                          # Reusable primitives
│   │   ├── glass.tsx                # Glassmorphic surface
│   │   ├── pill.tsx                 # Status / category pills
│   │   ├── button.tsx               # Btn (primary/ghost/outline/dark/danger/subtle)
│   │   ├── stat.tsx                 # KPI tile
│   │   ├── animated-counter.tsx     # Spring-animated number
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── ambient-bg.tsx           # Radial glows + grid + noise
│   │   ├── particles.tsx            # Lime particles
│   │   ├── ticker.tsx               # Marquee commodity ticker
│   │   ├── sidebar.tsx              # Premium dark sidebar w/ wallet preview
│   │   ├── topbar.tsx               # Sticky topbar w/ search + connect
│   │   └── loading-screen.tsx
│   ├── home/                        # Landing page sections
│   │   ├── hero.tsx
│   │   ├── trusted-by.tsx
│   │   ├── stats-section.tsx
│   │   ├── how-it-works.tsx
│   │   ├── trending.tsx
│   │   ├── live-activity-feed.tsx
│   │   ├── testimonials.tsx
│   │   └── cta.tsx
│   ├── dashboard/
│   │   ├── weather-widget.tsx
│   │   ├── market-insights.tsx
│   │   └── commodity-stats.tsx
│   ├── produce/
│   │   ├── produce-card.tsx
│   │   ├── produce-visual.tsx       # Topographic SVG illustration
│   │   └── qr-pattern.tsx
│   ├── wallet/
│   │   └── wallet-icon.tsx          # Bespoke SVG logos for each provider
│   └── modals/
│       ├── wallet-modal.tsx         # Freighter / Albedo / xBull / WalletConnect / Ledger
│       ├── invest-modal.tsx
│       ├── upload-modal.tsx
│       └── qr-verify-modal.tsx
└── pages/
    ├── home.tsx                     # Composes the landing sections
    ├── marketplace.tsx
    ├── verification.tsx
    ├── dashboard.tsx
    ├── wallet.tsx                   # Dedicated wallet page (balance, send/receive/deposit, assets)
    └── community.tsx                # Chat with farmers + smart-contract bots
```

---

## Design system

All visual decisions are tokenized in two places:

1. **CSS** — `src/index.css` declares Tailwind v4 design tokens via `@theme`:
   - Brand palette (`bg`, `surface`, `lime-300/400/500`, `forest`, `ink`, etc.)
   - Typography stacks (`--font-sans`, `--font-display`, `--font-mono`)
   - Radii (`--radius-xs` through `--radius-3xl`)
   - Animations (`--animate-shimmer`, `--animate-marquee`, `--animate-grid-move`, etc.)
   - Custom utilities: `.surface`, `.glow-lime`, `.text-gradient-lime`, `.shimmer-loop`, `.mask-fade-x`, `.focus-ring`, etc.

2. **JS** — `src/lib/tokens.ts` exposes the same palette to Recharts and inline-style consumers.

Spacing follows Tailwind defaults (4-pt grid). Section gap on the landing page is `space-y-16 lg:space-y-24`. Card padding is consistently `p-4`/`p-5`/`p-6`. Card radii are consistently `rounded-2xl`. Stroke width on icons is `1.4`–`1.6` for glyphs and `2.4`+ for branded marks.

---

## Pages

### Home
Cinematic landing. Hero with floating dashboard preview. Animated counter stats. Trusted-by marquee. How-it-works (4 steps). Live activity ticker. 6 testimonial cards (farmers + investors with verified badges & metrics). Closing CTA with particle background.

### Marketplace
9 verified harvests. Search, sort (Trending / Highest ROI / Top Quality / Growth Stage / Ending Soon), and category chips. Each card carries: farmer profile (initial avatar), location, risk level, days-to-harvest, quantity, harvest date, shares-open, expected ROI, animated funding bar with shimmer.

### Verification
On-chain asset list (left) → QR + token detail + ownership distribution (center) → live verification timeline + smart-contract activity (right).

### Dashboard
Top-line KPIs · portfolio area chart (8mo) · allocation pie · harvest performance bar chart · weather/field-conditions widget · 4-tile commodity pulse with sparklines · curated market insights · transaction history.

### Wallet
**Dedicated** wallet page (not just a modal). Balance hero with hide/show toggle, address copy, QR. Action grid: Send / Receive / Deposit / Bridge. Assets list (USDC, XLM, RC-SHARES). Recent activity. Wallet modal supports: **Freighter, Albedo, xBull, WalletConnect, Ledger**.

### Community
WhatsApp-grade chat split-pane. Verified-farmer roster, smart-contract bot threads, IPFS-attached lab reports, in-thread contract-signing CTA, message timeline with motion-staggered bubbles.

---

## Animation conventions

- Page transitions: `AnimatePresence mode="wait"` with `opacity` + 8px Y slide (300ms).
- Card mount-in: `initial y:20 opacity:0` → `whileInView` with stagger by index (`0.04 * i` capped at `0.3`).
- Buttons: `whileHover y:-1` + `whileTap scale:0.97` spring (stiffness 400, damping 22).
- Loading: shimmer gradient via `.shimmer-loop` utility.
- Marquee: 18–50s linear-infinite with `mask-fade-x` for soft edges.
- Counters: spring (stiffness 80, damping 20) using `framer-motion`'s `useSpring` + `useTransform`.

---

## What is mocked

This is **strictly Phase 1**: visual realism only.

| Mocked                                                | Path                |
| ----------------------------------------------------- | ------------------- |
| Produce listings, farmers, hashes, milestones         | `data/produce.ts`   |
| Tickers, allocation, commodity history, insights      | `data/market.ts`    |
| Wallet providers, assets, transactions                | `data/wallet.ts`    |
| Chat threads & messages                               | `data/community.ts` |
| Testimonials, trusted-by partners, platform stats     | `data/social.ts`    |

Modal flows (Connect Wallet → Connecting → Success, Invest → Confirming → Success) use timers; replace with real wallet calls + Soroban/Stellar SDK in Phase 2.

---

## Accessibility & UX

- All interactive elements have `aria-label`s where icon-only.
- Visible focus rings via `.focus-ring` (2px lime + 4px halo).
- Semantic headings throughout.
- Color contrast meets WCAG AA on body text (`#94A3B8` on `#0E1411`).
- `prefers-reduced-motion` respected by Framer Motion defaults.
- Mobile sidebar uses backdrop, escape via overlay tap.

---

## Phase 2 — Backend Foundation

Phase 2 added the architecture you'd expect from a real fintech without
risking real funds. Everything is **testnet only** and the existing UI was
preserved in place — Phase 2 only added wires underneath.

### New folders

```
src/
├── api/                # Future REST API boundary (mock fetch + routes manifest)
├── features/wallet/    # Wallet-feature surfaces (Send/Deposit composer)
├── hooks/              # use-wallet, use-toast, use-transactions, use-portfolio,
│                       # use-market-feed, use-auth
├── lib/stellar/        # Network config, Horizon client, Freighter wrapper,
│                       # account utils, tx-builder (XDR construction)
├── mock-data/          # Backend simulation fixtures (re-exports + portfolio seed)
├── services/           # wallet, marketplace, transactions, portfolio, auth +
│                       # transaction simulation engine
├── store/              # Zustand: wallet, portfolio, transactions, market,
│                       # notifications, auth (all persisted via localStorage)
├── types/              # Shared contracts (wallet, transaction, portfolio,
│                       # notifications, common Result/AsyncState)
└── utils/              # generateStellarHash, shortHash, ledger counter
```

### Real Stellar Testnet integration

- **Freighter wallet** — real connection flow via `@stellar/freighter-api`. The
  modal verifies the network is testnet, requests permission, reads the public
  key, and pulls live balances from Horizon.
- **Other providers** (Albedo, xBull, WalletConnect, Ledger) — connect through
  the same service interface but stay simulated for now (UI/UX identical).
- **Refusal of mainnet** — `lib/stellar/config.ts` forces testnet and warns if
  someone overrides the env. All explorer links route to Stellar Expert testnet.
- **Transaction builder** (`tx-builder.ts`) — produces real Stellar XDR for
  `payment` and `changeTrust`. Phase 2 doesn't broadcast yet; Phase 3 will plug
  Freighter signing + Horizon submission into the same call sites.

### Transaction simulation engine

Driven by `services/transaction-engine.ts`. Each transaction goes through:

```
building → signing → broadcasting → pending (1..5 confirmations) → confirmed
```

Listeners receive every state transition. The `transactions.store` upserts on
every step so the UI can subscribe without polling. Transactions:

- Generate Stellar-format 64-char hex hashes via `crypto.getRandomValues`.
- Use a real `0.00001 XLM` base fee.
- Reach 5 confirmations over ~2.2s (configurable via `VITE_TX_CONFIRM_DELAY_MS`).
- Settle real balance changes (USDC debit + RC-SHARES credit on `INVEST`, etc.).
- Emit toast notifications + populate the explorer-style detail modal.

### State management — Zustand stores

| Store              | Persisted | Concerns                                                   |
| ------------------ | --------- | ---------------------------------------------------------- |
| `wallet.store`     | yes       | account, balances, total USD, hydration flag, last error   |
| `transactions.store` | yes     | tx history (200 max), spotlight hash                      |
| `portfolio.store`  | yes       | active positions, derived snapshot, seed-on-first-load    |
| `market.store`     | no        | live activity feed (auto-driven by `useMarketFeedSimulator`) |
| `notifications.store` | no    | toast queue with auto-dismiss timers                       |
| `auth.store`       | yes       | wallet-bound mock session (Phase 3 → SEP-10 JWT)           |

### Hooks API surface

Components only ever import from `@/hooks` — never from `@/store` directly.
This keeps a swap-friendly boundary:

- `useWallet()` — `{ status, isConnected, account, balances, totalUsd, connect, disconnect, refresh }`
- `useTransactions()` — `{ records, spotlightHash, setSpotlight }`
- `useTransaction(hash)` — single record by hash
- `usePortfolio()` — `{ positions, snapshot }` (auto-seeds on first call)
- `useMarketFeed()` / `useMarketFeedSimulator()` — live activity tape
- `useToast()` — `{ push, update, dismiss, clear }`
- `useAuth()` — `{ status, session, isAuthenticated, signIn, signOut }`

### What changed in existing UI

Surgically — to keep Phase 1 visuals untouched:

- `Sidebar` / `TopBar` now read wallet status from `useWallet()` instead of
  receiving a `walletConnected` prop. Visuals unchanged.
- `WalletModal` calls `useWallet().connect(provider.id)`. Adds an error state
  + Stellar Testnet pill at the top.
- `WalletPage` reads live balances + transactions, shows refresh + explorer
  buttons, hides on disconnect, opens a real `Send` / `Deposit` composer
  modal that submits transactions through the engine.
- `InvestModal` validates against real USDC balance, dynamic CTA label
  ("Confirm & Sign" vs "Simulate Investment"), success state shows real hash
  + explorer link, "View receipt" opens the tx-detail modal.
- `DashboardPage` derives KPIs from the wallet + portfolio stores; transaction
  history is now clickable → opens tx-detail modal.

### New UI components

- `<Toaster />` — bottom-right toast portal (success/info/warning/error/loading
  with shimmer for loading).
- `<TxDetailModal />` — explorer-style detail modal: hash, copy, explorer link,
  confirmation progress dots, full lifecycle stages (building → signing →
  broadcasting → confirming), receipt grid (amount, fee, ledger, timestamps,
  counterparty, memo).
- `<SendModal />` — Send/Deposit composer with destination, amount, memo, real
  validation against USDC balance.
- `<AuthGate />` — generic wallet-bound gate for protected surfaces (opt-in;
  current pages handle disconnected state inline).

### Environment

Configure via `.env` (see `.env.example`):

```
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_STELLAR_SOROBAN_RPC=https://soroban-testnet.stellar.org

VITE_USDC_ASSET_CODE=USDC
VITE_USDC_ISSUER=GA5ZSE...K4KZVN
VITE_RC_ASSET_CODE=RCSHARE
VITE_RC_ISSUER=GA5ZSE...K4KZVN

VITE_MOCK_LATENCY_MS=600
VITE_MOCK_ERROR_RATE=0
VITE_TX_CONFIRM_DELAY_MS=2200
```

### What is still mocked

| Mocked                               | Where it lives                       |
| ------------------------------------ | ------------------------------------ |
| Marketplace produce listings         | `data/produce.ts` (Phase 1 seeds)    |
| Mock-backend latency + error injection | `api/client.ts`                    |
| Tx broadcast to network              | `services/transaction-engine.ts`     |
| Auth session signature               | `services/auth.service.ts`           |
| USDC trustline establishment         | `lib/stellar/tx-builder.ts` (built, not submitted) |

### Phase 3 roadmap (not in this commit)

- Replace the simulator with `horizon().submitTransaction()` after `signWithFreighter`
- SEP-10 challenge/response auth with a tiny edge worker
- Code-split the Stellar SDK (currently 526 KB gzipped due to inclusion)
- Optional Supabase backing store for off-chain metadata
- Multi-wallet ecosystem: real Albedo, xBull, WalletConnect bridges

---

## License

Internal — ROOTCHAIN AgriFi · Phase 2 prototype.
