# Rootchain Platform Architecture

Institutional-grade agricultural finance on Stellar. This document is the source of truth for the **Railway + PostgreSQL + Prisma** backend migration.

## Current vs target

| Layer | Before (broken paths) | Now (Phase 1) |
|-------|------------------------|---------------|
| Frontend | Vite + React 19 (`src/`) | Same UI; API via `VITE_API_URL` |
| Auth | Supabase Auth | JWT (`server/`) |
| Data | Supabase client + RLS | Prisma + REST API |
| DB | Supabase Postgres | Railway PostgreSQL |
| Wallet | Freighter/LOBSTR + Horizon | Unchanged client; server stores `publicKey` |
| Invest | Partial DB + XDR placeholder | API + Horizon verify (Phase 2) |

**Note:** Product spec mentions Next.js 15 — the existing UI is Vite. Next.js migration is a separate phase; backend is framework-agnostic.

## Repository layout

```text
rootchain/
├── ARCHITECTURE.md          ← this file
├── src/                     ← web app (Vite) — keep until Next.js migration
│   ├── api/                 ← HTTP client → Railway (new)
│   ├── lib/stellar/         ← Horizon, trustlines, tx build (client)
│   ├── features/
│   ├── pages/
│   └── hooks/
├── server/                  ← Node API (Railway)
│   ├── prisma/schema.prisma
│   └── src/
│       ├── config/          ← env validation (Zod)
│       ├── middleware/      ← auth, RBAC, errors
│       ├── modules/         ← domain routes
│       ├── stellar/         ← network config + tx verify
│       └── lib/             ← prisma, logger, redis
├── supabase/migrations/     ← legacy reference only
└── .env.example
```

## Backend API structure

```text
/api/v1
  /health
  /auth
    POST /register
    POST /login
    POST /refresh
    GET  /me
  /wallets
    GET  /me
    PUT  /me                 ← link Stellar public key (connect wallet)
  /projects
    POST /                   ← farmer: create draft
    GET  /mine               ← farmer: own projects
    GET  /:id
  /marketplace
    GET  /listings           ← investor: verified farmers + active projects
  /investments
    POST /                   ← investor: record + verify tx hash
    GET  /mine
  /admin
    GET  /farmers/pending
    PATCH /farmers/:id/verify
    GET  /projects/pending
    PATCH /projects/:id/review
    GET  /audit-logs
```

## Database (Prisma)

Core entities:

- **User** — email auth, role (`INVESTOR` | `FARMER` | `ADMIN`)
- **Wallet** — Stellar `publicKey`, optional encrypted secret (custodial only; prefer connect-only)
- **FarmerProfile** — KYC / verification status
- **Farm** — optional farm entity linked to farmer
- **Project** — funding campaign, status workflow
- **ProjectMedia** — S3/Cloudinary URLs (Phase 2 upload)
- **VerificationDocument** — ID, land photos
- **Investment** — USDC amount, on-chain tx hash, status
- **Transaction** — audit trail for marketplace ops
- **ProjectUpdate** — farmer progress posts
- **AdminReview** — approve/reject with notes
- **AuditLog** — immutable admin actions

### Project status workflow

```text
DRAFT → PENDING_REVIEW → ACTIVE → FUNDED → CLOSED
              ↓
          REJECTED / CANCELLED
```

### Farmer verification

```text
PENDING → SUBMITTED → VERIFIED | REJECTED
```

## Stellar architecture

```text
server/src/stellar/
  config.ts      ← STELLAR_NETWORK=testnet|mainnet → Horizon, USDC issuer, escrow
  verify.ts      ← confirm payment tx on Horizon (Phase 2 invest)

src/lib/stellar/  ← client-side sign (Freighter/LOBSTR)
```

**Rule:** Private keys never leave the user wallet in the default flow. Server only stores `wallet.publicKey` after connect.

## Security

- Passwords: bcrypt (12 rounds)
- JWT access (15m) + refresh (7d) — rotate via `JWT_SECRET`
- RBAC middleware: `requireAuth`, `requireRole('ADMIN')`, etc.
- Rate limiting on auth routes (Redis in Phase 2; in-memory stub for dev)
- Zod validation on all inputs
- CORS locked to `CORS_ORIGIN`
- No secrets in `VITE_*` except public Stellar network flags

## Phase 1 status (implemented)

| Area | Status |
|------|--------|
| `server/` Express API + Prisma schema + migration | Done |
| JWT auth + RBAC (`/auth`, middleware) | Done |
| Wallets (`PUT /wallets/me`) | Done |
| Marketplace (`GET /marketplace/listings`) | Done |
| Projects + submit for review | Done |
| Admin verification (`/admin/farmers`, `/admin/projects`, audit logs) | Done |
| Investments API (create + confirm tx hash) | Done — wire UI in Phase 2 |
| Frontend dual-backend (`VITE_API_URL` → API, else Supabase) | Done |

## Phase 2 — core engine (implemented)

| Capability | API / UI |
|------------|----------|
| Full project create (media, risk, AI score, location) | `POST /projects`, upload modal wizard |
| Marketplace filters/sort/pagination | `GET /marketplace/listings?…` |
| USDC invest + Horizon verify | `POST /investments`, confirm, `stellar/verify.ts` |
| Transaction transparency | `GET /transactions/project/:id` |
| Investor / farmer dashboards | `GET /portfolio/investor`, `/portfolio/farmer` |
| Live farm updates | `GET/POST /updates/project/:id` (poll 15–20s) |
| Escrow abstraction | `server/src/stellar/escrow.ts` |

## Phase 3 — next

| Area | Notes |
|------|-------|
| S3/Cloudinary uploads | Replace URL paste for media |
| Soroban escrow contract | Wire `escrow.ts` to contract |
| Admin UI → API | `admin.tsx` |
| Redis rate limits | `REDIS_URL` |
| Real-time (SSE/WebSocket) | Replace polling on updates |

## Environment

**Server (Railway):** see `server/.env.example`

**Web:** `VITE_API_URL=https://your-api.up.railway.app/api/v1`

## Local development

```bash
# Terminal 1 — API + Postgres (Docker or Railway local)
cd server && cp .env.example .env && npm install && npx prisma migrate dev && npm run dev

# Terminal 2 — Web
npm install && npm run dev
```

## Railway deploy

1. Create PostgreSQL plugin → copy `DATABASE_URL`
2. Deploy `server/` with start command `npm run start`
3. Set env vars from `server/.env.example`
4. Run `npx prisma migrate deploy` on release
5. Point frontend `VITE_API_URL` to Railway URL
