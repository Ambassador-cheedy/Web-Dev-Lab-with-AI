'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ConsentChoice = 'all' | 'essential' | null;

type ConsentState = {
  choice: ConsentChoice;
  decidedAt: string | null;
  decide: (choice: Exclude<ConsentChoice, null>) => void;
  reset: () => void;
};

export const useConsent = create<ConsentState>()(
  persist(
    (set) => ({
      choice: null,
      decidedAt: null,
      decide: (choice) => set({ choice, decidedAt: new Date().toISOString() }),
      reset: () => set({ choice: null, decidedAt: null }),
    }),
    { name: 'obioma-consent', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
