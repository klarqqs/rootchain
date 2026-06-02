# ROOTCHAIN — Master Product Note

> **Positioning:** The infrastructure layer for transparent agricultural financing in Africa — not a crowdfunding app.

## What Rootchain is

Rootchain is **transparent on-chain agricultural finance infrastructure** that connects verified African farmers with global investors using blockchain, AI, and real-time farm intelligence.

### Problems we solve

- Lack of agricultural funding
- Investor distrust
- Farm fraud
- Poor transparency
- Disconnected agricultural financing systems in Africa

**Outcome:** Make agriculture investable globally.

---

## Core identity

Rootchain should feel like:

- Fintech
- Blockchain infrastructure
- Agricultural intelligence
- Investment marketplace
- AI-powered transparency system

Rootchain should **not** feel like:

- Crowdfunding website
- Donation platform
- Basic farming app

---

## The three users

### 1. Investors

Fund farms and earn returns.

| Capability | Description |
|------------|-------------|
| Browse verified farms | Marketplace with risk, ROI, progress |
| Invest with stablecoins | USDC on Stellar |
| Monitor progress | Updates, activity feed, milestones |
| Track ROI | Portfolio + analytics |
| Harvest payouts | Escrow release / payout rail (roadmap) |
| AI recommendations | Risk engine scores + briefs |
| Diversify | Portfolio allocation analytics |

### 2. Farmers

Farm owners seeking institutional capital.

| Capability | Description |
|------------|-------------|
| Create projects | Wizard + admin review |
| Upload farm proof | KYC docs, media, updates |
| Receive funding | On-chain investment confirm |
| Manage milestones | Update types + escrow rail |
| Investor visibility | Engagement analytics |
| AI farming insights | Ag intelligence + risk factors |
| Withdrawals | Protected release (roadmap) |

### 3. Admins

Trust and security layer.

| Capability | Description |
|------------|-------------|
| Verify farms | Farmer + document review |
| Approve listings | Project review queue |
| Monitor fraud | Velocity signals + audit |
| Freeze accounts | Suspicious activity (roadmap) |
| Manage withdrawals | Policy + approval (roadmap) |
| Monitor transactions | Ledger + Horizon verify |
| Resolve disputes | Review notes + audit trail |

---

## Core features

### Verified farm system

Every farm passes verification before listing:

- Government ID
- GPS / location attestation
- Farm photos & video
- Land verification
- Crop verification
- Wallet verification

**Result:** Investor trust at the platform layer.

### Investment marketplace

Central discovery surface. Each listing includes:

- Funding goal · expected ROI · crop type · farm size
- Risk level · harvest timeline · AI score · funding progress

### Stellar blockchain integration

- Transparent payments · on-chain records · USDC transfers
- Fast settlement · investor wallets · farmer payouts
- Every investment traceable on Horizon

### Wallet system

Per user:

- USDC balance (Freighter / linked key)
- Transaction history · investment balance · payout balance
- Withdrawal system (production escrow release — in progress)

**Future:** NGN off-ramp · local bank · mobile money.

### AI risk engine

Analyzes: crop risk · weather · farmer history · regional factors · funding behavior · yield assumptions.

Outputs: **trust score** · **risk score** · **expected ROI prediction**.

Implementation: heuristic v1 in `server/src/ai/risk-engine.ts` — structured for ML swap.

### Live transparency

Farmers publish: images · videos · expense logs · milestones · harvest reports.

Investors see: real-time activity feed · project updates · platform activity.

### Investor dashboard (institutional-grade)

Portfolio value · active investments · expected profits · risk analytics · AI recommendations · payout history · watchlists · notifications.

### Farmer operating dashboard

Funding · expenses · milestones · investor comms · harvest updates · analytics · withdrawals.

### Trust & security

KYC · escrow logic · fraud monitoring · audit logs · admin review · withdrawal protection · suspicious activity detection.

---

## Future features (not v1)

| Feature | Description |
|---------|-------------|
| Farm tokenization | Fractional ownership of farms |
| Secondary marketplace | Trade investment positions |
| Satellite & drone | Advanced field monitoring |
| IoT farm tracking | Sensor feeds |
| Rootchain credit score | AI farmer reliability index |

---

## Design direction

**Reference:** Bloomberg · Stripe · Coinbase · modern fintech dashboards.

**Use:** Dark UI · glassmorphism · analytics charts · live metrics · financial typography · maps · real-time feeds.

**Avoid:** Cartoon farming · childish green themes · cluttered layouts.

Tokens: `src/index.css` · `src/lib/tokens.ts`.

---

## Technology (target vs current)

| Area | Product target | Current repo |
|------|----------------|--------------|
| Frontend | Next.js | **React 19 + Vite 8** (Next.js = later phase) |
| Backend | Node + PostgreSQL + Prisma | **`server/`** on Railway |
| Blockchain | Stellar + Soroban | **Stellar SDK** + Horizon verify; Soroban planned |
| Storage | S3 / Cloudinary | URL-based media (upload service TBD) |
| Realtime | Supabase / Firebase / Pusher | **SSE + optional Redis** (`/api/v1/realtime/stream`) |
| Auth | — | **JWT API** or legacy **Supabase** when `VITE_API_URL` unset |

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [PRODUCTION.md](./PRODUCTION.md) for implementation detail.

---

## End goal

Build:

- The largest agricultural investment network in Africa
- A trusted farmer financial identity system
- Transparent on-chain agricultural financing
- Global access to African agricultural opportunity

**Long-term vision:** The financial operating system for African agriculture.

---

## Build status (living)

See [ARCHITECTURE.md](./ARCHITECTURE.md) § *Current vs target* and the alignment table in README. Update this section as milestones ship.
