import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  STELLAR_HORIZON_URL_TESTNET: z.string().url().default("https://horizon-testnet.stellar.org"),
  STELLAR_HORIZON_URL_MAINNET: z.string().url().default("https://horizon.stellar.org"),
  STELLAR_PASSPHRASE_TESTNET: z.string().default("Test SDF Network ; September 2015"),
  STELLAR_PASSPHRASE_MAINNET: z
    .string()
    .default("Public Global Stellar Network ; September 2015"),
  USDC_ISSUER_TESTNET: z.string().default("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
  USDC_ISSUER_MAINNET: z.string().default("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
  PLATFORM_ESCROW_TESTNET: z.string().optional(),
  PLATFORM_ESCROW_MAINNET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  EMAIL_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  EMAIL_PROVIDER: z.enum(["log", "resend", "sendgrid"]).default("log"),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    throw new Error("Environment validation failed. Check server/.env");
  }
  return parsed.data;
}

export const env = loadEnv();
