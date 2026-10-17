'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BagLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  colour: string;
  size: string;
  quantity: number;
  madeToMeasure?: boolean;
};

type BagState = {
  lines: BagLine[];
  isOpen: boolean;
  add: (line: Omit<BagLine, 'key' | 'quantity'>, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const lineKey = (l: Pick<BagLine, 'productId' | 'colour' | 'size' | 'madeToMeasure'>) =>
  `${l.productId}|${l.colour}|${l.size}|${l.madeToMeasure ? 'mtm' : 'std'}`;

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
            : [...s.lines, { ...line, key, quantity }];
          return { lines, isOpen: true };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 10) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'obioma-bag',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true,
    },
  ),
);

export const bagCount = (lines: BagLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const bagSubtotal = (lines: BagLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);
