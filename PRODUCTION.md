# Rootchain production deployment

Institutional agricultural finance infrastructure — deploy checklist.

## Architecture

| Component | Target | Notes |
|-----------|--------|-------|
| Web | Vercel / CloudFront + S3 | Static Vite build |
| API | Railway / AWS ECS / Docker | `server/` |
| PostgreSQL | Railway / RDS | Prisma migrations |
| Redis | Railway / ElastiCache | Cache + realtime fan-out (optional) |
| Stellar | Horizon | Testnet or mainnet via env |

## Environment

### API (`server/.env`)

Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`

Recommended production:

```env
NODE_ENV=production
STELLAR_NETWORK=mainnet
PLATFORM_ESCROW_MAINNET=G...
REDIS_URL=redis://...
EMAIL_ENABLED=true
EMAIL_PROVIDER=resend
LOG_LEVEL=info
```

### Web (`.env`)

```env
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_STELLAR_NETWORK=PUBLIC
VITE_PLATFORM_ESCROW_MAINNET=G...
```

## Deploy API (Railway)

1. Create PostgreSQL + Redis plugins
2. Set root directory to `server/`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npx prisma migrate deploy && npm run start`
5. Health: `GET /api/v1/health`

## Deploy web (Vercel)

1. Framework: Vite
2. Build command: `npm run build`
3. Output: `dist`
4. Set `VITE_*` env vars in project settings

## Docker

```bash
docker compose up --build
```

See `docker-compose.yml` for local full stack.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

- Lint + build web
- Build + typecheck API
- Prisma validate

## Production features

- **AI risk engine**: `GET /api/v1/ai/projects/:id/risk`
- **Realtime**: SSE `GET /api/v1/realtime/stream?token=JWT`
- **Notifications**: `GET /api/v1/notifications/mine`
- **Transparency**: `GET /api/v1/transparency/activity`
- **Analytics**: `/api/v1/analytics/{investor|farmer|admin}`

## Security

- Rate limits on auth + investments
- Horizon tx verification on confirm
- Fraud velocity middleware
- Helmet + CORS lock
- Audit logs on all state changes

## Monitoring

- Railway metrics / CloudWatch
- Log drain from Pino JSON logs
- Alert on `health` failures and 5xx rate
