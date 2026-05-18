import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/database/client";
import { fetchAppProfile } from "@/services/auth-session.service";
import { useIdentityStore } from "@/store/identity.store";

async function loadProfile(session: Session | null) {
  if (!session?.user?.id) {
    useIdentityStore.getState().setAuthSnapshot({ session: null, profile: null });
    return;
  }
  useIdentityStore.getState().setAuthSnapshot({ session });
  const profile = await fetchAppProfile(session.user.id);
  useIdentityStore.getState().setAuthSnapshot({ profile });
}

/**
 * Hydrates identity from Supabase + subscribes to auth changes.
 * Safe no-op when `supabase` client is unavailable.
 */
export function useIdentityBootstrap() {
  useEffect(() => {
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
        void loadProfile(session);
      })
      .finally(() => {
        if (alive) useIdentityStore.getState().setHydration("ready");
      });

    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        useIdentityStore.getState().setAuthSnapshot({ passwordRecoveryMode: true });
        void loadProfile(session);
        return;
      }
      if (event === "USER_UPDATED" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadProfile(session);
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
