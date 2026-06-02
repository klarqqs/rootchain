/**
 * JWT authentication against the Railway API (`server/`).
 */

import type { AppProfileRow } from "@/database/types";
import { apiRequest } from "@/lib/api/http-client";
import { clearTokens, loadTokens, saveTokens } from "@/lib/api/token-storage";

export interface ApiUserDto {
  id: string;
  email: string;
  role: "INVESTOR" | "FARMER" | "ADMIN";
  fullName: string;
  avatarUrl: string | null;
  walletPublicKey: string | null;
  farmerVerificationStatus: string | null;
}

function mapRole(role: ApiUserDto["role"]): AppProfileRow["role"] {
  if (role === "ADMIN") return "admin";
  if (role === "FARMER") return "farmer";
  return "investor";
}

function mapFarmerStatus(
  status: string | null,
): AppProfileRow["farmer_verification_status"] {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "verified") return "verified";
  if (s === "rejected") return "rejected";
  if (s === "submitted") return "submitted";
  return "pending";
}

export function apiUserToProfile(user: ApiUserDto): AppProfileRow {
  const now = new Date().toISOString();
  return {
    id: user.id,
    role: mapRole(user.role),
    full_name: user.fullName,
    avatar_url: user.avatarUrl,
    wallet_public_key: user.walletPublicKey,
    farmer_verification_status: mapFarmerStatus(user.farmerVerificationStatus),
    onboarding_completed: false,
    created_at: now,
    updated_at: now,
  };
}

export async function apiRegister(input: {
  email: string;
  password: string;
  fullName: string;
  role: "INVESTOR" | "FARMER";
}): Promise<{ user: ApiUserDto; profile: AppProfileRow }> {
  const data = await apiRequest<{
    user: ApiUserDto;
    tokens: { accessToken: string; refreshToken: string };
  }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    { auth: false },
  );

  saveTokens({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  });

  return { user: data.user, profile: apiUserToProfile(data.user) };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ user: ApiUserDto; profile: AppProfileRow }> {
  const data = await apiRequest<{
    user: ApiUserDto;
    tokens: { accessToken: string; refreshToken: string };
  }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { auth: false },
  );

  saveTokens({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  });

  return { user: data.user, profile: apiUserToProfile(data.user) };
}

export async function apiFetchMe(): Promise<AppProfileRow | null> {
  const data = await apiRequest<{ user: ApiUserDto | null }>("/auth/me");
  if (!data.user) return null;
  return apiUserToProfile(data.user);
}

export async function apiLogout(): Promise<void> {
  const tokens = loadTokens();
  if (tokens?.refreshToken) {
    try {
      await apiRequest(
        "/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        },
        { auth: false },
      );
    } catch {
      /* best-effort */
    }
  }
  clearTokens();
}

export async function apiLinkWallet(publicKey: string): Promise<void> {
  await apiRequest("/wallets/me", {
    method: "PUT",
    body: JSON.stringify({ publicKey }),
  });
}
