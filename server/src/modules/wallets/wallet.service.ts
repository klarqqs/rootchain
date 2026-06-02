import { StellarNetwork } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import { getStellarNetwork } from "../../stellar/config.js";

const STELLAR_G = /^G[A-Z2-7]{55}$/;

export async function linkWallet(userId: string, publicKey: string): Promise<{ publicKey: string }> {
  const key = publicKey.trim();
  if (!STELLAR_G.test(key)) {
    throw new AppError(400, "INVALID_PUBLIC_KEY", "Invalid Stellar public key");
  }

  const network = getStellarNetwork() === "mainnet" ? StellarNetwork.MAINNET : StellarNetwork.TESTNET;

  const existing = await prisma.wallet.findUnique({ where: { publicKey: key } });
  if (existing && existing.userId !== userId) {
    throw new AppError(409, "WALLET_IN_USE", "This wallet is linked to another account");
  }

  await prisma.wallet.upsert({
    where: { userId },
    create: { userId, publicKey: key, network },
    update: { publicKey: key, network },
  });

  return { publicKey: key };
}

export async function getWallet(userId: string) {
  return prisma.wallet.findUnique({ where: { userId } });
}
