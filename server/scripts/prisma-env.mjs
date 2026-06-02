/**
 * Loads server/.env then optional repo-root .env, then runs Prisma CLI.
 * Usage: node scripts/prisma-env.mjs migrate deploy
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(serverRoot, "..");

config({ path: resolve(serverRoot, ".env") });
config({ path: resolve(repoRoot, ".env"), override: false });

if (!process.env.DATABASE_URL) {
  console.error(
    [
      "Missing DATABASE_URL.",
      "",
      "Create server/.env (recommended):",
      "  cp server/.env.example server/.env",
      "",
      "With Docker Postgres from repo root:",
      "  docker compose up -d postgres",
      "",
      "Start Docker Postgres from repo root (port 5433 — avoids macOS Postgres on 5432):",
      "  cd .. && docker compose up -d postgres",
      "",
      "Default local URL:",
      "  DATABASE_URL=postgresql://rootchain:rootchain@localhost:5433/rootchain",
    ].join("\n"),
  );
  process.exit(1);
}

const args = process.argv.slice(2).join(" ") || "migrate deploy";
execSync(`npx prisma ${args}`, {
  stdio: "inherit",
  env: process.env,
  cwd: serverRoot,
});
