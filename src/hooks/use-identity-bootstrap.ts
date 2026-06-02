import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/database/client";
import { isApiBackendConfigured } from "@/lib/api/config";
import { loadTokens } from "@/lib/api/token-storage";
import { fetchAppProfile } from "@/services/auth-session.service";
import { apiFetchMe } from "@/services/api-auth.service";
import { useIdentityStore } from "@/store/identity.store";

function apiSessionStub(userId: string, email: string): Session {
  return {
    access_token: "api",
    refresh_token: "api",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: userId,
      email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  } as Session;
}

async function loadSupabaseProfile(session: Session | null) {
  if (!session?.user?.id) {
    useIdentityStore.getState().setAuthSnapshot({ session: null, profile: null });
    return;
  }
  useIdentityStore.getState().setAuthSnapshot({ session });
  const profile = await fetchAppProfile(session.user.id);
  useIdentityStore.getState().setAuthSnapshot({ profile });
}

async function loadApiProfile() {
  const tokens = loadTokens();
  if (!tokens) {
    useIdentityStore.getState().setAuthSnapshot({ session: null, profile: null });
    return;
  }

  const profile = await apiFetchMe();
  if (!profile) {
    useIdentityStore.getState().setAuthSnapshot({ session: null, profile: null });
    return;
  }

  useIdentityStore.getState().setAuthSnapshot({
    profile,
    session: apiSessionStub(profile.id, ""),
  });
}

/**
 * Hydrates identity from Railway API or Supabase.
 */
export function useIdentityBootstrap() {
  useEffect(() => {
    if (isApiBackendConfigured()) {
      let alive = true;
      void loadApiProfile()
        .catch(() => {
          if (alive) useIdentityStore.getState().clear();
        })
        .finally(() => {
          if (alive) useIdentityStore.getState().setHydration("ready");
        });
      return () => {
        alive = false;
      };
    }

    const sb = supabase;
    if (!sb) {
      useIdentityStore.getState().setHydration("ready");
      return;
    }

    let alive = true;

    sb.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!alive) return;
        void loadSupabaseProfile(session);
      })
      .finally(() => {
        if (alive) useIdentityStore.getState().setHydration("ready");
      });

    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        useIdentityStore.getState().setAuthSnapshot({ passwordRecoveryMode: true });
        void loadSupabaseProfile(session);
        return;
      }
      if (event === "USER_UPDATED" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadSupabaseProfile(session);
        return;
      }
      if (event === "SIGNED_OUT") {
        useIdentityStore.getState().clear();
      }
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
}
