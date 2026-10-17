'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BagLine } from './bag';

export type Order = {
  id: string;
  createdAt: string;
  lines: BagLine[];
  total: number;
  status: 'Processing' | 'In the atelier' | 'Dispatched' | 'Delivered';
};

export type MadeToMeasureRequest = {
  id: string;
  createdAt: string;
  productName?: string;
  profileName?: string;
  occasion: string;
  deadline?: string;
  notes?: string;
  consultation?: { type: 'virtual' | 'in-person'; date: string; time: string };
  status: 'Received' | 'Consultation booked' | 'In progress';
};

type OrdersState = {
  orders: Order[];
  requests: MadeToMeasureRequest[];
  addOrder: (o: Order) => void;
  addRequest: (r: MadeToMeasureRequest) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      requests: [],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders.filter((x) => x.id !== o.id)] })),
      addRequest: (r) => set((s) => ({ requests: [r, ...s.requests] })),
    }),
    { name: 'obioma-orders', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
