'use client';

/**
 * Mock, email-only authentication. Everything lives on this device.
 * To use a real provider (Auth.js, Clerk, Supabase...), implement AuthProvider
 * and swap `useAuth` for a hook backed by that provider's session.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type User = { email: string; name?: string; createdAt: string };

export interface AuthProvider {
  user: User | null;
  signIn: (email: string, name?: string) => Promise<User>;
  signOut: () => Promise<void>;
}

type AuthState = AuthProvider;

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: async (email, name) => {
        const user = {
          email: email.trim().toLowerCase(),
          name,
          createdAt: new Date().toISOString(),
        };
        set({ user });
        return user;
      },
      signOut: async () => {
        set({ user: null });
      },
    }),
    { name: 'obioma-auth', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
