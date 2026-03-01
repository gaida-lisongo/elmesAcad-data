"use client";

import { UserType } from "@/app/types/mentor";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthState = {
  user: UserType | null;
  token: string | null;
  hydrated: boolean;
  isSuperAdmin: boolean;

  // setters
  setSession: (payload: { user: UserType; token: string }) => void;
  logout: () => void;
  setHydrated: () => void;
  setSuperAdmin: () => void;

  // helpers
  isAuthenticated: () => boolean;
  authHeader: () => Record<string, string | undefined>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      isSuperAdmin: false,

      setSession: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null, isSuperAdmin: false }),
      setHydrated: () => set({ hydrated: true }),
      setSuperAdmin: () => {
        const user = get().user;
        const roles = user?.autorisations || [];
        set({ isSuperAdmin: roles.includes("SUPER-ADMIN") });
      },

      isAuthenticated: () => !!get().token,
      authHeader: () => {
        const token = get().token;
        return token
          ? { Authorization: `Bearer ${token}` }
          : ({} as Record<string, string>);
      },
    }),
    {
      name: "elmes-auth", // clé localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isSuperAdmin: state.isSuperAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
