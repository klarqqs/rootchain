import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services";
import { useNotificationsStore } from "@/store/notifications.store";
import { useCallback } from "react";

export function useAuth() {
  const { status, session, signOut } = useAuthStore(
    useShallow((s) => ({
      status: s.status,
      session: s.session,
      signOut: s.signOut,
    })),
  );
  const pushToast = useNotificationsStore((s) => s.push);

  const signIn = useCallback(async () => {
    const res = await authService.signInWithWallet();
    if (!res.ok) {
      pushToast({
        tone: "error",
        title: "Sign-in failed",
        description: res.error.message,
        duration: 5000,
      });
      return false;
    }
    pushToast({
      tone: "success",
      title: "Authenticated",
      description: "Session active for 24 hours",
      duration: 3000,
    });
    return true;
  }, [pushToast]);

  return {
    status,
    session,
    isAuthenticated: status === "authenticated" && !!session,
    signIn,
    signOut,
  };
}
