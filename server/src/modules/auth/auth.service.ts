import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from "./jwt.service.js";
import { writeAuditLog } from "../../utils/audit.js";

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  avatarUrl: string | null;
  walletPublicKey: string | null;
  farmerVerificationStatus: string | null;
}

function toUserDto(user: {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  avatarUrl: string | null;
  wallet: { publicKey: string } | null;
  farmerProfile: { verificationStatus: string } | null;
}): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    walletPublicKey: user.wallet?.publicKey ?? null,
    farmerVerificationStatus: user.farmerProfile?.verificationStatus ?? null,
  };
}

const userInclude = {
  wallet: { select: { publicKey: true } },
  farmerProfile: { select: { verificationStatus: true } },
} as const;

async function issueTokens(user: {
  id: string;
  email: string;
  role: Role;
}): Promise<AuthTokens> {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: "INVESTOR" | "FARMER";
}): Promise<{ user: UserDto; tokens: AuthTokens }> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: input.role as Role,
        fullName: input.fullName.trim(),
      },
      include: userInclude,
    });

    if (input.role === "FARMER") {
      await tx.farmerProfile.create({
        data: {
          userId: created.id,
          displayName: input.fullName.trim(),
          verificationStatus: "PENDING",
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: created.id },
      include: userInclude,
    });
  });

  const tokens = await issueTokens(user);
  await writeAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    entityType: "user",
    entityId: user.id,
    metadata: { role: user.role },
  });

  return { user: toUserDto(user), tokens };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: UserDto; tokens: AuthTokens }> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: userInclude,
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  return { user: toUserDto(user), tokens };
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const hash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hash },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "INVALID_REFRESH", "Refresh token invalid or expired");
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  return issueTokens(stored.user);
}

export async function getUserById(id: string): Promise<UserDto | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });
  return user ? toUserDto(user) : null;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const hash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
}
