'use client';

import { create } from 'zustand';

/**
 * Persisted stores skip automatic hydration so the first client render matches the
 * server render. StoreHydrator rehydrates them after mount and flips this flag.
 */
export const useHydrationFlag = create<{ hydrated: boolean; set: () => void }>()((set) => ({
  hydrated: false,
  set: () => set({ hydrated: true }),
}));

export const useHydrated = () => useHydrationFlag((s) => s.hydrated);
