'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BodyBase, BodyMeasurements } from '@/lib/fit/types';
import type { Unit } from '@/lib/units';
import { uid } from '@/lib/utils';

export type SkinTone = { id: string; name: string; hex: string; shadow: string };

export const SKIN_TONES: SkinTone[] = [
  { id: 'porcelain', name: 'Porcelain', hex: '#F3D9C8', shadow: '#DDB9A3' },
  { id: 'ivory', name: 'Ivory', hex: '#E9C6A8', shadow: '#CFA584' },
  { id: 'honey', name: 'Honey', hex: '#D6A579', shadow: '#B9875B' },
  { id: 'golden', name: 'Golden', hex: '#C08A5B', shadow: '#A06D41' },
  { id: 'caramel', name: 'Caramel', hex: '#A26C43', shadow: '#82522E' },
  { id: 'chestnut', name: 'Chestnut', hex: '#7E4F30', shadow: '#603920' },
  { id: 'umber', name: 'Umber', hex: '#5E3A24', shadow: '#442717' },
  { id: 'ebony', name: 'Ebony', hex: '#3F271A', shadow: '#2B1A10' },
];

export type MeasurementProfile = {
  id: string;
  name: string;
  base: BodyBase;
  skinTone: string;
  measurements: BodyMeasurements;
  updatedAt: string;
  /** True once saved to the (mock) account rather than device only. */
  syncedToAccount?: boolean;
};

type MeasurementState = {
  profiles: MeasurementProfile[];
  activeId: string | null;
  unit: Unit;
  setUnit: (unit: Unit) => void;
  save: (profile: Omit<MeasurementProfile, 'id' | 'updatedAt'> & { id?: string }) => string;
  remove: (id: string) => void;
  removeAll: () => void;
  setActive: (id: string | null) => void;
};

export const useMeasurements = create<MeasurementState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      unit: 'cm',
      setUnit: (unit) => set({ unit }),
      save: (input) => {
        const id = input.id ?? uid('profile');
        const profile: MeasurementProfile = { ...input, id, updatedAt: new Date().toISOString() };
        set((s) => {
          const exists = s.profiles.some((p) => p.id === id);
          return {
            profiles: exists ? s.profiles.map((p) => (p.id === id ? profile : p)) : [...s.profiles, profile],
            activeId: id,
          };
        });
        return id;
      },
      remove: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id);
          return { profiles, activeId: s.activeId === id ? (profiles[0]?.id ?? null) : s.activeId };
        }),
      removeAll: () => set({ profiles: [], activeId: null }),
      setActive: (id) => set({ activeId: id }),
    }),
    {
      name: 'obioma-measurements',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function useActiveProfile(): MeasurementProfile | null {
  return useMeasurements((s) => s.profiles.find((p) => p.id === s.activeId) ?? s.profiles[0] ?? null);
}
