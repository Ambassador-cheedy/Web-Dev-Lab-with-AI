'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { uid } from '@/lib/utils';

export type SavedLook = {
  id: string;
  productSlug: string;
  productName: string;
  colour: string;
  size: string;
  score: number;
  profileName: string;
  createdAt: string;
};

type LooksState = {
  looks: SavedLook[];
  save: (look: Omit<SavedLook, 'id' | 'createdAt'>) => void;
  remove: (id: string) => void;
};

export const useLooks = create<LooksState>()(
  persist(
    (set) => ({
      looks: [],
      save: (look) =>
        set((s) => ({
          looks: [
            { ...look, id: uid('look'), createdAt: new Date().toISOString() },
            ...s.looks.filter(
              (l) =>
                !(
                  l.productSlug === look.productSlug &&
                  l.size === look.size &&
                  l.colour === look.colour
                ),
            ),
          ].slice(0, 24),
        })),
      remove: (id) => set((s) => ({ looks: s.looks.filter((l) => l.id !== id) })),
    }),
    { name: 'obioma-looks', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
